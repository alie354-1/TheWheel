/**
 * Service for managing workspace templates in the Business Operations Hub.
 * Handles CRUD operations and template application logic using Supabase.
 */

import { supabase } from "../../lib/supabase";

export type WorkspaceTemplate = {
  id: string;
  name: string;
  description?: string;
  layout: any; // Replace 'any' with a more specific type if available
  createdAt: string;
  updatedAt: string;
  companyId?: string;
  userId?: string;
  domainId?: string;
  isShared?: boolean;
};

class WorkspaceTemplateService {
  /**
   * Seed default templates for common business domains.
   * Only inserts if no templates exist.
   */
  async seedDefaultTemplates(): Promise<void> {
    const existing = await this.getTemplates();
    if (existing.length > 0) return;

    const defaults = [
      {
        name: "Finance Workspace",
        description: "Default template for Finance domain",
        layout: {
          tabs: [
            { id: "overview", title: "Overview", content: "Finance Overview" },
            { id: "reports", title: "Reports", content: "Financial Reports" },
          ],
          sidebarItems: [
            { id: "budget", title: "Budget", onClick: () => {} },
            { id: "expenses", title: "Expenses", onClick: () => {} },
          ],
        },
      },
      {
        name: "Marketing Workspace",
        description: "Default template for Marketing domain",
        layout: {
          tabs: [
            { id: "campaigns", title: "Campaigns", content: "Marketing Campaigns" },
            { id: "analytics", title: "Analytics", content: "Marketing Analytics" },
          ],
          sidebarItems: [
            { id: "content", title: "Content", onClick: () => {} },
            { id: "ads", title: "Ads", onClick: () => {} },
          ],
        },
      },
      {
        name: "Operations Workspace",
        description: "Default template for Operations domain",
        layout: {
          tabs: [
            { id: "processes", title: "Processes", content: "Operations Processes" },
            { id: "logistics", title: "Logistics", content: "Logistics" },
          ],
          sidebarItems: [
            { id: "tasks", title: "Tasks", onClick: () => {} },
            { id: "calendar", title: "Calendar", onClick: () => {} },
          ],
        },
      },
      // Add more as needed...
    ];

    for (const tpl of defaults) {
      await this.createTemplate(tpl as any);
    }
  }
  /**
   * Get all workspace templates for the current user/company.
   */
  async getTemplates(): Promise<WorkspaceTemplate[]> {
    const { data, error } = await supabase
      .from("workspace_configurations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch workspace templates:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.configuration?.description || "",
      layout: row.configuration?.layout || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      companyId: row.company_id,
      userId: row.user_id,
      domainId: row.domain_id,
      isShared: row.is_shared,
    }));
  }

  /**
   * Create a new workspace template.
   */
  async createTemplate(template: Omit<WorkspaceTemplate, "id" | "createdAt" | "updatedAt">): Promise<WorkspaceTemplate | null> {
    const { name, description, layout, companyId, userId, domainId, isShared } = template;
    const { data, error } = await supabase
      .from("workspace_configurations")
      .insert([
        {
          name,
          company_id: companyId || null,
          user_id: userId || null,
          domain_id: domainId || null,
          configuration: { description, layout },
          is_shared: isShared || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to create workspace template:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.configuration?.description || "",
      layout: data.configuration?.layout || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      companyId: data.company_id,
      userId: data.user_id,
      domainId: data.domain_id,
      isShared: data.is_shared,
    };
  }

  /**
   * Update an existing workspace template.
   */
  async updateTemplate(id: string, updates: Partial<Omit<WorkspaceTemplate, "id" | "createdAt" | "updatedAt">>): Promise<WorkspaceTemplate | null> {
    // Fetch the existing row to merge configuration
    const { data: existing, error: fetchError } = await supabase
      .from("workspace_configurations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      console.error("Failed to fetch existing workspace template for update:", fetchError);
      return null;
    }

    const newConfig = {
      ...existing.configuration,
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      ...(updates.layout !== undefined ? { layout: updates.layout } : {}),
    };

    const { data, error } = await supabase
      .from("workspace_configurations")
      .update({
        name: updates.name !== undefined ? updates.name : existing.name,
        configuration: newConfig,
        is_shared: updates.isShared !== undefined ? updates.isShared : existing.is_shared,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update workspace template:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.configuration?.description || "",
      layout: data.configuration?.layout || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      companyId: data.company_id,
      userId: data.user_id,
      domainId: data.domain_id,
      isShared: data.is_shared,
    };
  }

  /**
   * Delete a workspace template.
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("workspace_configurations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete workspace template:", error);
      return false;
    }
    return true;
  }

  /**
   * Apply a template to a workspace.
   * @param templateId The template to apply
   * @param workspaceId The workspace to update
   */
  async applyTemplateToWorkspace(templateId: string, workspaceId: string): Promise<void> {
    // TODO: Implement logic to update workspace with template layout
    // This is a placeholder for integration with workspace state management
    return;
  }
}

export const workspaceTemplateService = new WorkspaceTemplateService();
