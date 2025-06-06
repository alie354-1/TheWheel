import { Deck, DeckTheme } from '../../types'; // Assuming these types exist in the main deck-builder types

export interface PreviewState {
  deck: Deck | null;
  currentSlideIndex: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  themeSettings: DeckTheme; // Derived or passed in, should align with Deck.theme
  accessibilitySettings: {
    highContrast: boolean;
    // ... other a11y settings
  };
}

// Add any other preview-specific types here
