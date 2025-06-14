import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../supabase"; // Using the singleton implementation

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
        console.log("[useCompany] user.id:", user.id);

        // Fetch companies the user is a member of
        const { data: companyMemberships, error: companyError } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id);

        console.log("[useCompany] companyMemberships:", companyMemberships);

        if (companyError) throw companyError;

        if (companyMemberships?.length) {
          const companyIds = companyMemberships.map(
            (membership) => membership.company_id
          );

          // Fetch company details
          const { data: companies, error: companiesError } = await supabase
            .from("companies")
            .select("*")
            .in("id", companyIds);

          console.log("[useCompany] companies:", companies);

          if (companiesError) throw companiesError;

          setUserCompanies(companies || []);

          // Set current company to first one if not already set
          if (companies?.length && !currentCompany) {
            setCurrentCompany(companies[0]);
            console.log("[useCompany] setCurrentCompany:", companies[0]);
          }

          // Fetch teams regardless of current company state
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
              .in("id", teamIds);

            if (teamsError) throw teamsError;

            setUserTeams(teams || []);

            // Handle team-company relationship in a separate effect
            if (!currentCompany && companies?.length && teams?.length) {
              // If no current company but we have teams, find a matching company
              const firstTeam = teams[0];
              const teamCompany = companies.find(c => c.id === firstTeam.company_id);
              
              if (teamCompany) {
                setCurrentCompany(teamCompany);
                setCurrentTeam(firstTeam);
                console.log("[useCompany] Initial setup - Company:", teamCompany, "Team:", firstTeam);
              }
            } else if (currentCompany && teams?.length && !currentTeam) {
              // If we have a company but no team, find teams for this company
              const companyTeams = teams.filter(t => t.company_id === currentCompany.id);
              if (companyTeams.length > 0) {
                setCurrentTeam(companyTeams[0]);
                console.log("[useCompany] Setting initial team:", companyTeams[0]);
              }
            }
          }
        } else {
          console.log("[useCompany] No company memberships found for user.");
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(err instanceof Error ? err : new Error("Error fetching company data"));
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user]); // Remove currentCompany?.id from dependencies

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

  // Ensure currentCompany always matches the company_id of the currentTeam, if set
  // Only run this effect when currentTeam changes, not on every render
  useEffect(() => {
    // Skip if no team or no companies
    if (!currentTeam || userCompanies.length === 0) return;
    
    // Skip if we already have the correct company selected
    if (currentCompany?.id === currentTeam.company_id) return;
    
    console.log("[useCompany] Team changed, syncing company...");
    
    const matchingCompany = userCompanies.find(
      (c) => c.id === currentTeam.company_id
    );
    
    if (matchingCompany) {
      console.log("[useCompany] Syncing company to match team:", matchingCompany.name);
      setCurrentCompany(matchingCompany);
    }
  }, [currentTeam?.id]); // Only depend on the team ID, not the entire objects

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
