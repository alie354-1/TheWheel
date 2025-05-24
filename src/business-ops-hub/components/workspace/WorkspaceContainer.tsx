import React, { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessDomain } from "../../types/domain.types";
import { workspaceTemplateService, WorkspaceTemplate } from "../../services/workspaceTemplate.service";

export interface WorkspaceTab {
  id: string;
  title: string;
  icon?: string;
  content: ReactNode;
}

export interface WorkspaceSidebarItem {
  id: string;
  title: string;
  icon?: string;
  onClick: () => void;
  active?: boolean;
}

export interface WorkspaceContainerProps {
  domain: BusinessDomain;
  title: string;
  subtitle?: string;
  tabs?: WorkspaceTab[];
  sidebarItems?: WorkspaceSidebarItem[];
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
  actions?: ReactNode;
  children?: ReactNode;
  templateId?: string; // NEW: If provided, load layout from template
}

import { useCompany } from "../../../lib/hooks/useCompany";

/**
 * Context adaptation logic using current company context.
 * Adapts the workspace domain properties (e.g., color, title) based on company settings.
 */
function useContextAdaptation(domain: BusinessDomain) {
  const { currentCompany } = useCompany();

  // Example: Adapt color and title based on company context if available
  if (currentCompany) {
    return {
      ...domain,
      name: currentCompany.name ? `${domain.name} – ${currentCompany.name}` : domain.name,
    };
  }
  return domain;
}

/**
 * WorkspaceContainer component - provides a consistent layout for domain workspaces.
 * Now supports modular templates and context adaptation.
 */
const WorkspaceContainer: React.FC<WorkspaceContainerProps> = ({
  domain,
  title,
  subtitle,
  tabs = [],
  sidebarItems = [],
  defaultTabId,
  onTabChange,
  actions,
  children,
  templateId,
}) => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState<string>(defaultTabId || (tabs[0]?.id || ""));
  const [template, setTemplate] = useState<WorkspaceTemplate | null>(null);
  const [modularTabs, setModularTabs] = useState<WorkspaceTab[]>(tabs);
  const [modularSidebar, setModularSidebar] = useState<WorkspaceSidebarItem[]>(sidebarItems);

  // Context adaptation (placeholder)
  const adaptedDomain = useContextAdaptation(domain);

  // Load template if templateId is provided
  useEffect(() => {
    async function fetchTemplate() {
      if (templateId) {
        const allTemplates = await workspaceTemplateService.getTemplates();
        const found = allTemplates.find((t) => t.id === templateId);
        setTemplate(found || null);

        // If template has layout, apply it to tabs/sidebar
        if (found && found.layout) {
          // Assume layout has { tabs, sidebarItems }
          setModularTabs(found.layout.tabs || []);
          setModularSidebar(found.layout.sidebarItems || []);
          // Optionally, set defaultTabId from template
          if (found.layout.tabs && found.layout.tabs.length > 0) {
            setActiveTabId(found.layout.tabs[0].id);
          }
        }
      } else {
        setTemplate(null);
        setModularTabs(tabs);
        setModularSidebar(sidebarItems);
      }
    }
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, tabs, sidebarItems]);

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const activeTab = modularTabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Workspace Header */}
      <div
        className="flex justify-between items-center p-4 border-b"
        style={{ backgroundColor: adaptedDomain.color || "#f3f4f6" }}
      >
        <div className="flex items-center">
          <button
            onClick={() => navigate("/business-ops-hub")}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (if items provided) */}
        {modularSidebar.length > 0 && (
          <div className="w-64 border-r bg-white p-4 overflow-y-auto">
            <div className="space-y-1">
              {modularSidebar.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md ${
                    item.active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs (if provided) */}
          {modularTabs.length > 0 && (
            <div className="flex border-b bg-white">
              {modularTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTabId === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  {tab.title}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab ? activeTab.content : children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceContainer;
