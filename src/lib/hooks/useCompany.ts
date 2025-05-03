import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../supabase";

type Company = {
  id: string;
  name: string;
  slug?: string;
  organization_id?: string | null;
  status?: string;
};

type Team = {
  id: string;
  name: string;
  company_id: string;
};

export const useCompany = () => {
  const { user } = useAuth();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setCurrentCompany(null);
      setCurrentTeam(null);
      setUserCompanies([]);
      setUserTeams([]);
      setLoading(false);
      return;
    }

    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch companies the user is a member of
        const { data: companyMemberships, error: companyError } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id);

        if (companyError) throw companyError;

        if (companyMemberships?.length) {
          const companyIds = companyMemberships.map(
            (membership) => membership.company_id
          );

          // Fetch company details
          const { data: companies, error: companiesError } = await supabase
            .from("companies")
            .select("*")
            .in("id", companyIds)
            .eq("status", "active");

          if (companiesError) throw companiesError;

          setUserCompanies(companies || []);

          // Set current company to first one if not already set
          if (companies?.length && !currentCompany) {
            setCurrentCompany(companies[0]);
          }

          // If there's a current company, fetch teams
          if (currentCompany) {
            const { data: teamMemberships, error: teamError } = await supabase
              .from("team_members")
              .select("team_id")
              .eq("user_id", user.id);

            if (teamError) throw teamError;

            if (teamMemberships?.length) {
              const teamIds = teamMemberships.map(
                (membership) => membership.team_id
              );

              // Fetch team details
              const { data: teams, error: teamsError } = await supabase
                .from("teams")
                .select("*")
                .in("id", teamIds)
                .eq("company_id", currentCompany.id);

              if (teamsError) throw teamsError;

              setUserTeams(teams || []);

              // Set current team to first one if not already set
              if (teams?.length && !currentTeam) {
                setCurrentTeam(teams[0]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(err instanceof Error ? err : new Error("Error fetching company data"));
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user, currentCompany?.id]);

  const switchCompany = async (companyId: string) => {
    if (!user) return;

    const company = userCompanies.find((c) => c.id === companyId);
    
    if (company) {
      setCurrentCompany(company);
      setCurrentTeam(null);
      
      // Save user preference
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          key: "last_company_id",
          value: companyId
        });
    }
  };

  const switchTeam = async (teamId: string) => {
    if (!user || !currentCompany) return;

    const team = userTeams.find((t) => t.id === teamId);
    
    if (team) {
      setCurrentTeam(team);
      
      // Save user preference
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          key: "last_team_id",
          value: teamId
        });
    }
  };

  return {
    currentCompany,
    currentTeam,
    userCompanies,
    userTeams,
    loading,
    error,
    switchCompany,
    switchTeam
  };
};
