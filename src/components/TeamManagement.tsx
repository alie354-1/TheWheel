import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';

// Helper to log audit events
async function logAuditEvent({
  action,
  target_type,
  target_id,
  details,
  status,
  company_id,
  user_id,
}: {
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  status: string;
  company_id?: string;
  user_id?: string;
}) {
  try {
    await supabase.from("audit_logs").insert({
      action,
      target_type,
      target_id,
      details,
      status,
      company_id,
      user_id,
    });
  } catch (e) {
    // ignore audit log errors
  }
}

interface CompanyRole {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
}

interface TeamMember {
  id: string;
  user_id: string | null;
  role: string;
  title: string;
  department: string;
  user_email?: string;
  invitation_status?: string;
}

interface TeamManagementProps {
  companyId: string;
  members: TeamMember[];
  onMemberAdded: () => void;
  onMemberRemoved: () => void;
}

export default function TeamManagement({ companyId, members, onMemberAdded, onMemberRemoved }: TeamManagementProps) {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberTitle, setNewMemberTitle] = useState('');
  const [newMemberDepartment, setNewMemberDepartment] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [availableRoles, setAvailableRoles] = useState<CompanyRole[]>([]);
  const [defaultRoleId, setDefaultRoleId] = useState<string>("");
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDefaultRole();
    fetchRoles();
    // eslint-disable-next-line
  }, [companyId]);

  async function fetchDefaultRole() {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("company_id", companyId)
        .eq("key", "default_member_role")
        .single();
      if (error) return;
      if (data && data.value) setDefaultRoleId(data.value);
    } catch (e) {
      // ignore
    }
  }

  async function fetchRoles() {
    try {
      const { data, error } = await supabase
        .from('company_roles')
        .select('id, name, description, is_default')
        .eq('company_id', companyId);

      if (error) throw error;
      setAvailableRoles(data || []);
      // Set default role to defaultRoleId if present, else first available
      if (data && data.length > 0) {
        if (defaultRoleId) {
          const defaultRole = data.find((r: CompanyRole) => r.id === defaultRoleId);
          setNewMemberRole(defaultRole ? defaultRole.name : data[0].name);
        } else if (!newMemberRole) {
          setNewMemberRole(data[0].name);
        }
      }
    } catch (e) {
      setAvailableRoles([]);
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAdding(true);

    try {
      // Try to find user by email
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', {
          email: newMemberEmail
        });

      let insertData: any = {
        company_id: companyId,
        role: newMemberRole,
        title: newMemberTitle,
        department: newMemberDepartment,
        user_email: newMemberEmail,
      };

      if (userData && !userError) {
        // User exists, invite as member (accepted)
        insertData.user_id = userData.id;
        insertData.invitation_status = 'accepted';
      } else {
        // User does not exist, create pending invitation
        insertData.user_id = null;
        insertData.invitation_status = 'pending';
      }

      const { error: memberError } = await supabase
        .from('company_members')
        .insert(insertData);

      if (memberError) {
        if (memberError.code === '23505') { // Unique violation
          setError('This user is already a member or invited.');
        } else {
          setError('Failed to add team member. Please try again.');
        }
        return;
      }

      // Audit log: Add member or invite
      await logAuditEvent({
        action: insertData.user_id ? "add_member" : "invite_member",
        target_type: "company_member",
        target_id: newMemberEmail,
        details: {
          role: newMemberRole,
          title: newMemberTitle,
          department: newMemberDepartment,
          invited: !insertData.user_id,
        },
        status: "success",
        company_id: companyId,
        user_id: user?.id,
      });

      // Placeholder: Send invitation email if user does not exist
      if (insertData.user_id === null && insertData.invitation_status === 'pending') {
        sendInvitationEmail(newMemberEmail, newMemberRole, newMemberTitle, newMemberDepartment);
      }

      // Clear form
      setNewMemberEmail('');
      setNewMemberRole(availableRoles[0]?.name || '');
      setNewMemberTitle('');
      setNewMemberDepartment('');
      onMemberAdded();
    } catch (error) {
      console.error('Error adding team member:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Placeholder for sending invitation email
  function sendInvitationEmail(email: string, role: string, title: string, department: string) {
    // In production, integrate with an email service here
    // For now, just log or show a message
    // eslint-disable-next-line no-alert
    alert(
      `Invitation email would be sent to ${email} for role "${role}"${title ? `, title "${title}"` : ""}${department ? `, department "${department}"` : ""}.`
    );
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Audit log: Remove member
      await logAuditEvent({
        action: "remove_member",
        target_type: "company_member",
        target_id: memberId,
        details: {},
        status: "success",
        company_id: companyId,
        user_id: user?.id,
      });

      onMemberRemoved();
    } catch (error) {
      console.error('Error removing team member:', error);
      setError('Failed to remove team member. Please try again.');
    }
  };

  // Filtered members based on search
  const filteredMembers = members.filter((member) => {
    const q = search.toLowerCase();
    return (
      member.user_email?.toLowerCase().includes(q) ||
      member.role?.toLowerCase().includes(q) ||
      member.title?.toLowerCase().includes(q) ||
      member.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search/Filter Bar */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search team members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2 px-3 py-2 rounded border border-gray-300 w-full sm:w-64"
        />
      </div>
      {/* Add Member Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Add Team Member
          </h3>
        </div>
        <form onSubmit={handleAddMember} className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                required
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {availableRoles.length === 0 ? (
                  <option value="">No roles available</option>
                ) : (
                  availableRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
              {availableRoles.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {availableRoles.find(r => r.name === newMemberRole)?.description}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newMemberTitle}
                onChange={(e) => setNewMemberTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                type="text"
                id="department"
                value={newMemberDepartment}
                onChange={(e) => setNewMemberDepartment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAdding}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>

      {/* Team Members List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Members
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <li key={member.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.user_email || 'User')}`}
                        alt=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user_email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {member.title} • {member.role}
                      </p>
                      {member.department && (
                        <p className="text-sm text-gray-500 truncate">
                          {member.department}
                        </p>
                      )}
                      {member.invitation_status === 'pending' && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                          Invitation Pending
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {member.invitation_status === 'pending' ? (
                        <>
                          <button
                            onClick={() => {
                              // Placeholder for resend invitation (future: send email)
                              alert('Resend invitation feature coming soon.');
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Revoke
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
