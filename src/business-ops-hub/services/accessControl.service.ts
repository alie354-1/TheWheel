/**
 * Access Control Service for Business Operations Hub
 * Handles team invitation, role assignment, and access control logic.
 */

export type TeamRole = "admin" | "member" | "viewer";

export type TeamMember = {
  id: string;
  email: string;
  role: TeamRole;
  invited: boolean;
};

class AccessControlService {
  private team: TeamMember[] = [
    { id: "1", email: "founder@company.com", role: "admin", invited: false },
  ];

  /**
   * Get all team members.
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    // TODO: Replace with backend API call
    return this.team;
  }

  /**
   * Invite a new user to the team.
   */
  async inviteUser(email: string, role: TeamRole): Promise<TeamMember> {
    // TODO: Integrate with backend invitation API
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      invited: true,
    };
    this.team.push(newMember);
    return newMember;
  }

  /**
   * Assign a new role to a team member.
   */
  async assignRole(userId: string, role: TeamRole): Promise<boolean> {
    // TODO: Integrate with backend role update API
    const idx = this.team.findIndex(m => m.id === userId);
    if (idx === -1) return false;
    this.team[idx].role = role;
    return true;
  }

  /**
   * Remove a user from the team.
   */
  async removeUser(userId: string): Promise<boolean> {
    // TODO: Integrate with backend remove API
    const idx = this.team.findIndex(m => m.id === userId);
    if (idx === -1) return false;
    this.team.splice(idx, 1);
    return true;
  }
}

export const accessControlService = new AccessControlService();
