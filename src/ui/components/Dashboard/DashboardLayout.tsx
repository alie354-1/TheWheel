/**
 * Dashboard Layout Component
 * 
 * A flexible dashboard layout component with support for metrics, charts, and widgets.
 * Part of the UI rewrite to implement a more modern and consistent design.
 */

import React from 'react';
import { colors, spacing, shadows, borderRadius } from '../../design-system';
import Card from '../Card';

export interface MetricProps {
  /** Metric title */
  title: string;
  /** Metric value */
  value: string | number;
  /** Previous value for comparison */
  previousValue?: string | number;
  /** Percentage change */
  change?: number;
  /** Whether the change is positive (true), negative (false), or neutral (undefined) */
  trend?: boolean;
  /** Metric icon */
  icon?: React.ReactNode;
  /** Metric description */
  description?: string;
  /** Metric footer */
  footer?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export interface WidgetProps {
  /** Widget title */
  title?: string;
  /** Widget content */
  children: React.ReactNode;
  /** Widget width (in grid columns, 1-12) */
  width?: number;
  /** Widget height (in grid rows) */
  height?: number;
  /** Whether the widget is collapsible */
  collapsible?: boolean;
  /** Whether the widget is collapsed */
  collapsed?: boolean;
  /** Toggle collapse function */
  onToggleCollapse?: () => void;
  /** Whether the widget is loading */
  loading?: boolean;
  /** Widget actions (e.g., buttons, icons) */
  actions?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export interface DashboardLayoutProps {
  /** Dashboard title */
  title?: string;
  /** Dashboard description */
  description?: string;
  /** Dashboard children */
  children: React.ReactNode;
  /** Number of columns in the grid (default: 12) */
  columns?: number;
  /** Gap between grid items */
  gap?: string;
  /** Dashboard actions (e.g., buttons, filters) */
  actions?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Metric component for displaying key metrics
 */
export const Metric: React.FC<MetricProps> = ({
  title,
  value,
  previousValue,
  change,
  trend,
  icon,
  description,
  footer,
  className = '',
  style = {},
}) => {
  const metricStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  const iconStyle: React.CSSProperties = {
    marginBottom: spacing[2],
    color: colors.primary[500],
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: spacing[1],
    display: 'flex',
    alignItems: 'baseline',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.neutral[600],
    marginBottom: spacing[2],
  };

  const changeStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: trend === true ? colors.success[500] : trend === false ? colors.error[500] : colors.neutral[500],
    display: 'flex',
    alignItems: 'center',
    marginLeft: spacing[2],
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: colors.neutral[500],
    marginBottom: spacing[2],
  };

  return (
    <Card className={`metric ${className}`} padding={spacing[4]}>
      <div style={metricStyle}>
        {icon && <div style={iconStyle}>{icon}</div>}
        <div style={titleStyle}>{title}</div>
        <div style={valueStyle}>
          <span>{value}</span>
          {change !== undefined && (
            <span style={changeStyle}>
              {trend === true ? '↑' : trend === false ? '↓' : ''}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        {description && <div style={descriptionStyle}>{description}</div>}
        {footer && <div className="metric-footer">{footer}</div>}
      </div>
    </Card>
  );
};

/**
 * Widget component for dashboard content
 */
export const Widget: React.FC<WidgetProps> = ({
  title,
  children,
  width = 3,
  height = 1,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  loading = false,
  actions,
  className = '',
  style = {},
}) => {
  const widgetStyle: React.CSSProperties = {
    gridColumn: `span ${width}`,
    gridRow: `span ${height}`,
    minHeight: '100px',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: title ? spacing[4] : 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const contentStyle: React.CSSProperties = {
    display: collapsed ? 'none' : 'block',
    position: 'relative',
  };

  const loadingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: loading ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  };

  return (
    <div className={`widget ${className}`} style={widgetStyle}>
      <Card height="100%">
        {(title || actions || collapsible) && (
          <div className="widget-header" style={headerStyle}>
            {title && <h3 style={titleStyle}>{title}</h3>}
            <div style={actionsStyle}>
              {actions}
              {collapsible && (
                <button
                  onClick={onToggleCollapse}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: spacing[1],
                  }}
                >
                  {collapsed ? '▼' : '▲'}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="widget-content" style={contentStyle}>
          {loading && (
            <div style={loadingOverlayStyle}>
              <div>Loading...</div>
            </div>
          )}
          {children}
        </div>
      </Card>
    </div>
  );
};

/**
 * Dashboard layout component
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  description,
  children,
  columns = 12,
  gap = '16px',
  actions,
  className = '',
  style = {},
}) => {
  const dashboardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: spacing[6],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const titleContainerStyle: React.CSSProperties = {
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    marginBottom: description ? spacing[2] : 0,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: colors.neutral[600],
    margin: 0,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    flex: 1,
  };

  return (
    <div className={`dashboard ${className}`} style={dashboardStyle}>
      {/* Dashboard Header */}
      {(title || description || actions) && (
        <div className="dashboard-header" style={headerStyle}>
          <div style={titleContainerStyle}>
            {title && <h2 style={titleStyle}>{title}</h2>}
            {description && <p style={descriptionStyle}>{description}</p>}
          </div>
          {actions && <div style={actionsStyle}>{actions}</div>}
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="dashboard-grid" style={gridStyle}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
