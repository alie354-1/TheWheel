import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/hooks/useAuth";

interface Invitation {
  id: string;
  company_id: string;
  company_name: string;
  role: string;
  title: string;
  department: string;
  invitation_status: string;
}

export default function PendingInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvitations();
    // eslint-disable-next-line
  }, [user]);

  async function fetchInvitations() {
    setLoading(true);
    setError("");
    try {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from("company_members")
        .select("id, company_id, role, title, department, invitation_status, companies(name)")
        .eq("user_email", user.email)
        .is("user_id", null)
        .eq("invitation_status", "pending");
      if (error) throw error;
      setInvitations(
        (data || []).map((inv: any) => ({
          id: inv.id,
          company_id: inv.company_id,
          company_name: inv.companies?.name || "",
          role: inv.role,
          title: inv.title,
          department: inv.department,
          invitation_status: inv.invitation_status,
        }))
      );
    } catch (e: any) {
      setError(e.message || "Failed to load invitations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    if (!user?.id) return;
    setError("");
    try {
      const { error } = await supabase
        .from("company_members")
        .update({ user_id: user.id, invitation_status: "accepted" })
        .eq("id", id);
      if (error) throw error;
      fetchInvitations();
    } catch (e: any) {
      setError(e.message || "Failed to accept invitation.");
    }
  }

  async function handleReject(id: string) {
    setError("");
    try {
      const { error } = await supabase
        .from("company_members")
        .update({ invitation_status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      fetchInvitations();
    } catch (e: any) {
      setError(e.message || "Failed to reject invitation.");
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6">Pending Company Invitations</h2>
      {error && (
        <div className="mb-4 rounded bg-red-100 text-red-700 p-2">{error}</div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : invitations.length === 0 ? (
        <div className="text-gray-500">No pending invitations.</div>
      ) : (
        <ul className="space-y-4">
          {invitations.map((inv) => (
            <li key={inv.id} className="bg-white shadow rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-gray-900">{inv.company_name || inv.company_id}</div>
                <div className="text-sm text-gray-600">
                  Role: {inv.role}
                  {inv.title && <> &mdash; {inv.title}</>}
                  {inv.department && <> &mdash; {inv.department}</>}
                </div>
              </div>
              <div className="mt-3 sm:mt-0 flex gap-2">
                <button
                  onClick={() => handleAccept(inv.id)}
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(inv.id)}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
