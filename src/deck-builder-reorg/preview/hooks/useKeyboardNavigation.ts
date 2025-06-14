import { useEffect, useCallback } from 'react';

interface KeyboardNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  onToggleFullscreen: () => void;
  isEnabled: boolean; // To enable/disable the hook, e.g., when a modal is open
}

export const useKeyboardNavigation = ({
  onNext,
  onPrev,
  onToggleFullscreen,
  isEnabled,
}: KeyboardNavigationProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Prevent default browser behavior for spacebar scrolling
      if (event.key === ' ' && (event.target === document.body || event.target === document.documentElement)) {
        event.preventDefault();
      }
      
      // Allow keyboard events if an input, textarea, or select is focused, unless it's a global shortcut like Escape or F for fullscreen
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT' || activeElement.hasAttribute('contenteditable'));

      if (isInputFocused) {
        // Global shortcuts that should work even if input is focused
        if (event.key === 'Escape') {
          // Standard behavior for Escape is often to blur input or close modal, let it propagate
          // If fullscreen is active, Escape should exit it.
          if (document.fullscreenElement) {
            onToggleFullscreen(); // Assuming Escape should also toggle fullscreen off
          }
        } else if (typeof event.key === 'string' && event.key.toLowerCase() === 'f' && (event.metaKey || event.ctrlKey)) {
          // Ctrl+F or Cmd+F is find, let it pass
        } else if (typeof event.key === 'string' && event.key.toLowerCase() === 'f') {
          event.preventDefault();
          onToggleFullscreen();
        }
        // For other keys, if input is focused, don't trigger navigation
        return; 
      }


      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // Spacebar for next slide
          event.preventDefault(); // Prevent spacebar scroll
          onNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          onPrev();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          onToggleFullscreen();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            event.preventDefault();
            onToggleFullscreen(); // Exit fullscreen on Escape
          }
          break;
        default:
          break;
      }
    },
    [isEnabled, onNext, onPrev, onToggleFullscreen]
  );

  useEffect(() => {
    if (isEnabled) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, handleKeyDown]);
};
