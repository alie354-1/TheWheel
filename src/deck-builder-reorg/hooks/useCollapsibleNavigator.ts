import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'deckbuilder_slide_navigator_collapsed';

export function useCollapsibleNavigator() {
  // Determine initial state: collapsed on mobile, else from localStorage or default false
  const getInitial = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return true;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? stored === 'true' : false;
    }
    return false;
  };

  const [collapsed, setCollapsed] = useState(getInitial);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  // Auto-collapse on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !collapsed) setCollapsed(true);
      if (window.innerWidth >= 768 && collapsed && localStorage.getItem(STORAGE_KEY) !== 'true') setCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // Keyboard shortcut: Ctrl+Shift+S
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      setCollapsed(c => !c);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  return { collapsed, setCollapsed };
}
