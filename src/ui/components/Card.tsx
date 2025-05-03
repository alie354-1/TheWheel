/**
 * Card Component
 * 
 * A versatile card component for displaying content with various styling options.
 * Part of the UI rewrite to implement a more modern and consistent design.
 */

import React from 'react';
import { colors, shadows, borderRadius, spacing } from '../design-system';

export interface CardProps {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Card width (default: 100%) */
  width?: string;
  /** Card height (default: auto) */
  height?: string;
  /** Card elevation level (1-5) */
  elevation?: 1 | 2 | 3 | 4 | 5;
  /** Whether the card is hoverable */
  hoverable?: boolean;
  /** Whether the card is selectable */
  selectable?: boolean;
  /** Whether the card is selected */
  selected?: boolean;
  /** Whether the card is draggable */
  draggable?: boolean;
  /** Whether the card has a border */
  bordered?: boolean;
  /** Card border color */
  borderColor?: string;
  /** Card background color */
  backgroundColor?: string;
  /** Card padding */
  padding?: string;
  /** Card margin */
  margin?: string;
  /** Card border radius */
  borderRadius?: string;
  /** Card header actions (e.g., buttons, icons) */
  headerActions?: React.ReactNode;
  /** Card cover image */
  coverImage?: string;
  /** Card cover image alt text */
  coverImageAlt?: string;
  /** Card cover image height */
  coverImageHeight?: string;
  /** Card onClick handler */
  onClick?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Card ID */
  id?: string;
  /** Data attributes */
  'data-testid'?: string;
}

/**
 * Card component for displaying content in a contained, styled container
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  width = '100%',
  height = 'auto',
  elevation = 1,
  hoverable = false,
  selectable = false,
  selected = false,
  draggable = false,
  bordered = true,
  borderColor = colors.neutral[200],
  backgroundColor = '#ffffff',
  padding = spacing[4],
  margin = '0',
  borderRadius: customBorderRadius = borderRadius.lg,
  headerActions,
  coverImage,
  coverImageAlt = '',
  coverImageHeight = '200px',
  onClick,
  className = '',
  style = {},
  id,
  'data-testid': dataTestId,
}) => {
  // Map elevation to shadow
  const getShadow = (level: number) => {
    switch (level) {
      case 1: return shadows.sm;
      case 2: return shadows.md;
      case 3: return shadows.lg;
      case 4: return shadows.xl;
      case 5: return shadows['2xl'];
      default: return shadows.sm;
    }
  };

  // Combine styles
  const cardStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor,
    borderRadius: customBorderRadius,
    boxShadow: getShadow(elevation),
    border: bordered ? `1px solid ${borderColor}` : 'none',
    padding: coverImage ? 0 : padding,
    margin,
    transition: 'all 0.3s ease',
    cursor: (onClick || hoverable) ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  // Hover styles
  if (hoverable) {
    cardStyle.transform = 'translateY(0)';
    cardStyle.boxShadow = getShadow(elevation);
  }

  // Selected styles
  if (selected) {
    cardStyle.borderColor = colors.primary[500];
    cardStyle.borderWidth = '2px';
    cardStyle.boxShadow = getShadow(elevation + 1);
  }

  // Draggable styles
  if (draggable) {
    cardStyle.cursor = 'grab';
  }

  return (
    <div
      id={id}
      className={`card ${className} ${hoverable ? 'hoverable' : ''} ${selectable ? 'selectable' : ''} ${selected ? 'selected' : ''} ${draggable ? 'draggable' : ''}`}
      style={cardStyle}
      onClick={onClick}
      data-testid={dataTestId}
      draggable={draggable}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="card-cover" style={{ height: coverImageHeight, overflow: 'hidden' }}>
          <img 
            src={coverImage} 
            alt={coverImageAlt} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}

      {/* Card Content */}
      <div className="card-content" style={{ padding: coverImage ? padding : 0 }}>
        {/* Header */}
        {(title || subtitle || headerActions) && (
          <div className="card-header" style={{ 
            marginBottom: spacing[4],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              {title && (
                <h3 className="card-title" style={{ 
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: colors.neutral[900]
                }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <div className="card-subtitle" style={{ 
                  fontSize: '0.875rem',
                  color: colors.neutral[600],
                  marginTop: spacing[1]
                }}>
                  {subtitle}
                </div>
              )}
            </div>
            {headerActions && (
              <div className="card-actions">
                {headerActions}
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <div className="card-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="card-footer" style={{ 
            marginTop: spacing[4],
            paddingTop: spacing[4],
            borderTop: `1px solid ${colors.neutral[200]}`
          }}>
            {footer}
          </div>
        )}
      </div>

      {/* CSS for hover effect is applied via className */}
    </div>
  );
};

export default Card;
