import { useState, useCallback, useMemo } from 'react';
import { Deck, DeckSection, SectionType } from '../types';
import { DeckService } from '../services/deckService';

export function useDeck(initialDeck?: Deck) {
  const [deck, setDeck] = useState<Deck | null>(initialDeck || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  // Create empty deck
  const createEmpty = useCallback((title: string) => {
    try {
      setError(null);
      const newDeck = DeckService.createEmptyDeck(title);
      setDeck(newDeck);
      return newDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deck';
      setError(errorMessage);
      return null;
    }
  }, []);

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
  }, [deck]);

  // Add section
  const addSection = useCallback((sectionType: SectionType, position?: number) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.addSection(deck, sectionType, position);
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add section';
      setError(errorMessage);
    }
  }, [deck]);

  // Update section
  const updateSection = useCallback((sectionId: string, updates: Partial<DeckSection>) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.updateSection(deck, sectionId, updates);
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update section';
      setError(errorMessage);
    }
  }, [deck]);

  // Update section content
  const updateSectionContent = useCallback((sectionId: string, content: Record<string, any>) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.updateSectionContent(deck, sectionId, content);
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update section content';
      setError(errorMessage);
    }
  }, [deck]);

  // Remove section
  const removeSection = useCallback((sectionId: string) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.removeSection(deck, sectionId);
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove section';
      setError(errorMessage);
    }
  }, [deck]);

  // Reorder sections
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    if (!deck) return;
    try {
      setError(null);
      const updatedDeck = DeckService.reorderSections(deck, fromIndex, toIndex);
      setDeck(updatedDeck);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder sections';
      setError(errorMessage);
    }
  }, [deck]);

  // Save deck (placeholder for Phase 1)
  const saveDeck = useCallback(async (userId: string) => {
    if (!deck) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate deck before saving
      const validation = DeckService.validateDeck(deck);
      if (!validation.isValid) {
        setError(`Validation failed: ${validation.errors.join(', ')}`);
        return false;
      }

      const savedDeck = await DeckService.saveDeck(deck, userId);
      setDeck(savedDeck);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save deck';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deck]);

  // Load deck (placeholder for Phase 1)
  const loadDeck = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedDeck = await DeckService.loadDeck(id);
      setDeck(loadedDeck);
      return loadedDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deck';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear current deck
  const clearDeck = useCallback(() => {
    setDeck(null);
    setError(null);
  }, []);

  // Get section by ID
  const getSection = useCallback((sectionId: string): DeckSection | undefined => {
    return deck?.sections.find(section => section.id === sectionId);
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
    updateSection,
    updateSectionContent,
    removeSection,
    reorderSections,
    saveDeck,
    loadDeck,
    clearDeck,
    getSection,

    // Utilities
    clearError: () => setError(null)
  };
}
