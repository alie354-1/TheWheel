import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import TabNavigation, { Tab } from '../components/ui/TabNavigation';

interface Option2LayoutProps {
  sidebar: ReactNode;
  tabs: {
    id: string;
    label: string;
    icon?: string;
    count?: number;
    content: ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

/**
 * Option2Layout - Two-panel layout with sidebar and tabbed main content
 * (Formerly Option4)
 */
const Option2Layout: React.FC<Option2LayoutProps> = ({
  sidebar,
  tabs,
  activeTab,
  onTabChange,
  title = 'Journey Dashboard',
  subtitle,
  isLoading = false
}) => {
  // Convert tabs to the format expected by TabNavigation
  const navigationTabs: Tab[] = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    count: tab.count
  }));

  // Find active tab content
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <DashboardLayout isLoading={isLoading} title={title} subtitle={subtitle}>
      <div className="flex flex-1 h-full">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white flex-shrink-0 h-full overflow-y-auto">
          {sidebar}
        </div>
        
        {/* Main Content with Tabs */}
        <div className="flex-1 overflow-auto p-6">
          {/* Tab Navigation */}
          <TabNavigation 
            tabs={navigationTabs} 
            activeTab={activeTab} 
            onTabChange={onTabChange}
            size="md"
          />
          
          {/* Active Tab Content */}
          <div className="mt-4">
            {activeTabContent}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Option2Layout;
