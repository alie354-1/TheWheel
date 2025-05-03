/**
 * Sidebar Navigation Component
 * 
 * A responsive sidebar navigation component with collapsible sections.
 * Part of the UI rewrite to implement a more modern and consistent design.
 */

import React, { useState } from 'react';
import { colors, spacing, shadows, borderRadius } from '../../design-system';

export interface NavItem {
  /** Item key (unique identifier) */
  key: string;
  /** Item label */
  label: string;
  /** Item icon (React node) */
  icon?: React.ReactNode;
  /** Item URL */
  url?: string;
  /** Whether the item is active */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Child items (for nested navigation) */
  children?: NavItem[];
  /** Whether the section is expanded (for items with children) */
  expanded?: boolean;
  /** Badge content (e.g., notification count) */
  badge?: React.ReactNode | string | number;
  /** Click handler */
  onClick?: (item: NavItem) => void;
}

export interface SidebarProps {
  /** Navigation items */
  items: NavItem[];
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
  /** Toggle collapse function */
  onToggleCollapse?: () => void;
  /** Sidebar width when expanded */
  expandedWidth?: string;
  /** Sidebar width when collapsed */
  collapsedWidth?: string;
  /** Sidebar background color */
  backgroundColor?: string;
  /** Sidebar text color */
  textColor?: string;
  /** Active item background color */
  activeBackgroundColor?: string;
  /** Active item text color */
  activeTextColor?: string;
  /** Hover background color */
  hoverBackgroundColor?: string;
  /** Hover text color */
  hoverTextColor?: string;
  /** Logo component */
  logo?: React.ReactNode;
  /** Footer component */
  footer?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Sidebar navigation component
 */
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onToggleCollapse,
  expandedWidth = '240px',
  collapsedWidth = '64px',
  backgroundColor = colors.neutral[800],
  textColor = colors.neutral[100],
  activeBackgroundColor = colors.primary[500],
  activeTextColor = '#ffffff',
  hoverBackgroundColor = colors.neutral[700],
  hoverTextColor = '#ffffff',
  logo,
  footer,
  className = '',
  style = {},
}) => {
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Toggle section expansion
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if a section is expanded
  const isSectionExpanded = (key: string): boolean => {
    return expandedSections[key] || false;
  };

  // Handle item click
  const handleItemClick = (item: NavItem) => {
    if (item.disabled) return;
    
    if (item.children && item.children.length > 0) {
      toggleSection(item.key);
    } else if (item.onClick) {
      item.onClick(item);
    }
  };

  // Render a navigation item
  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = hasChildren && isSectionExpanded(item.key);
    const isActive = item.active;
    
    const itemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      padding: `${spacing[2]} ${spacing[4]}`,
      paddingLeft: `${parseInt(spacing[4]) + level * 16}px`,
      color: isActive ? activeTextColor : textColor,
      backgroundColor: isActive ? activeBackgroundColor : 'transparent',
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      opacity: item.disabled ? 0.5 : 1,
      borderRadius: borderRadius.md,
      margin: `${spacing[1]} ${spacing[2]}`,
      transition: 'all 0.2s ease',
    };

    const iconStyle: React.CSSProperties = {
      marginRight: collapsed ? 0 : spacing[3],
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
    };

    const labelStyle: React.CSSProperties = {
      display: collapsed ? 'none' : 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      flex: 1,
    };

    const badgeStyle: React.CSSProperties = {
      backgroundColor: colors.primary[400],
      color: '#ffffff',
      borderRadius: '9999px',
      padding: '2px 6px',
      fontSize: '0.75rem',
      marginLeft: spacing[2],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const chevronStyle: React.CSSProperties = {
      marginLeft: spacing[2],
      transition: 'transform 0.2s ease',
      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
      display: collapsed ? 'none' : 'block',
    };

    return (
      <div key={item.key} className="nav-item-container">
        <div
          className={`nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
          style={itemStyle}
          onClick={() => handleItemClick(item)}
        >
          {item.icon && <div style={iconStyle}>{item.icon}</div>}
          <div style={labelStyle}>{item.label}</div>
          {item.badge && !collapsed && (
            <div style={badgeStyle}>{item.badge}</div>
          )}
          {hasChildren && !collapsed && (
            <div style={chevronStyle}>▶</div>
          )}
        </div>
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="nav-children">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Sidebar container style
  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? collapsedWidth : expandedWidth,
    height: '100%',
    backgroundColor,
    color: textColor,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
    boxShadow: shadows.md,
    ...style,
  };

  // Logo container style
  const logoContainerStyle: React.CSSProperties = {
    padding: spacing[4],
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderBottom: `1px solid ${colors.neutral[700]}`,
  };

  // Navigation container style
  const navContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing[2]} 0`,
  };

  // Footer container style
  const footerContainerStyle: React.CSSProperties = {
    padding: spacing[4],
    borderTop: `1px solid ${colors.neutral[700]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
  };

  // Collapse toggle button style
  const collapseButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: textColor,
    cursor: 'pointer',
    padding: spacing[2],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    transition: 'background-color 0.2s ease',
  };

  return (
    <div className={`sidebar ${className} ${collapsed ? 'collapsed' : 'expanded'}`} style={sidebarStyle}>
      {/* Logo */}
      {logo && (
        <div className="sidebar-logo" style={logoContainerStyle}>
          {logo}
        </div>
      )}

      {/* Navigation */}
      <div className="sidebar-nav" style={navContainerStyle}>
        {items.map(item => renderNavItem(item))}
      </div>

      {/* Footer */}
      {footer && (
        <div className="sidebar-footer" style={footerContainerStyle}>
          {footer}
        </div>
      )}

      {/* Collapse Toggle Button */}
      {onToggleCollapse && (
        <div className="sidebar-collapse-toggle" style={footerContainerStyle}>
          <button
            style={collapseButtonStyle}
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
