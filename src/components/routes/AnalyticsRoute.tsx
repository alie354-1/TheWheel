/**
 * Analytics Route Component
 * 
 * A wrapper component that automatically tracks page views.
 */

import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsContext } from '../../lib/contexts/AnalyticsContext';

export interface AnalyticsRouteProps {
  children: ReactNode;
  pageName?: string;
  additionalMetadata?: Record<string, any>;
  trackTiming?: boolean;
}

/**
 * Route component that automatically tracks page views
 */
export const AnalyticsRoute: React.FC<AnalyticsRouteProps> = ({
  children,
  pageName,
  additionalMetadata = {},
  trackTiming = true
}) => {
  const location = useLocation();
  const { trackEvent } = useAnalyticsContext();
  
  // Track page view on mount or when location changes
  useEffect(() => {
    // Get the page name from props or fallback to path
    const page = pageName || location.pathname;
    
    // Track the page view
    trackEvent('page_view', {
      page,
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      ...additionalMetadata
    });
    
    // Set up timing tracking if enabled
    let startTime: number | null = null;
    
    if (trackTiming) {
      startTime = performance.now();
    }
    
    // Clean up and track page exit
    return () => {
      if (trackTiming && startTime !== null) {
        const endTime = performance.now();
        const timeOnPage = Math.round(endTime - startTime);
        
        trackEvent('page_exit', {
          page,
          timeOnPage,
          path: location.pathname,
          ...additionalMetadata
        });
      }
    };
  }, [location, pageName, trackEvent, additionalMetadata, trackTiming]);
  
  return <>{children}</>;
};