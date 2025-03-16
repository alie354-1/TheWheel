
/**
 * Utility to clean localStorage items that might be causing issues
 */
export const cleanLocalStorage = () => {
  // Remove any stored pathway
  localStorage.removeItem('idea_playground_pathway');
  console.log('Cleaned localStorage of pathway data');
  
  // You can add more items to clean here if needed
};

// Auto-execute when imported
cleanLocalStorage();
