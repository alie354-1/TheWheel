import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Canonical permissions list (should match backend logic)
const AVAILABLE_PERMISSIONS = [
  { key: "read:journey", label: "Read Journey" },
  { key: "write:journey", label: "Write Journey" },
  { key: "admin:company", label: "Admin Company" },
  { key: "manage:billing", label: "Manage Billing" },
  { key: "moderate:tools", label: "Moderate Tools" },
];

interface CompanyRole {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
}

interface CompanyRoleManagerProps {
  companyId: string;
  onRolesUpdated?: () => void;
}

export default function CompanyRoleManager({ companyId, onRolesUpdated }: CompanyRoleManagerProps) {
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [defaultRoleId, setDefaultRoleId] = useState<string>("");
  const [savingDefault, setSavingDefault] = useState(false);

  useEffect(() => {
    fetchRolesAndPermissions();
    fetchDefaultRole();
    // eslint-disable-next-line
  }, [companyId]);

  async function fetchRolesAndPermissions() {
    setLoading(true);
    setError("");
    try {
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("company_roles")
        .select("id, name, description, is_default")
        .eq("company_id", companyId);

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);

      // Fetch permissions for all roles
      const { data: permsData, error: permsError } = await supabase
        .from("company_permissions")
        .select("role_id, permission")
        .eq("company_id", companyId);

      if (permsError) throw permsError;

      // Map: role_id -> [permission, ...]
      const permsMap: Record<string, string[]> = {};
      (permsData || []).forEach((row: { role_id: string; permission: string }) => {
        if (!permsMap[row.role_id]) permsMap[row.role_id] = [];
        permsMap[row.role_id].push(row.permission);
      });
      setRolePermissions(permsMap);
    } catch (e: any) {
      setError(e.message || "Failed to load roles/permissions.");
    } finally {
      setLoading(false);
    }
  }

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

  async function handleSetDefaultRole(roleId: string) {
    setSavingDefault(true);
    setError("");
    try {
      // Upsert default_member_role in app_settings
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          company_id: companyId,
          key: "default_member_role",
          value: roleId,
        }, { onConflict: "company_id,key" });
      if (error) throw error;
      setDefaultRoleId(roleId);
    } catch (e: any) {
      setError(e.message || "Failed to set default role.");
    } finally {
      setSavingDefault(false);
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const { error } = await supabase
        .from("company_roles")
        .insert({
          company_id: companyId,
          name: newRoleName,
          description: newRoleDescription,
          is_default: false,
        });
      if (error) throw error;
      setNewRoleName("");
      setNewRoleDescription("");
      fetchRolesAndPermissions();
      if (onRolesUpdated) onRolesUpdated();
    } catch (e: any) {
      setError(e.message || "Failed to create role.");
    } finally {
      setCreating(false);
    }
  }

  // Toggle permission for a role
  async function handleTogglePermission(roleId: string, permission: string, checked: boolean) {
    setSaving(roleId + permission);
    setError("");
    try {
      if (checked) {
        // Add permission
        const { error } = await supabase
          .from("company_permissions")
          .insert({
            company_id: companyId,
            role_id: roleId,
            permission,
          });
        if (error) throw error;
      } else {
        // Remove permission
        const { error } = await supabase
          .from("company_permissions")
          .delete()
          .eq("company_id", companyId)
          .eq("role_id", roleId)
          .eq("permission", permission);
        if (error) throw error;
      }
      // Refresh permissions
      await fetchRolesAndPermissions();
    } catch (e: any) {
      setError(e.message || "Failed to update permissions.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Company Roles</h3>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {/* Default Role Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Role for New Members
        </label>
        <select
          value={defaultRoleId}
          onChange={e => handleSetDefaultRole(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 w-full sm:w-64"
          disabled={savingDefault || loading}
        >
          <option value="">Select default role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {defaultRoleId && (
          <div className="text-xs text-gray-500 mt-1">
            {roles.find(r => r.id === defaultRoleId)?.description}
          </div>
        )}
      </div>
      <form onSubmit={handleCreateRole} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Role Name"
          value={newRoleName}
          onChange={e => setNewRoleName(e.target.value)}
          required
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newRoleDescription}
          onChange={e => setNewRoleDescription(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={creating || !newRoleName}
          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Add Role"}
        </button>
      </form>
      <ul className="divide-y divide-gray-200">
        {roles.map(role => (
          <li key={role.id} className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{role.name}</span>
                {role.is_default && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Default</span>
                )}
                <div className="text-sm text-gray-500">{role.description}</div>
              </div>
              {/* Permissions UI */}
              <div className="flex flex-col gap-1">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label key={perm.key} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={rolePermissions[role.id]?.includes(perm.key) || false}
                      disabled={saving === role.id + perm.key}
                      onChange={e =>
                        handleTogglePermission(role.id, perm.key, e.target.checked)
                      }
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
