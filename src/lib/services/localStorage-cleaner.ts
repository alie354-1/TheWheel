/**
 * Utility to clean localStorage items that might be causing issues
 */
export const cleanLocalStorage = (forceClear = false) => {
  try {
    // Only remove pathway data if in the idea playground or forceClear is true
    const currentPath = window.location.pathname;
    const isIdeaPlayground = currentPath.includes('idea-playground') || 
                             currentPath.includes('idea-hub');
    
    if (isIdeaPlayground || forceClear) {
      // Back up the data before removing
      const pathwayData = localStorage.getItem('idea_playground_pathway');
      
      // Store backup in a different key
      if (pathwayData) {
        localStorage.setItem('idea_playground_pathway_backup', pathwayData);
      }
      
      // Only then remove the pathway data
      localStorage.removeItem('idea_playground_pathway');
      console.log('[LocalStorage Cleaner] Successfully reset pathway data (normal startup process)');
    } else {
      // Skip cleaning when not in the idea playground
      console.log('[LocalStorage Cleaner] Skipping pathway data reset (not in idea playground)');
    }
    
    // Clean up other potential problematic data
    // But AVOID cleaning auth-related or critical app state data
  } catch (error) {
    console.error('[LocalStorage Cleaner] Error cleaning localStorage:', error);
  }
};

// Export the function but DO NOT auto-execute on import
// This will be called explicitly where needed instead
