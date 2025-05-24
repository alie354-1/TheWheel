import React, { useEffect, useState } from "react";
import { workspaceTemplateService, WorkspaceTemplate } from "../services/workspaceTemplate.service";
import WorkspaceContainer, { WorkspaceTab, WorkspaceSidebarItem } from "./workspace/WorkspaceContainer";
import AnalyticsPanel from "../components/dashboard/AnalyticsPanel";
import {
  getAllDomains,
  updateDomain,
  createDomain,
  deleteDomain
} from "../services/domain.service";
import { BusinessDomain } from "../types/domain.types";

/**
 * Featured workspace items palette
 * Only include components that exist and can be rendered without required props.
 */
const FEATURED_TABS: { id: string; title: string; content: React.ReactNode }[] = [
  { id: "analytics", title: "Analytics", content: <AnalyticsPanel /> },
  { id: "tasks", title: "Task Manager", content: <div>Task Manager (placeholder)</div> },
  { id: "recommendations", title: "Recommendations", content: <div>Recommendations (placeholder)</div> },
];

const FEATURED_SIDEBAR_ITEMS: { id: string; title: string }[] = [
  { id: "analyticsSidebar", title: "Analytics" },
  { id: "tasksSidebar", title: "Tasks" },
  { id: "recommendationsSidebar", title: "Recommendations" },
];

/**
 * WorkspaceTemplateManager
 * Admin UI for managing workspace templates and business domains.
 */
const WorkspaceTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null);
  const [form, setForm] = useState<{ name: string; description?: string; layout: any; domainId?: string }>({ name: "", description: "", layout: { tabs: [], sidebarItems: [] }, domainId: undefined });
  const [isEditing, setIsEditing] = useState(false);
  const [dragTabIndex, setDragTabIndex] = useState<number | undefined>(undefined);
  const [dragSidebarIndex, setDragSidebarIndex] = useState<number | undefined>(undefined);

  // Business domain state
  const [domains, setDomains] = useState<BusinessDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<BusinessDomain | null>(null);
  const [domainForm, setDomainForm] = useState<{ name: string; description: string; color: string; icon: string }>({ name: "", description: "", color: "#e0e7ff", icon: "" });
  const [isDomainEditing, setIsDomainEditing] = useState(false);

  useEffect(() => {
    async function seedAndLoad() {
      await workspaceTemplateService.seedDefaultTemplates();
      loadTemplates();
      loadDomains();
    }
    seedAndLoad();
  }, []);

  async function loadTemplates() {
    const data = await workspaceTemplateService.getTemplates();
    setTemplates(data);
  }

  async function loadDomains() {
    const data = await getAllDomains();
    setDomains(data);
  }

  // Business domain handlers
  function handleDomainInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setDomainForm({ ...domainForm, [e.target.name]: e.target.value });
  }
  function handleDomainEdit(domain: BusinessDomain) {
    setSelectedDomain(domain);
    setDomainForm({
      name: domain.name,
      description: domain.description || "",
      color: domain.color || "#e0e7ff",
      icon: domain.icon || "",
    });
    setIsDomainEditing(true);
  }
  async function handleDomainUpdate() {
    if (!selectedDomain) return;
    await updateDomain(selectedDomain.id, domainForm);
    setSelectedDomain(null);
    setDomainForm({ name: "", description: "", color: "#e0e7ff", icon: "" });
    setIsDomainEditing(false);
    loadDomains();
  }
  async function handleDomainCreate() {
    await createDomain({ ...domainForm, order_index: 0 });
    setDomainForm({ name: "", description: "", color: "#e0e7ff", icon: "" });
    loadDomains();
  }
  async function handleDomainDelete(id: string) {
    await deleteDomain(id);
    loadDomains();
  }
  function handleDomainCancel() {
    setSelectedDomain(null);
    setDomainForm({ name: "", description: "", color: "#e0e7ff", icon: "" });
    setIsDomainEditing(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Drag-and-drop handlers for tabs and sidebar items
  function handleTabDragStart(index: number) {
    setDragTabIndex(index);
  }
  function handleTabDrop(index: number) {
    const tabs = [...(form.layout.tabs || [])];
    if (dragTabIndex === undefined || dragTabIndex === index) return;
    const [removed] = tabs.splice(dragTabIndex, 1);
    tabs.splice(index, 0, removed);
    setForm({ ...form, layout: { ...form.layout, tabs } });
    setDragTabIndex(undefined);
  }
  function handleSidebarDragStart(index: number) {
    setDragSidebarIndex(index);
  }
  function handleSidebarDrop(index: number) {
    const sidebarItems = [...(form.layout.sidebarItems || [])];
    if (dragSidebarIndex === undefined || dragSidebarIndex === index) return;
    const [removed] = sidebarItems.splice(dragSidebarIndex, 1);
    sidebarItems.splice(index, 0, removed);
    setForm({ ...form, layout: { ...form.layout, sidebarItems } });
    setDragSidebarIndex(undefined);
  }

  function handleTabChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const tabs = [...(form.layout.tabs || [])];
    tabs[index] = { ...tabs[index], title: e.target.value };
    setForm({ ...form, layout: { ...form.layout, tabs } });
  }
  function handleSidebarChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const sidebarItems = [...(form.layout.sidebarItems || [])];
    sidebarItems[index] = { ...sidebarItems[index], title: e.target.value };
    setForm({ ...form, layout: { ...form.layout, sidebarItems } });
  }
  function addTabFromPalette(tab: typeof FEATURED_TABS[0]) {
    setForm({
      ...form,
      layout: {
        ...form.layout,
        tabs: [
          ...(form.layout.tabs || []),
          { id: `${tab.id}_${Date.now()}`, title: tab.title, content: tab.content },
        ],
      },
    });
  }
  function addSidebarItemFromPalette(item: typeof FEATURED_SIDEBAR_ITEMS[0]) {
    setForm({
      ...form,
      layout: {
        ...form.layout,
        sidebarItems: [
          ...(form.layout.sidebarItems || []),
          { id: `${item.id}_${Date.now()}`, title: item.title, onClick: () => {} },
        ],
      },
    });
  }
  function removeTab(index: number) {
    const tabs = [...(form.layout.tabs || [])];
    tabs.splice(index, 1);
    setForm({ ...form, layout: { ...form.layout, tabs } });
  }
  function removeSidebarItem(index: number) {
    const sidebarItems = [...(form.layout.sidebarItems || [])];
    sidebarItems.splice(index, 1);
    setForm({ ...form, layout: { ...form.layout, sidebarItems } });
  }

  async function handleCreate() {
    // Ensure layout is valid JSON
    let layout = form.layout;
    if (typeof layout === "string") {
      try {
        layout = JSON.parse(layout);
      } catch {
        alert("Layout must be valid JSON");
        return;
      }
    }
    await workspaceTemplateService.createTemplate({ ...form, layout });
    setForm({ name: "", description: "", layout: { tabs: [], sidebarItems: [] }, domainId: undefined });
    loadTemplates();
  }

  function handleEdit(template: WorkspaceTemplate) {
    setSelectedTemplate(template);
    setForm({ name: template.name, description: template.description, layout: template.layout || { tabs: [], sidebarItems: [] }, domainId: template.domainId });
    setIsEditing(true);
  }

  async function handleUpdate() {
    if (!selectedTemplate) return;
    let layout = form.layout;
    if (typeof layout === "string") {
      try {
        layout = JSON.parse(layout);
      } catch {
        alert("Layout must be valid JSON");
        return;
      }
    }
    await workspaceTemplateService.updateTemplate(selectedTemplate.id, { ...form, layout });
    setSelectedTemplate(null);
    setForm({ name: "", description: "", layout: { tabs: [], sidebarItems: [] }, domainId: undefined });
    setIsEditing(false);
    loadTemplates();
  }

  async function handleDelete(id: string) {
    await workspaceTemplateService.deleteTemplate(id);
    loadTemplates();
  }

  function handleCancel() {
    setSelectedTemplate(null);
    setForm({ name: "", description: "", layout: { tabs: [], sidebarItems: [] }, domainId: undefined });
    setIsEditing(false);
  }

  // Apply a template to the selected domain
  async function handleApply(templateId: string) {
    if (!selectedDomain) {
      alert("Please select a business domain to apply the template to.");
      return;
    }
    // TODO: Replace with real companyId/userId from context/auth
    const companyId = "demo-company";
    const userId = "demo-user";
    const ok = await workspaceTemplateService.seedDefaultTemplates(); // Ensure templates exist
    const result = await import("../services/domain.service");
    const success = await result.applyTemplateToDomain(
      selectedDomain.id,
      templateId,
      companyId,
      userId
    );
    if (success) {
      alert(`Template applied to domain "${selectedDomain.name}" successfully.`);
    } else {
      alert("Failed to apply template. See console for details.");
    }
  }

  // Live preview using WorkspaceContainer
  const previewDomain = selectedDomain || {
    id: "preview",
    name: "Preview Domain",
    description: "",
    icon: "",
    color: "#e0e7ff",
    order_index: 0,
    created_at: "",
    updated_at: "",
  };

  // Identify base templates (those with "Workspace" in the name and no companyId/userId)
  const baseTemplates = templates.filter(
    t => t.name.endsWith("Workspace") && !t.companyId && !t.userId
  );

  function handleUseBaseTemplate(base: WorkspaceTemplate) {
    setForm({
      name: "",
      description: base.description,
      layout: JSON.parse(JSON.stringify(base.layout)), // Deep copy
      domainId: undefined,
    });
    setIsEditing(false);
    setSelectedTemplate(null);
  }

  return (
    <div>
      <h2>Workspace Template Manager</h2>
      <div style={{ marginBottom: 32, padding: 16, background: "#f8fafc", borderRadius: 8 }}>
        <h3>Business Domains</h3>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <ul>
              {domains.map(domain => (
                <li key={domain.id} style={{ marginBottom: 8, padding: 8, border: "1px solid #e5e7eb", borderRadius: 6, background: selectedDomain?.id === domain.id ? "#e0e7ff" : "#fff" }}>
                  <span style={{ fontWeight: 600 }}>{domain.name}</span>
                  <span style={{ marginLeft: 8, color: "#64748b" }}>{domain.description}</span>
                  <span style={{ marginLeft: 8, color: domain.color || "#e0e7ff" }}>{domain.icon}</span>
                  <button style={{ marginLeft: 8 }} onClick={() => handleDomainEdit(domain)}>Edit</button>
                  <button style={{ marginLeft: 8 }} onClick={() => handleDomainDelete(domain.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h4>{isDomainEditing ? "Edit Domain" : "Add Domain"}</h4>
            <input name="name" placeholder="Domain Name" value={domainForm.name} onChange={handleDomainInputChange} />
            <input name="description" placeholder="Description" value={domainForm.description} onChange={handleDomainInputChange} />
            <input name="color" type="color" value={domainForm.color} onChange={handleDomainInputChange} />
            <input name="icon" placeholder="Icon (emoji)" value={domainForm.icon} onChange={handleDomainInputChange} />
            {isDomainEditing ? (
              <>
                <button onClick={handleDomainUpdate}>Update Domain</button>
                <button onClick={handleDomainCancel}>Cancel</button>
              </>
            ) : (
              <button onClick={handleDomainCreate}>Add Domain</button>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Start from a Base Template</h3>
        <div style={{ display: "flex", gap: 24 }}>
          {baseTemplates.map(base => (
            <div key={base.id} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: 12, minWidth: 220 }}>
              <strong>{base.name}</strong>
              <div style={{ fontSize: 12, color: "#64748b" }}>{base.description}</div>
              <div style={{ margin: "8px 0" }}>
                <WorkspaceContainer
                  domain={previewDomain}
                  title={base.name}
                  subtitle={base.description}
                  tabs={base.layout.tabs || []}
                  sidebarItems={base.layout.sidebarItems || []}
                >
                  <div>Preview Content Area</div>
                </WorkspaceContainer>
              </div>
              <button onClick={() => handleUseBaseTemplate(base)}>Use as Starting Point</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <input
          name="name"
          placeholder="Template Name"
          value={form.name}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleInputChange}
        />
        <div>
          <h4>Add Featured Tabs</h4>
          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            {FEATURED_TABS.map(tab => (
              <button key={tab.id} onClick={() => addTabFromPalette(tab)}>{tab.title}</button>
            ))}
          </div>
          <h4>Tabs (Drag to reorder)</h4>
          <ul>
            {(form.layout.tabs || []).map((tab: WorkspaceTab, idx: number) => (
              <li
                key={tab.id}
                draggable
                onDragStart={() => handleTabDragStart(idx)}
                onDrop={() => handleTabDrop(idx)}
                onDragOver={e => e.preventDefault()}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <input value={tab.title} onChange={e => handleTabChange(e, idx)} />
                <button onClick={() => removeTab(idx)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Add Featured Sidebar Items</h4>
          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            {FEATURED_SIDEBAR_ITEMS.map(item => (
              <button key={item.id} onClick={() => addSidebarItemFromPalette(item)}>{item.title}</button>
            ))}
          </div>
          <h4>Sidebar Items (Drag to reorder)</h4>
          <ul>
            {(form.layout.sidebarItems || []).map((item: WorkspaceSidebarItem, idx: number) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => handleSidebarDragStart(idx)}
                onDrop={() => handleSidebarDrop(idx)}
                onDragOver={e => e.preventDefault()}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <input value={item.title} onChange={e => handleSidebarChange(e, idx)} />
                <button onClick={() => removeSidebarItem(idx)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        {/* Layout editor as JSON for advanced users */}
        <textarea
          name="layout"
          placeholder="Layout (JSON, advanced)"
          value={typeof form.layout === "string" ? form.layout : JSON.stringify(form.layout, null, 2)}
          onChange={e => setForm({ ...form, layout: e.target.value })}
          style={{ width: "100%", minHeight: 80, marginTop: 8 }}
        />
        {isEditing ? (
          <>
            <button onClick={handleUpdate}>Update Template</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={handleCreate}>Create Template</button>
        )}
      </div>
      <hr />
      <h3>Existing Templates</h3>
      <ul>
        {templates.map(t => (
          <li key={t.id}>
            <strong>{t.name}</strong> - {t.description}
            <button onClick={() => handleEdit(t)}>Edit</button>
            <button onClick={() => handleDelete(t.id)}>Delete</button>
            <button onClick={() => handleApply(t.id)}>Apply</button>
          </li>
        ))}
      </ul>
      <hr />
      <h3>Live Preview</h3>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, margin: 8, padding: 8 }}>
        <WorkspaceContainer
          domain={previewDomain}
          title={form.name || "Preview Workspace"}
          subtitle={form.description}
          tabs={form.layout.tabs || []}
          sidebarItems={form.layout.sidebarItems || []}
        >
          <div>Preview Content Area</div>
        </WorkspaceContainer>
      </div>
    </div>
  );
};

export default WorkspaceTemplateManager;
