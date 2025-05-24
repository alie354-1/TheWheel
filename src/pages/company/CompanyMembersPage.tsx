import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../lib/store";
import { useNavigate } from "react-router-dom";
import TeamManagement from "../../components/TeamManagement";
import CompanyRoleManager from "../../components/company/CompanyRoleManager";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  title: string;
  department: string;
  user_email?: string;
}
import { Building2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Company {
  id: string;
  name: string;
}

interface CompanyMember {
  id: string;
  user_id: string;
  role: string;
  user_email?: string;
  title?: string;
  department?: string;
  invitation_status?: string;
}

export default function CompanyMembersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadCompany();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (company) {
      loadMembers();
    }
    // eslint-disable-next-line
  }, [company]);

  const loadCompany = async () => {
    setLoading(true);
    setError("");
    try {
      // Get the latest company where user is a member
      const { data: memberships, error: memberError } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user?.id);

      if (memberError) throw memberError;
      if (!memberships || memberships.length === 0) {
        setError("No company found for user.");
        setLoading(false);
        return;
      }

      const companyId = memberships[0].company_id;
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", companyId)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);
    } catch (err: any) {
      setError(err.message || "Failed to load company.");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!company) return;
    try {
      // Fix: Ensure correct filter and add error logging
      const { data: members, error } = await supabase
        .from("company_members")
        .select("id, user_id, role, user_email, title, department, invitation_status")
        .eq("company_id", company.id);

      if (error) {
        console.error("Error loading company members:", error);
        throw error;
      }
      // Ensure all required fields for TeamMember are present
      setMembers(
        (members || []).map((m) => ({
          id: m.id,
          user_id: m.user_id,
          role: m.role,
          user_email: m.user_email || "",
          title: m.title ?? "",
          department: m.department ?? "",
        }))
      );
    } catch (err: any) {
      setError(err.message || "Failed to load members.");
      console.error("Failed to load members:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading company members...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-red-600">{error}</span>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-8">
        <div className="flex items-center mb-6">
          <Building2 className="h-10 w-10 text-indigo-600 mr-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            {company.name} &mdash; Team Members
          </h2>
        </div>
        {/* Company Role Manager */}
        <CompanyRoleManager companyId={company.id} />
        <TeamManagement
          companyId={company.id}
          members={members}
          onMemberAdded={loadMembers}
          onMemberRemoved={loadMembers}
        />
        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
