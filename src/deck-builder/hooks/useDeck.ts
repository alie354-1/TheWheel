import { useState, useCallback, useMemo, useEffect } from 'react'; // Added useEffect
import { Deck, DeckSection, SectionType, VisualComponent } from '../types/index.ts'; // Added VisualComponent and .ts
import { DeckService } from '../services/deckService.ts'; // Already had .ts, this is correct

export function useDeck(
  initialDeckData?: Deck, // Renamed from initialDeck to initialDeckData for clarity
  onDeckUpdateProp?: (updatedDeck: Deck | null) => void
) {
  const [deck, setDeckState] = useState<Deck | null>(initialDeckData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to synchronize with initialDeckData if it changes externally
  // This is important if DeckEditPage re-fetches or initialDeckData is otherwise updated
  useEffect(() => {
    setDeckState(initialDeckData || null);
    // Optionally, reset other related states like history if you have undo/redo
  }, [initialDeckData]);


  const setDeck = useCallback((newDeck: Deck | null) => {
    setDeckState(newDeck);
    if (onDeckUpdateProp) {
      onDeckUpdateProp(newDeck);
    }
  }, [setDeckState, onDeckUpdateProp]);

  // Create new deck from template
  const createFromTemplate = useCallback((templateId: string, title: string) => {
    try {
      setError(null);
      const newDeck = DeckService.createDeckFromTemplate(templateId, title);
      setDeck(newDeck);
      return newDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deck';
      setError(errorMessage);
      return null;
    }
  }, [setDeck]);

  // Create empty deck (now starts with one blank slide)
  const createEmpty = useCallback((title: string) => {
    try {
      setError(null);
      let newDeck = DeckService.createEmptyDeck(title);
      if (newDeck) {
        // Add a default blank slide
        const { updatedDeck } = DeckService.addSection(newDeck, 'blank', 0);
        newDeck = updatedDeck;
      }
      setDeck(newDeck);
      return newDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deck with blank slide';
      setError(errorMessage);
      return null;
    }
  }, [setDeck]);

  // Update deck title
  const updateTitle = useCallback((title: string) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.updateDeckTitle(deck, title);
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update title';
      setError(errorMessage);
    }
  }, [deck, setDeck]);

  // Add section
  const addSection = useCallback((sectionType: SectionType, position?: number): string | null => {
    if (!deck) return null;
    try {
      setError(null);
      const { updatedDeck, newSectionId } = DeckService.addSection(deck, sectionType, position);
      setDeck(updatedDeck);
      return newSectionId; // Return the ID of the new section
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add section';
      setError(errorMessage);
      return null;
    }
  }, [deck, setDeck]);

  // Add blank section
  const addBlankSlide = useCallback((position?: number): string | null => {
    if (!deck) return null;
    try {
      setError(null);
      // Directly use 'blank' as sectionType
      const { updatedDeck, newSectionId } = DeckService.addSection(deck, 'blank', position);
      setDeck(updatedDeck);
      return newSectionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add blank slide';
      setError(errorMessage);
      return null;
    }
  }, [deck, setDeck]);

  // Update section
  const updateSection = useCallback((sectionId: string, updates: Partial<DeckSection>) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.updateSection(deck, sectionId, updates); // DeckService.updateSection will need to handle .components array
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update section';
      setError(errorMessage);
    }
  }, [deck, setDeck]);

  // updateSectionContent is now obsolete as content is managed via section.components
  // const updateSectionContent = useCallback((sectionId: string, content: Record<string, any>) => { ... });

  // TODO: Implement these functions that will call new methods in DeckService
  const addComponentToSection = useCallback((sectionId: string, component: VisualComponent, position?: number) => {
    if (!deck) return;
    // Placeholder: DeckService.addComponentToSection(deck, sectionId, component, position);
    console.warn("addComponentToSection not fully implemented in useDeck");
  }, [deck]);

  const updateComponentInSection = useCallback((sectionId: string, componentId: string, updates: Partial<VisualComponent>) => {
    if (!deck) return;
    // Placeholder: DeckService.updateComponentInSection(deck, sectionId, componentId, updates);
    console.warn("updateComponentInSection not fully implemented in useDeck");
  }, [deck]);

  const removeComponentFromSection = useCallback((sectionId: string, componentId: string) => {
    if (!deck) return;
    // Placeholder: DeckService.removeComponentFromSection(deck, sectionId, componentId);
    console.warn("removeComponentFromSection not fully implemented in useDeck");
  }, [deck]);

  const reorderComponentsInSection = useCallback((sectionId: string, fromIndex: number, toIndex: number) => {
    if (!deck) return;
    // Placeholder: DeckService.reorderComponentsInSection(deck, sectionId, fromIndex, toIndex);
    console.warn("reorderComponentsInSection not fully implemented in useDeck");
  }, [deck]);


  // Remove section
  const removeSection = useCallback((sectionId: string) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.removeSection(deck, sectionId);
      setDeck(updatedDeck); // This will now also call onDeckUpdateProp
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove section';
      setError(errorMessage);
    }
  }, [deck, setDeck]);

  // Reorder sections
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.reorderSections(deck, fromIndex, toIndex);
      setDeck(updatedDeck); // This will now also call onDeckUpdateProp
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder sections';
      setError(errorMessage);
    }
  }, [deck, setDeck]);

  // Save deck
  const saveDeck = useCallback(async (userId: string) => {
    if (!deck) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Fix section order before validation
      let fixedDeck = deck;
      if (deck.sections && deck.sections.length > 0) {
        fixedDeck = {
          ...deck,
          sections: deck.sections.map((section, idx) => ({
            ...section,
            order: idx
          }))
        };
      }

      const validation = DeckService.validateDeck(fixedDeck);
      if (!validation.isValid) {
        alert(`Validation failed: ${validation.errors.join(', ')}`);
        setError(`Validation failed: ${validation.errors.join(', ')}`);
        return false;
      }

      const savedDeck = await DeckService.saveDeck(fixedDeck, userId);
      setDeck(savedDeck); // This will now also call onDeckUpdateProp
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save deck';
      alert(errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deck, setDeck]);

  // Load deck
  const loadDeck = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedDeck = await DeckService.loadDeck(id);
      setDeck(loadedDeck); // This will now also call onDeckUpdateProp
      return loadedDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deck';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setDeck]);

  // Delete deck
  const deleteDeck = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await DeckService.deleteDeck(id);
      if (deck?.id === id) {
        setDeck(null); // This will now also call onDeckUpdateProp (with null)
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete deck';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deck, setDeck]);

  // Clear current deck
  const clearDeck = useCallback(() => {
    setDeck(null); // This will now also call onDeckUpdateProp (with null)
    setError(null);
  }, [setDeck]);

  const replaceSections = useCallback((newSections: DeckSection[]) => {
    if (!deck) {
      // If there's no current deck, create a new one with these sections
      const newDeck = DeckService.createEmptyDeck("Imported Deck"); // Or derive title differently
      if (newDeck) {
        const updatedDeckWithSections = {
          ...newDeck,
          sections: newSections,
          updated_at: new Date().toISOString(),
        };
        setDeck(updatedDeckWithSections);
      }
      return;
    }
    try {
      setError(null);
      const updatedDeck = {
        ...deck,
        sections: newSections,
        updated_at: new Date().toISOString(),
      };
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to replace sections';
      setError(errorMessage);
    }
  }, [deck, setDeck]);

  // Get section by ID
  const getSection = useCallback((sectionId: string): DeckSection | undefined => {
    return deck?.sections.find((section: DeckSection) => section.id === sectionId);
  }, [deck]);

  // Validation state
  const validation = useMemo(() => {
    if (!deck) return { isValid: true, errors: [] };
    return DeckService.validateDeck(deck);
  }, [deck]);

  // Computed properties
  const sectionCount = deck?.sections.length || 0;
  const hasUnsavedChanges = deck ? deck.updated_at !== deck.created_at : false;

  return {
    // State
    deck,
    isLoading,
    error,
    validation,
    sectionCount,
    hasUnsavedChanges,

    // Actions
    createFromTemplate,
    createEmpty,
    updateTitle,
    addSection,
    addBlankSlide, // Added addBlankSlide
    updateSection,
    // updateSectionContent, // Removed
    removeSection,
    reorderSections,
    // New component actions
    addComponentToSection,
    updateComponentInSection,
    removeComponentFromSection,
    reorderComponentsInSection,
    replaceSections, // Added here
    saveDeck,
    loadDeck,
    deleteDeck,
    clearDeck,
    getSection,
    setDeck, // Export setDeck

    // Utilities
    clearError: () => setError(null)
  };
}
