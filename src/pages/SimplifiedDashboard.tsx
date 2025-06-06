import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import ErrorBoundary from '../components/ErrorBoundary.tsx';

/**
 * Simplified Dashboard Component
 * 
 * This is a stripped-down version of the Dashboard component
 * to help isolate loading issues.
 */
export default function SimplifiedDashboard() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [componentMounted, setComponentMounted] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [standupEntries, setStandupEntries] = useState<any[]>([]);

  // Enhanced debug logging
  console.log("[SimplifiedDashboard] Component rendering", {
    profileExists: !!profile,
    profileId: profile?.id,
    componentMounted: componentMounted,
    hasError: !!error,
    isLoading
  });

  useEffect(() => {
    // Performance tracking
    const startTime = performance.now();
    
    // Mark component as mounted to help with debugging
    setComponentMounted(true);
    console.log("[SimplifiedDashboard] Component mounted, starting data loading");
    
    // Always set a timeout to end loading state even if other operations fail
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("[SimplifiedDashboard] Forcing loading state to end after timeout (5s)");
        setIsLoading(false);
      }
    }, 5000); // 5 seconds max loading time

    if (profile) {
      try {
        console.log("[SimplifiedDashboard] Profile found, id:", profile.id);
        
        // Simplified data loading - no dynamic imports
        Promise.all([
          checkCompanyAccess(),
          loadStandupEntries()
        ])
          .then(() => {
            const endTime = performance.now();
            console.log(`[SimplifiedDashboard] Total loading time: ${(endTime - startTime).toFixed(2)}ms`);
            setIsLoading(false);
          })
          .catch(err => {
            console.error("[SimplifiedDashboard] Error in data loading:", err);
            setError(err.message || "Unknown error occurred");
            setIsLoading(false);
          });
      } catch (err: any) {
        console.error("[SimplifiedDashboard] Error in main effect:", err);
        setError(err.message || "Unknown error occurred");
        setIsLoading(false);
      }
    } else {
      // Handle missing profile case
      console.log("[SimplifiedDashboard] No profile available, auth may not be complete");
      setIsLoading(false);
      setError('User profile not loaded. Please try logging out and back in.');
    }

    return () => {
      clearTimeout(loadingTimeout);
      console.log("[SimplifiedDashboard] Component unmounting");
    };
  }, [profile]);

  const checkCompanyAccess = async () => {
    if (!profile) {
      console.log("[SimplifiedDashboard] checkCompanyAccess: No profile available");
      return;
    }

    console.log("[SimplifiedDashboard] Starting company access check for user:", profile.id);
    
    try {
      // Direct query instead of using service
      const { data, error } = await supabase
        .from('company_members')
        .select('company_id, access_type')
        .eq('user_id', profile.id);
      
      if (error) {
        throw error;
      }
      
      setHasCompany(data && data.length > 0);
      return { hasCompany: data && data.length > 0 };
    } catch (error: any) {
      console.error(`[SimplifiedDashboard] Error checking company access:`, error);
      setHasCompany(false);
      return { hasCompany: false };
    }
  };

  const loadStandupEntries = async () => {
    if (!profile) {
      console.log("[SimplifiedDashboard] loadStandupEntries: No profile available");
      return [];
    }

    console.log("[SimplifiedDashboard] Starting standup entries load for user:", profile.id);
    
    try {
      // Query standup_entries table directly with error handling
      const { data, error } = await supabase
        .from('standup_entries')
        .select('*')
        .eq('user_id', profile.id)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) {
        throw error;
      }
      
      setStandupEntries(data || []);
      return data || [];
    } catch (error: any) {
      console.error(`[SimplifiedDashboard] Error loading standup entries:`, error);
      setStandupEntries([]);
      return [];
    }
  };

  // If still loading, show a detailed loading indicator
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading simplified dashboard...</p>
            <p className="mt-1 text-xs text-gray-400">
              {componentMounted ? "Component mounted, fetching data..." : "Component mounting..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      componentName="SimplifiedDashboard"
      fallback={
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Dashboard Error</h2>
              <p className="text-sm text-gray-700 mb-4">
                There was a problem loading your dashboard. Please try refreshing the page.
              </p>
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded overflow-auto max-h-32">
                <pre>{error || "Unknown error occurred"}</pre>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Simplified Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                This is a simplified version of the dashboard for troubleshooting
              </p>
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            {profile ? (
              <div>
                <p><strong>User ID:</strong> {profile.id}</p>
                <p><strong>Name:</strong> {profile.full_name || 'Not set'}</p>
                <p><strong>Email:</strong> {profile.email || 'Not set'}</p>
                <p><strong>Has Company:</strong> {hasCompany ? 'Yes' : 'No'}</p>
                <p><strong>Standup Entries:</strong> {standupEntries.length}</p>
              </div>
            ) : (
              <p>No profile data available</p>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
