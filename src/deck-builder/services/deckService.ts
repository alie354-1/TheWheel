import { Deck, DeckSection, Template, SectionType } from '../types';
import { DEFAULT_TEMPLATES, SECTION_DEFAULTS } from '../templates';
import { supabase } from '../../lib/supabase';
import { generateUUID } from '../utils/uuid';

export class DeckService {
  // Template management
  static getTemplates(): Template[] {
    return DEFAULT_TEMPLATES;
  }

  static getTemplate(id: string): Template | undefined {
    return DEFAULT_TEMPLATES.find(template => template.id === id);
  }

  // Deck creation
  static createDeckFromTemplate(templateId: string, title: string): Deck {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    const sections: DeckSection[] = template.sections.map((sectionType, index) => ({
      id: generateUUID(),
      type: sectionType,
      title: SECTION_DEFAULTS[sectionType].title,
      content: { ...SECTION_DEFAULTS[sectionType].content },
      order: index
    }));

    return {
      id: generateUUID(),
      title,
      sections,
      template_id: templateId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static createEmptyDeck(title: string): Deck {
    return {
      id: generateUUID(),
      title,
      sections: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Section management
  static addSection(deck: Deck, sectionType: SectionType, position?: number): Deck {
    const newSection: DeckSection = {
      id: generateUUID(),
      type: sectionType,
      title: SECTION_DEFAULTS[sectionType].title,
      content: { ...SECTION_DEFAULTS[sectionType].content },
      order: position ?? deck.sections.length
    };

    const sections = [...deck.sections];
    if (position !== undefined) {
      sections.splice(position, 0, newSection);
      // Reorder subsequent sections
      sections.forEach((section, index) => {
        section.order = index;
      });
    } else {
      sections.push(newSection);
    }

    return {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };
  }

  static updateSection(deck: Deck, sectionId: string, updates: Partial<DeckSection>): Deck {
    const sections = deck.sections.map(section =>
      section.id === sectionId
        ? { ...section, ...updates }
        : section
    );

    return {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };
  }

  static removeSection(deck: Deck, sectionId: string): Deck {
    const sections = deck.sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }));

    return {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };
  }

  static reorderSections(deck: Deck, fromIndex: number, toIndex: number): Deck {
    const sections = [...deck.sections];
    const [movedSection] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, movedSection);

    // Update order property
    sections.forEach((section, index) => {
      section.order = index;
    });

    return {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };
  }

  // Content management
  static updateSectionContent(
    deck: Deck,
    sectionId: string,
    content: Record<string, any>
  ): Deck {
    return this.updateSection(deck, sectionId, { content });
  }

  static updateDeckTitle(deck: Deck, title: string): Deck {
    return {
      ...deck,
      title,
      updated_at: new Date().toISOString()
    };
  }

  // Phase 1: Database persistence with Supabase
  static async saveDeck(deck: Deck, userId: string): Promise<Deck> {
    try {
      // Save deck metadata (Phase 1: skip template_id for now)
      const deckData = {
        id: deck.id,
        title: deck.title,
        owner_id: userId
      };

      const { data: deckResult, error: deckError } = await supabase
        .from('pitch_decks')
        .upsert(deckData)
        .select()
        .single();

      if (deckError) throw deckError;

      // Save sections separately
      if (deck.sections.length > 0) {
        const sectionsData = deck.sections.map(section => ({
          id: section.id,
          deck_id: deckResult.id,
          type: section.type,
          content: section.content,
          order_index: section.order
        }));

        const { error: sectionsError } = await supabase
          .from('deck_sections')
          .upsert(sectionsData);

        if (sectionsError) throw sectionsError;
      }

      return {
        ...deck,
        id: deckResult.id,
        updated_at: deckResult.updated_at
      };
    } catch (error) {
      console.error('Error saving deck:', error);
      throw new Error('Failed to save deck');
    }
  }

  static async loadDeck(id: string): Promise<Deck | null> {
    try {
      // Load deck metadata
      const { data: deckData, error: deckError } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('id', id)
        .single();

      if (deckError) {
        if (deckError.code === 'PGRST116') return null; // Not found
        throw deckError;
      }

      // Load sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('deck_sections')
        .select('*')
        .eq('deck_id', id)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      const sections: DeckSection[] = (sectionsData || []).map(section => ({
        id: section.id,
        type: section.type,
        title: SECTION_DEFAULTS[section.type as SectionType]?.title || section.type,
        content: section.content,
        order: section.order_index
      }));

      return {
        id: deckData.id,
        title: deckData.title,
        sections,
        template_id: deckData.template_id,
        created_at: deckData.created_at,
        updated_at: deckData.updated_at
      };
    } catch (error) {
      console.error('Error loading deck:', error);
      throw new Error('Failed to load deck');
    }
  }

  static async listDecks(userId: string): Promise<Deck[]> {
    try {
      const { data, error } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // For listing, we don't need to load all sections, just basic deck info
      return data.map(row => ({
        id: row.id,
        title: row.title,
        sections: [], // Sections loaded separately when needed
        template_id: row.template_id,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Error listing decks:', error);
      throw new Error('Failed to load decks');
    }
  }

  static async deleteDeck(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pitch_decks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting deck:', error);
      throw new Error('Failed to delete deck');
    }
  }

  // Validation
  static validateDeck(deck: Deck): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!deck.title.trim()) {
      errors.push('Deck title is required');
    }

    if (deck.sections.length === 0) {
      errors.push('Deck must have at least one section');
    }

    // Validate section order
    const expectedOrder = deck.sections.map((_, index) => index);
    const actualOrder = deck.sections.map(section => section.order).sort((a, b) => a - b);
    if (JSON.stringify(expectedOrder) !== JSON.stringify(actualOrder)) {
      errors.push('Section order is invalid');
    }

    // Validate section content
    deck.sections.forEach((section, index) => {
      if (!section.title.trim()) {
        errors.push(`Section ${index + 1} title is required`);
      }

      // Basic content validation based on section type
      switch (section.type) {
        case 'hero':
          if (!section.content.headline?.trim()) {
            errors.push(`Section ${index + 1} (${section.title}) is missing a headline`);
          }
          break;
        case 'problem':
          if (!section.content.description?.trim()) {
            errors.push(`Section ${index + 1} (${section.title}) is missing a description`);
          }
          break;
        // Add more validation rules as needed
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
