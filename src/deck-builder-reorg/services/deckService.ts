import { 
  Deck, DeckSection, Template, SectionType, VisualComponent, VisualComponentLayout, DeckDataTemplate, 
  DeckComment, DeckAiUpdateProposal,
  // New types for Unified Sharing
  SmartShareLink, ReviewerSession, ShareType, ExpertiseLevel, AIFeedbackInsight, DeckShareRecipient, FeedbackCategory,
  // Specific proposal data types
  TextEditProposedData, ProposedContentDataType,
  // Types for AI Service interaction
  AiServiceRequestPayload, AiGeneratedSuggestion, AiServiceCommentInput, AiServiceSlideContentInput, BlockType
} from '../types/index.ts';
import { POPULATED_DECK_TEMPLATES } from '../templates/index.ts';
import { SECTION_DEFAULTS } from '../templates/defaults.ts';
import { supabase } from '../../lib/supabase.ts';
console.log("deckService.ts is using SECTION_DEFAULTS for 'hero':", JSON.stringify(SECTION_DEFAULTS['hero'], null, 2));
import { generateUUID } from '../utils/uuid.ts';
import aiService from '../../lib/services/aiService.ts';

export interface DeckAnalytics {
  totalViews: number;
  uniqueViewers: number;
  avgSessionDuration: number;
  totalSections: number;
  viewHistory: Array<{ date: string; views: number }>;
}

export interface ViewMetadata {
  viewerIp?: string;
  viewerLocation?: any;
  referrer?: string;
  userAgent?: string;
  sessionDuration?: number;
  sectionsViewed?: number[];
}

export class DeckService {
  // Template management
  static getTemplates(): DeckDataTemplate[] {
    return POPULATED_DECK_TEMPLATES;
  }

  static getPopulatedTemplate(id: string): DeckDataTemplate | undefined {
    return POPULATED_DECK_TEMPLATES.find(template => template.id === id);
  }

  // Deck creation
  static createDeckFromTemplate(templateId: string, title: string): Deck {
    const populatedTemplate = this.getPopulatedTemplate(templateId);

    if (populatedTemplate) {
      const newDeck = JSON.parse(JSON.stringify(populatedTemplate.deck)) as Deck;
      newDeck.id = generateUUID();
      newDeck.title = title;
      newDeck.created_at = new Date().toISOString();
      newDeck.updated_at = new Date().toISOString();
      newDeck.template_id = populatedTemplate.id;

      newDeck.sections.forEach((section: DeckSection) => {
        section.id = generateUUID();
        if (section.components) {
          section.components.forEach((component: VisualComponent) => {
            component.id = generateUUID();
          });
        }
      });

      // Logging will be moved to DeckLibraryPage after successful save
      return newDeck;
    }
    throw new Error(`Populated template with id ${templateId} not found.`);
  }

  static createEmptyDeck(title: string): Deck {
    const newDeck: Deck = {
      id: generateUUID(),
      title,
      sections: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Logging will be moved to DeckLibraryPage after successful save
    return newDeck;
  }

  // Section management
  static addSection(deck: Deck, sectionType: SectionType, position?: number): { updatedDeck: Deck; newSectionId: string } {
    const newSectionId = generateUUID();
    const newSection: DeckSection = {
      id: newSectionId,
      type: sectionType,
      title: SECTION_DEFAULTS[sectionType].title,
      components: [...(SECTION_DEFAULTS[sectionType].components || [])],
      order: position ?? deck.sections.length
    };

    const sections = [...deck.sections];
    if (position !== undefined) {
      sections.splice(position, 0, newSection);
      sections.forEach((section, index) => {
        section.order = index;
      });
    } else {
      sections.push(newSection);
    }

    const updatedDeck = {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };

    DeckService.logContentInteraction(
      deck.id,
      'SECTION_ADD',
      { sectionId: newSectionId, sectionType, position: newSection.order },
      undefined, 
      newSectionId
    ).catch(logError => console.error("Logging failed for SECTION_ADD:", logError));

    return { updatedDeck, newSectionId };
  }

  static updateSection(deck: Deck, sectionId: string, updates: Partial<DeckSection>): Deck {
    const sections = deck.sections.map(section =>
      section.id === sectionId
        ? { ...section, ...updates }
        : section
    );

    const updatedDeck = {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };

    DeckService.logContentInteraction(
      deck.id,
      'SECTION_UPDATE',
      { sectionId, updates },
      undefined, 
      sectionId
    ).catch(logError => console.error("Logging failed for SECTION_UPDATE:", logError));
    
    return updatedDeck;
  }

  static removeSection(deck: Deck, sectionId: string): Deck {
    const sections = deck.sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }));

    const updatedDeck = {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };

    DeckService.logContentInteraction(
      deck.id,
      'SECTION_REMOVE',
      { sectionId },
      undefined, 
      sectionId 
    ).catch(logError => console.error("Logging failed for SECTION_REMOVE:", logError));

    return updatedDeck;
  }

  static reorderSections(deck: Deck, fromIndex: number, toIndex: number): Deck {
    const sections = [...deck.sections];
    const [movedSection] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, movedSection);

    sections.forEach((section, index) => {
      section.order = index;
    });

    const updatedDeck = {
      ...deck,
      sections,
      updated_at: new Date().toISOString()
    };

    DeckService.logContentInteraction(
      deck.id,
      'SECTION_REORDER',
      { fromIndex, toIndex, sectionIds: sections.map(s => s.id) }
    ).catch(logError => console.error("Logging failed for SECTION_REORDER:", logError));
    
    return updatedDeck;
  }

  static updateDeckTitle(deck: Deck, title: string): Deck {
    return {
      ...deck,
      title,
      updated_at: new Date().toISOString()
    };
  }

  static async saveDeck(deck: Deck, userId: string): Promise<Deck> {
    try {
        // Helper to check if a string is a valid UUID
        const isValidUUID = (uuid: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);

        const deckData = {
          id: deck.id,
          title: deck.title,
          owner_id: userId,
          template_id: deck.template_id && isValidUUID(deck.template_id) ? deck.template_id : null, // Ensure template_id is a valid UUID or null
          theme: deck.theme,
          feedback_summary: deck.feedback_summary,
        last_feedback_activity_at: deck.last_feedback_activity_at,
      };

      const { data: deckResult, error: deckError } = await supabase
        .from('pitch_decks')
        .upsert(deckData)
        .select()
        .single();

      if (deckError) throw deckError;
      
      console.log('[DeckService.saveDeck] pitch_decks upsert successful. deckResult.id:', deckResult.id, 'deckResult.owner_id:', deckResult.owner_id);

      const sectionIds = deck.sections.map(s => s.id);
      if (deck.sections.length > 0) {
        const sectionsData = deck.sections.map(section => {
          // Deep clone slideStyle to avoid mutation and ensure all keys are serializable
          let slideStyleToSave: any = undefined;
          if (section.slideStyle && typeof section.slideStyle === 'object') {
            slideStyleToSave = { ...section.slideStyle };
            // Remove any undefined values (Supabase/Postgres JSONB does not store undefined)
            Object.keys(slideStyleToSave).forEach(key => {
              if (slideStyleToSave[key] === undefined) delete slideStyleToSave[key];
            });
          }
          return {
            id: section.id,
            deck_id: deckResult.id,
            type: section.type,
            title: section.title,
            content: section.components,
            order_index: section.order,
            width: section.width || null,
            height: section.height || null,
            slide_style: slideStyleToSave || null,
            presenter_notes: section.presenter_notes !== undefined ? section.presenter_notes : null,
          };
        });

        console.log('[DeckService.saveDeck] Attempting to upsert sectionsData. Individual slide_style values:');
        sectionsData.forEach(s => console.log(`  Section ID ${s.id}: slide_style: ${JSON.stringify(s.slide_style)}`));
        // console.log('[DeckService.saveDeck] Full sectionsData (with explicit nulls):', JSON.stringify(sectionsData, null, 2)); // Log sectionsData

        const { error: sectionsError } = await supabase
          .from('deck_sections')
          .upsert(sectionsData);

        if (sectionsError) {
          console.error('[DeckService.saveDeck] Error upserting sections:', sectionsError); // Log specific sections error
          throw sectionsError;
        }
      }
      
      DeckService.logContentInteraction(
        deckResult.id,
        'DECK_SAVE',
        { title: deck.title, sectionCount: deck.sections.length, sectionIds },
        userId
      ).catch(logError => console.error("Logging failed for DECK_SAVE:", logError));

      return {
        ...deck,
        id: deckResult.id, // Ensure this is the ID from the database
        user_id: deckResult.owner_id, // Explicitly set user_id from the persisted owner_id
        updated_at: deckResult.updated_at,
        created_at: deckResult.created_at
      };
    } catch (error) {
      console.error('Error saving deck:', error);
      DeckService.logContentInteraction(
        deck.id,
        'DECK_SAVE_FAILED',
        { title: deck.title, error: (error as Error).message },
        userId
      ).catch(logError => console.error("Logging failed for DECK_SAVE_FAILED:", logError));
      throw new Error('Failed to save deck');
    }
  }

  static async loadDeck(id: string): Promise<Deck | null> {
    try {
      const { data: deckData, error: deckError } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('id', id)
        .single();

      if (deckError) {
        if (deckError.code === 'PGRST116') {
           DeckService.logContentInteraction(id, 'DECK_LOAD_NOT_FOUND', { deckId: id }).catch(e => console.error(e));
          return null;
        }
        throw deckError;
      }

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('deck_sections')
        .select('*, width, height')
        .eq('deck_id', id)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      const sections: DeckSection[] = (sectionsData || []).map(section => ({
        id: section.id,
        type: section.type as SectionType,
        title: section.title || SECTION_DEFAULTS[section.type as SectionType]?.title || section.type,
        components: Array.isArray(section.content) ? section.content as VisualComponent[] : [],
        order: section.order_index,
        width: section.width || undefined,
        height: section.height || undefined,
        slideStyle: section.slide_style,
        presenter_notes: section.presenter_notes,
      }));

      console.log('[DeckService.loadDeck] Loaded sectionsData. Individual slideStyle values after mapping:');
      sections.forEach(s => console.log(`  Section ID ${s.id}: slideStyle: ${JSON.stringify(s.slideStyle)}`));

      const deck: Deck = {
        id: deckData.id,
        title: deckData.title,
        sections,
        template_id: deckData.template_id,
        created_at: deckData.created_at,
        updated_at: deckData.updated_at,
        user_id: deckData.owner_id,
        theme: deckData.theme,
        last_feedback_activity_at: deckData.last_feedback_activity_at,
        feedback_summary: deckData.feedback_summary,
      };
      
      DeckService.logContentInteraction(
        deck.id,
        'DECK_LOAD',
        { title: deck.title, sectionCount: deck.sections.length }
      ).catch(logError => console.error("Logging failed for DECK_LOAD:", logError));

      return deck;
    } catch (error) {
      console.error('Error loading deck:', error);
      DeckService.logContentInteraction(
        id,
        'DECK_LOAD_FAILED',
        { deckId: id, error: (error as Error).message }
      ).catch(logError => console.error("Logging failed for DECK_LOAD_FAILED:", logError));
      throw new Error('Failed to load deck');
    }
  }

  static async getDeck(id: string): Promise<Deck | null> {
    return this.loadDeck(id);
  }

  static async listDecks(userId: string): Promise<Deck[]> {
    try {
      const { data: decksData, error: decksError } = await supabase
        .from('pitch_decks')
        .select('id, title, template_id, created_at, updated_at')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (decksError) throw decksError;

      return decksData.map(row => ({
        id: row.id,
        title: row.title,
        sections: [], 
        template_id: row.template_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
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

  // --- Unified Smart Sharing System Methods ---

  static async createSmartShareLink(
    deckId: string,
    userId: string,
    options: Partial<Omit<SmartShareLink, 'id' | 'deckId' | 'shareToken' | 'createdAt' | 'updatedAt' | 'created_by'>> = {}
  ): Promise<SmartShareLink> {
    let shareToken = generateUUID();
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
      const linkData = {
        deck_id: deckId,
        share_token: shareToken,
        created_by: userId,
        share_type: options.shareType || 'feedback',
        target_roles: options.targetRoles || [],
        focus_areas: options.focusAreas || [],
        ai_analysis_enabled: options.aiAnalysisEnabled !== undefined ? options.aiAnalysisEnabled : true,
        custom_weights: options.customWeights || {},
        expires_at: options.expiresAt,
        // New fields from schema
        requires_verification: options.requires_verification || false,
        allow_anonymous_feedback: options.allow_anonymous_feedback || false,
        creator_is_anonymous: options.creator_is_anonymous || false,
      };

      const { data, error } = await supabase
        .from('smart_share_links')
        .insert(linkData)
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation (code 23505 for PostgreSQL)
        if (error.code === '23505' && attempts < MAX_ATTEMPTS - 1) {
          console.warn(`Share token collision for ${shareToken}, retrying... (Attempt ${attempts + 1})`);
          shareToken = generateUUID(); // Generate a new token
          attempts++;
          continue; // Retry the loop
        }
        console.error('Error creating smart share link:', error);
        throw new Error('Failed to create smart share link.');
      }
      return {
        id: data.id,
        deckId: data.deck_id,
      shareToken: data.share_token,
      shareType: data.share_type as ShareType,
      targetRoles: data.target_roles,
      focusAreas: data.focus_areas,
      aiAnalysisEnabled: data.ai_analysis_enabled,
      customWeights: data.custom_weights,
      created_by: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at,
      // Map new fields
      requires_verification: data.requires_verification,
      allow_anonymous_feedback: data.allow_anonymous_feedback,
      creator_is_anonymous: data.creator_is_anonymous,
    };
  }
  // If all attempts fail, throw an error
  throw new Error('Failed to create smart share link after multiple attempts due to token collision or other errors.');
}

  static async getSmartShareLink(shareToken: string): Promise<SmartShareLink | null> {
    const { data, error } = await supabase
      .from('smart_share_links')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; 
      console.error('Error fetching smart share link:', error);
      throw error;
    }
    return {
      id: data.id,
      deckId: data.deck_id,
      shareToken: data.share_token,
      shareType: data.share_type as ShareType,
      targetRoles: data.target_roles,
      focusAreas: data.focus_areas,
      aiAnalysisEnabled: data.ai_analysis_enabled,
      customWeights: data.custom_weights,
      created_by: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at,
      // Map new fields
      requires_verification: data.requires_verification,
      allow_anonymous_feedback: data.allow_anonymous_feedback,
      creator_is_anonymous: data.creator_is_anonymous,
    };
  }
  
  static async getDeckBySmartShareToken(shareToken: string): Promise<{ deck: Deck; shareLink: SmartShareLink } | null> {
    const shareLink = await this.getSmartShareLink(shareToken);
    if (!shareLink) return null;

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      console.warn(`Share link ${shareToken} has expired.`);
      return null; 
    }

    const deck = await this.loadDeck(shareLink.deckId); 
    if (!deck) return null;

    return { deck, shareLink };
  }

  static async getFeedbackWithClassification(deckId: string): Promise<{ content: DeckComment[]; form: DeckComment[]; general: DeckComment[] }> {
    const comments = await this.getComments(deckId);
    const content = comments.filter(c => c.feedback_category === 'Content');
    const form = comments.filter(c => c.feedback_category === 'Form');
    const general = comments.filter(c => c.feedback_category === 'General');
    return { content, form, general };
  }

  static async getAIInsightsWithWeighting(deckId: string): Promise<any> {
    // This is a placeholder for a more complex implementation
    // that would involve calling the AI service with weighted feedback.
    console.log(`Fetching AI insights with weighting for deck ${deckId}`);
    const insights = await this.generateAndStoreAggregatedInsights(deckId);
    return insights;
  }

  static async addShareRecipients(shareLinkId: string, recipients: Omit<DeckShareRecipient, 'id' | 'share_link_id' | 'created_at' | 'verified_at'>[]): Promise<DeckShareRecipient[]> {
    if (!recipients || recipients.length === 0) {
      return [];
    }

    const recipientsData = recipients.map(r => ({
      share_link_id: shareLinkId,
      email: r.email,
      phone: r.phone,
      role: r.role,
      feedback_weight: r.feedback_weight,
      access_code: r.access_code,
    }));

    const { data, error } = await supabase
      .from('deck_share_recipients')
      .insert(recipientsData)
      .select();

    if (error) {
      console.error('Error adding share recipients:', error);
      throw new Error('Failed to add share recipients.');
    }

    return data.map(r => ({
      id: r.id,
      share_link_id: r.share_link_id,
      email: r.email,
      phone: r.phone,
      role: r.role,
      feedback_weight: r.feedback_weight,
      access_code: r.access_code,
      verified_at: r.verified_at,
      created_at: r.created_at,
    }));
  }

  static async verifyRecipientAccess(shareToken: string, emailOrPhone: string, accessCode: string): Promise<{ success: boolean; message: string }> {
    const shareLink = await this.getSmartShareLink(shareToken);
    if (!shareLink) {
      return { success: false, message: 'Invalid or expired share link.' };
    }

    const isEmail = emailOrPhone.includes('@');
    const columnToQuery = isEmail ? 'email' : 'phone';

    const { data, error } = await supabase
      .from('deck_share_recipients')
      .select('id, access_code, verified_at')
      .eq('share_link_id', shareLink.id)
      .eq(columnToQuery, emailOrPhone)
      .single();

    if (error || !data) {
      return { success: false, message: 'You are not on the recipient list for this deck.' };
    }

    if (data.verified_at) {
      return { success: true, message: 'Already verified.' };
    }

    if (data.access_code !== accessCode) {
      return { success: false, message: 'Invalid access code.' };
    }

    const { error: updateError } = await supabase
      .from('deck_share_recipients')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating recipient verification status:', updateError);
      return { success: false, message: 'Verification failed. Please try again.' };
    }

    return { success: true, message: 'Verification successful.' };
  }

  static async createOrUpdateReviewerSession(
    shareToken: string,
    sessionId: string, 
    details: Partial<Omit<ReviewerSession, 'id' | 'shareToken' | 'sessionId' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>>
  ): Promise<ReviewerSession> {
    const sessionData = {
      share_token: shareToken,
      session_id: sessionId,
      declared_role: details.declaredRole,
      reviewer_name: details.reviewerName,
      reviewer_email: details.reviewerEmail,
      expertise_level: details.expertiseLevel,
      ip_address: details.ipAddress,
      user_agent: details.userAgent,
      user_id: details.userId,
      last_activity_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reviewer_sessions')
      .upsert(sessionData, { onConflict: 'session_id' })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating reviewer session:', error);
      throw new Error('Failed to create/update reviewer session.');
    }
    return {
      id: data.id,
      shareToken: data.share_token,
      sessionId: data.session_id,
      declaredRole: data.declared_role,
      reviewerName: data.reviewer_name,
      reviewerEmail: data.reviewer_email,
      expertiseLevel: data.expertise_level as ExpertiseLevel | undefined,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastActivityAt: data.last_activity_at,
    };
  }
  
  static async getReviewerSessionBySessionId(sessionId: string): Promise<ReviewerSession | null> {
    const { data, error } = await supabase
      .from('reviewer_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching reviewer session by session_id:', error);
      throw error;
    }
    return {
      id: data.id,
      shareToken: data.share_token,
      sessionId: data.session_id,
      declaredRole: data.declared_role,
      reviewerName: data.reviewer_name,
      reviewerEmail: data.reviewer_email,
      expertiseLevel: data.expertise_level as ExpertiseLevel | undefined,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastActivityAt: data.last_activity_at,
    };
  }

   static async getAnalytics(deckId: string): Promise<DeckAnalytics> {
    try {
      const { data, error } = await supabase.rpc('get_deck_analytics', { 
        p_deck_id: deckId
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          totalViews: 0,
          uniqueViewers: 0,
          avgSessionDuration: 0,
          totalSections: 0,
          viewHistory: []
        };
      }

      const analytics = data[0];
      return {
        totalViews: analytics.total_views || 0,
        uniqueViewers: analytics.unique_viewers || 0,
        avgSessionDuration: analytics.avg_session_duration || 0,
        totalSections: analytics.total_sections || 0,
        viewHistory: analytics.view_history || []
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to load analytics');
    }
  }

  static async duplicateDeck(deckId: string, userId: string): Promise<Deck> {
    try {
      const originalDeck = await this.loadDeck(deckId);
      if (!originalDeck) {
        throw new Error('Original deck not found');
      }

      const duplicatedDeckData: Deck = {
        id: generateUUID(),
        title: `${originalDeck.title} (Copy)`,
        sections: originalDeck.sections.map(section => ({
          ...section,
          id: generateUUID(),
          components: section.components.map(c => ({...c, id: generateUUID()})) 
        })),
        template_id: originalDeck.template_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId, 
        theme: originalDeck.theme ? JSON.parse(JSON.stringify(originalDeck.theme)) : undefined,
      };
      
      const savedDuplicatedDeck = await this.saveDeck(duplicatedDeckData, userId);

      DeckService.logContentInteraction(
        savedDuplicatedDeck.id,
        'DECK_DUPLICATE',
        { originalDeckId: deckId, newDeckTitle: savedDuplicatedDeck.title },
        userId
      ).catch(logError => console.error("Logging failed for DECK_DUPLICATE:", logError));

      return savedDuplicatedDeck;

    } catch (error) {
      console.error('Error duplicating deck:', error);
      DeckService.logContentInteraction(
        deckId, 
        'DECK_DUPLICATE_FAILED',
        { error: (error as Error).message },
        userId
      ).catch(logError => console.error("Logging failed for DECK_DUPLICATE_FAILED:", logError));
      throw new Error('Failed to duplicate deck');
    }
  }

  static async updateDeckMetadata(deckId: string, updates: Partial<{ 
    title: string;
  }>): Promise<void> {
    try {
      const { error } = await supabase
        .from('pitch_decks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', deckId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating deck metadata:', error);
      throw new Error('Failed to update deck metadata');
    }
  }

  static validateDeck(deck: Deck): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!deck.title?.trim()) errors.push('Deck title is required');
    if (deck.sections.length === 0) errors.push('Deck must have at least one section');
    
    const sectionOrders = deck.sections.map(s => s.order).sort((a,b) => a-b);
    const expectedSectionOrders = Array.from({length: deck.sections.length}, (_,i) => i);
    if(JSON.stringify(sectionOrders) !== JSON.stringify(expectedSectionOrders)) {
      errors.push('Section order is invalid or contains duplicates.');
    }

    deck.sections.forEach((section, index) => {
      if (!section.title?.trim()) errors.push(`Section ${index + 1} title is required`);
    });
    return { isValid: errors.length === 0, errors };
  }

  // Helper function to create a simple text summary from comments
  private static _summarizeCommentInsightsForAI(comments: DeckComment[]): string {
    if (comments.length === 0) return "No specific comments to summarize for insights.";

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    const categories: Record<string, number> = {};
    const expertiseLevels: Record<string, number> = { low: 0, mid: 0, high: 0 };

    comments.forEach(c => {
      if (c.aiSentimentScore !== undefined && c.aiSentimentScore !== null) {
        if (c.aiSentimentScore > 0.3) positiveCount++;
        else if (c.aiSentimentScore < -0.3) negativeCount++;
        else neutralCount++;
      }
      if (c.aiImprovementCategory) {
        categories[c.aiImprovementCategory] = (categories[c.aiImprovementCategory] || 0) + 1;
      }
      if (c.aiExpertiseScore !== undefined && c.aiExpertiseScore !== null) {
        if (c.aiExpertiseScore > 0.7) expertiseLevels.high++;
        else if (c.aiExpertiseScore < 0.4) expertiseLevels.low++;
        else expertiseLevels.mid++;
      }
    });

    let summary = `Summary of ${comments.length} comments:
Sentiment: ${positiveCount} positive, ${neutralCount} neutral, ${negativeCount} negative.
Expertise: High ${expertiseLevels.high}, Mid ${expertiseLevels.mid}, Low ${expertiseLevels.low}.`;

    const topCategories = Object.entries(categories).sort(([,a],[,b]) => b-a).slice(0,3).map(([cat, count]) => `${cat} (${count})`).join(', ');
    if (topCategories) {
      summary += `\nTop Categories: ${topCategories}.`;
    }
    return summary;
  }

  static async createAIProposal(
    deckId: string,
    slideId: string,
    sourceComments: DeckComment[],
    currentSlideContent: DeckSection
  ): Promise<DeckAiUpdateProposal[]> {
    if (!aiService.isInitialized()) {
      console.warn('AI Service not initialized. Cannot create AI proposals.');
      return [];
    }
    if (sourceComments.length === 0) {
      console.log('No source comments provided to generate AI proposals.');
      return [];
    }

    // Prepare payload for the AI service
    const aiServiceComments: AiServiceCommentInput[] = sourceComments.map(c => ({
      id: c.id,
      textContent: c.textContent,
      authorDisplayName: c.authorDisplayName,
      commentType: c.commentType,
      declaredRole: c.declaredRole,
    }));

    const aiServiceSlideContent: AiServiceSlideContentInput = {
      title: currentSlideContent.title,
      elements: currentSlideContent.components.map(comp => ({
        id: comp.id,
        type: comp.type, // This should be BlockType
        data: comp.data,
      })),
    };

    const requestPayload: AiServiceRequestPayload = {
      deckId,
      slideId,
      comments: aiServiceComments,
      slideContent: aiServiceSlideContent,
      aggregatedInsightsSummary: this._summarizeCommentInsightsForAI(sourceComments), // Add summarized insights
    };

    const generatedSuggestions: AiGeneratedSuggestion[] = await aiService.generateSlideRewriteSuggestions(requestPayload);

    if (!generatedSuggestions || generatedSuggestions.length === 0) {
      console.log('AI service returned no suggestions.');
      return [];
    }

    const createdProposals: DeckAiUpdateProposal[] = [];

    // Fetch existing pending proposals for this slide to avoid duplicates
    const { data: existingProposalsData, error: fetchExistingError } = await supabase
      .from('deck_ai_update_proposals')
      .select('*')
      .eq('deck_id', deckId)
      .eq('slide_id', slideId)
      .eq('status', 'Pending');

    if (fetchExistingError) {
      console.error('Error fetching existing pending proposals:', fetchExistingError);
      // Depending on desired behavior, could throw or continue with potential duplicates
    }
    const existingPendingProposals: DeckAiUpdateProposal[] = (existingProposalsData || []).map(p => ({
      id: p.id,
      deckId: p.deck_id,
      slideId: p.slide_id,
      elementId: p.element_id,
      changeType: p.change_type as DeckAiUpdateProposal['changeType'],
      description: p.description,
      originalContentSnapshot: p.original_content_snapshot,
      proposedContentData: p.proposed_content_data as ProposedContentDataType,
      sourceCommentIds: p.source_comment_ids,
      aiConfidenceScore: p.ai_confidence_score,
      weightedFeedbackScore: p.weighted_feedback_score,
      status: p.status as DeckAiUpdateProposal['status'],
      ownerActionNotes: p.owner_action_notes,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));


    for (const suggestion of generatedSuggestions) {
      let changeType: DeckAiUpdateProposal['changeType'] = 'TextEdit'; // Default, will be overridden
      let newProposedContentData: ProposedContentDataType = null; // Renamed for clarity
      let targetElementIdForDb: string | undefined = suggestion.targetElementId;

      // Determine changeType and newProposedContentData based on suggestion.proposalCategory
      switch (suggestion.proposalCategory) {
        case 'ContentEdit':
          if (suggestion.suggestedContent?.newText) {
            changeType = 'TextEdit';
            newProposedContentData = { newTextContent: suggestion.suggestedContent.newText };
          } else if (suggestion.suggestedContent?.newImageUrl) {
            changeType = 'ImageSwap';
            newProposedContentData = { 
              newImageUrl: suggestion.suggestedContent.newImageUrl,
              newAltText: suggestion.suggestedContent.newAltText 
            };
          } else if (suggestion.suggestedContent?.newChartData) {
            changeType = 'ChartUpdate';
            newProposedContentData = { 
              newData: suggestion.suggestedContent.newChartData,
              newChartOptions: suggestion.suggestedContent.newChartOptions
            };
          } else {
            changeType = 'TextEdit'; 
            newProposedContentData = { note: suggestion.description }; 
          }
          break;
        case 'NewSlideElement':
          if (suggestion.newElementData) {
            changeType = 'NewElement';
            newProposedContentData = {
              componentType: suggestion.newElementData.componentType as BlockType,
              data: suggestion.newElementData.data,
              layout: suggestion.newElementData.layout,
            };
          }
          break;
        case 'SlideRestructure':
          if (suggestion.restructureOperation === 'DeleteElement' && suggestion.targetElementId) {
            changeType = 'DeleteElement';
            newProposedContentData = null; 
          } else if (suggestion.restructureOperation === 'ReorderElement' && suggestion.targetElementId && suggestion.restructureDetails?.newOrder !== undefined) {
            changeType = 'ReorderElement';
            newProposedContentData = { newOrder: suggestion.restructureDetails.newOrder };
          } else if (suggestion.restructureOperation === 'AddNewSlideAfter' && suggestion.restructureDetails?.newSlideData) {
            changeType = 'NewSlide';
            newProposedContentData = { 
              newSlideData: suggestion.restructureDetails.newSlideData,
              targetOrder: suggestion.restructureDetails.targetOrder ?? (currentSlideContent.order + 1)
            };
            targetElementIdForDb = undefined; 
          } else if (suggestion.restructureOperation === 'ReorderSlide' && suggestion.restructureDetails?.newOrder !== undefined) {
            changeType = 'ReorderSlide';
            newProposedContentData = { newOrder: suggestion.restructureDetails.newOrder };
            targetElementIdForDb = undefined; 
          }
          break;
        case 'GeneralAdvice':
          console.log(`General AI Advice for slide ${slideId}: ${suggestion.description}`);
          continue; 
      }
      
      // Check for duplicates
      const isDuplicate = existingPendingProposals.some(existingProposal => {
        return existingProposal.changeType === changeType &&
               existingProposal.elementId === targetElementIdForDb &&
               JSON.stringify(existingProposal.proposedContentData) === JSON.stringify(newProposedContentData);
      });

      if (isDuplicate) {
        console.log(`Skipping duplicate AI proposal: ${suggestion.description} for slide ${slideId}`);
        continue; 
      }
      
      let originalContentSnapshot: any = null;
      if (targetElementIdForDb && suggestion.proposalCategory === 'ContentEdit') {
        const originalElement = currentSlideContent.components.find(c => c.id === targetElementIdForDb);
        if (originalElement) {
          originalContentSnapshot = JSON.parse(JSON.stringify(originalElement.data)); 
        }
      }

      const proposalId = generateUUID();
      const weightedFeedbackScore = sourceComments.reduce((acc, comment) => acc + (comment.feedbackWeight || 1.0), 0) / sourceComments.length;

      const proposalForDb = {
        id: proposalId,
        deck_id: deckId,
        slide_id: slideId,
        element_id: targetElementIdForDb,
        change_type: changeType,
        description: suggestion.description,
        original_content_snapshot: originalContentSnapshot,
        proposed_content_data: newProposedContentData, // Use newProposedContentData
        source_comment_ids: sourceComments.map(c => c.id),
        ai_confidence_score: suggestion.confidenceScore,
        weighted_feedback_score: weightedFeedbackScore,
        status: 'Pending' as DeckAiUpdateProposal['status'],
      };

      const { data, error } = await supabase.from('deck_ai_update_proposals').insert(proposalForDb).select().single();
      
      if (error) {
        console.error(`Error saving AI proposal for suggestion: ${suggestion.description}`, error);
        continue; 
      }

      DeckService.logContentInteraction(deckId, 'AI_PROPOSAL_GENERATED',
        { proposalId: data.id, changeType: data.change_type, sourceCommentIds: data.source_comment_ids },
        undefined, slideId, targetElementIdForDb
      ).catch(logError => console.error("Logging failed for AI_PROPOSAL_GENERATED:", logError));
      
      createdProposals.push({
        id: data.id,
        deckId: data.deck_id,
        slideId: data.slide_id,
        elementId: data.element_id,
        changeType: data.change_type as DeckAiUpdateProposal['changeType'],
        description: data.description,
        originalContentSnapshot: data.original_content_snapshot,
        proposedContentData: data.proposed_content_data as ProposedContentDataType, // Ensure this is correct
        sourceCommentIds: data.source_comment_ids,
        aiConfidenceScore: data.ai_confidence_score,
        weightedFeedbackScore: data.weighted_feedback_score,
        status: data.status as DeckAiUpdateProposal['status'],
        ownerActionNotes: data.owner_action_notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    }
    return createdProposals;
  }

  static async getAIProposals(deckId: string, slideId?: string): Promise<DeckAiUpdateProposal[]> {
    try {
      let query = supabase.from('deck_ai_update_proposals').select('*').eq('deck_id', deckId).order('created_at', { ascending: false });
      if (slideId) query = query.eq('slide_id', slideId);
      const { data, error } = await query;
      if (error) { console.error('Error fetching AI proposals:', error); throw error; }
      return (data || []).map(p => ({
        id: p.id,
        deckId: p.deck_id,
        slideId: p.slide_id,
        elementId: p.element_id,
        changeType: p.change_type as DeckAiUpdateProposal['changeType'],
        description: p.description,
        originalContentSnapshot: p.original_content_snapshot,
        proposedContentData: p.proposed_content_data,
        sourceCommentIds: p.source_comment_ids,
        aiConfidenceScore: p.ai_confidence_score,
        weightedFeedbackScore: p.weighted_feedback_score,
        status: p.status as DeckAiUpdateProposal['status'],
        ownerActionNotes: p.owner_action_notes,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    } catch (error) { console.error('Error in getAIProposals:', error); return []; }
  }

  static async updateAIProposalStatus(
    proposalId: string,
    status: 'Accepted' | 'Rejected' | 'Modified' | 'Archived' | 'Pending',
    ownerActionNotes?: string
  ): Promise<DeckAiUpdateProposal | null> {
    try {
      const dbUpdates: { status: string; updated_at: string; owner_action_notes?: string } = 
        { status, updated_at: new Date().toISOString() };
      if (ownerActionNotes !== undefined) dbUpdates.owner_action_notes = ownerActionNotes;

      const { data: updatedProposalData, error } = await supabase
        .from('deck_ai_update_proposals').update(dbUpdates).eq('id', proposalId).select().single();
      if (error) { console.error('Error updating AI proposal status:', error); throw error; }
      if (!updatedProposalData) return null;

      const typedProposal: DeckAiUpdateProposal = {
        id: updatedProposalData.id,
        deckId: updatedProposalData.deck_id,
        slideId: updatedProposalData.slide_id,
        elementId: updatedProposalData.element_id,
        changeType: updatedProposalData.change_type as DeckAiUpdateProposal['changeType'],
        description: updatedProposalData.description,
        originalContentSnapshot: updatedProposalData.original_content_snapshot,
        proposedContentData: updatedProposalData.proposed_content_data,
        sourceCommentIds: updatedProposalData.source_comment_ids,
        aiConfidenceScore: updatedProposalData.ai_confidence_score,
        weightedFeedbackScore: updatedProposalData.weighted_feedback_score,
        status: updatedProposalData.status as DeckAiUpdateProposal['status'],
        ownerActionNotes: updatedProposalData.owner_action_notes,
        createdAt: updatedProposalData.created_at,
        updatedAt: updatedProposalData.updated_at,
      };

      if (status === 'Accepted' && typedProposal.deckId) {
        await DeckService._applyAcceptedProposal(typedProposal);
        DeckService.logContentInteraction(typedProposal.deckId, 'AI_PROPOSAL_ACCEPTED',
          { proposalId: typedProposal.id, status: typedProposal.status, ownerNotes: ownerActionNotes },
          undefined, typedProposal.slideId, typedProposal.elementId
        ).catch(logError => console.error("Logging failed for AI_PROPOSAL_ACCEPTED:", logError));
      } else if (status === 'Rejected' && typedProposal.deckId) {
        DeckService.logContentInteraction(typedProposal.deckId, 'AI_PROPOSAL_REJECTED',
          { proposalId: typedProposal.id, status: typedProposal.status, ownerNotes: ownerActionNotes },
          undefined, typedProposal.slideId, typedProposal.elementId
        ).catch(logError => console.error("Logging failed for AI_PROPOSAL_REJECTED:", logError));
      }
      return typedProposal;
    } catch (error) { console.error('Error in updateAIProposalStatus:', error); return null; }
  }

  private static async _applyAcceptedProposal(proposal: DeckAiUpdateProposal): Promise<void> {
    const deck = await this.loadDeck(proposal.deckId);
    if (!deck || !deck.user_id) { 
      console.error(`Deck or deck owner (user_id) not found for proposal ${proposal.id}. Deck user_id: ${deck?.user_id}`); 
      return; 
    }

    let deckWasModified = false;
    let finalSections = [...deck.sections]; // Work on a mutable copy

    switch (proposal.changeType) {
      case 'TextEdit':
        finalSections = finalSections.map(section => {
          if (section.id === proposal.slideId && proposal.elementId) {
            const proposedData = proposal.proposedContentData as TextEditProposedData | null;
            if (proposedData && typeof proposedData.newTextContent === 'string') {
              const updatedComponents = section.components.map(component => {
                if (component.id === proposal.elementId) {
                  // Assuming text content is stored in component.data.textContent or component.data.text
                  // This might need to be more robust based on component type
                  const dataKey = component.data && typeof component.data.textContent === 'string' ? 'textContent' : 'text';
                  
                  if (component.data && component.data[dataKey] !== proposedData.newTextContent) {
                    deckWasModified = true;
                    return { ...component, data: { ...component.data, [dataKey]: proposedData.newTextContent } };
                  }
                }
                return component;
              });
              if (deckWasModified) return { ...section, components: updatedComponents };
            }
          }
          return section;
        });
        break;

      case 'NewElement':
        finalSections = finalSections.map(section => {
          if (section.id === proposal.slideId) {
            const proposedData = proposal.proposedContentData as { componentType: BlockType, data: any, layout: VisualComponentLayout } | null;
            if (proposedData) {
              const newComponent: VisualComponent = {
                id: generateUUID(),
                type: proposedData.componentType,
                data: proposedData.data,
                layout: proposedData.layout,
                order: (section.components?.length || 0), // Append to end
              };
              deckWasModified = true;
              return { ...section, components: [...(section.components || []), newComponent] };
            }
          }
          return section;
        });
        break;

      case 'DeleteElement':
        finalSections = finalSections.map(section => {
          if (section.id === proposal.slideId && proposal.elementId) {
            const initialLength = section.components?.length || 0;
            const updatedComponents = (section.components || []).filter(c => c.id !== proposal.elementId);
            if (updatedComponents.length < initialLength) {
              deckWasModified = true;
              // Re-order remaining components
              const reorderedComponents = updatedComponents.map((comp, index) => ({ ...comp, order: index }));
              return { ...section, components: reorderedComponents };
            }
          }
          return section;
        });
        break;
      
      // TODO: Implement application logic for other proposal.changeType values
      // e.g., ImageSwap, ChartUpdate, ReorderElement, NewSlide, ReorderSlide etc.
      default:
        console.warn(`Accepted proposal changeType '${proposal.changeType}' not yet implemented for application.`);
        DeckService.logContentInteraction(proposal.deckId, 'AI_PROPOSAL_APPLY_UNIMPLEMENTED',
          { proposalId: proposal.id, changeType: proposal.changeType }, deck.user_id,
          proposal.slideId, proposal.elementId
        ).catch(logError => console.error("Logging failed for AI_PROPOSAL_APPLY_UNIMPLEMENTED:", logError));
        return; // Do not proceed to save if type is not handled
    }

    if (deckWasModified) {
      const updatedDeck: Deck = { ...deck, sections: finalSections, updated_at: new Date().toISOString() };
      // Removed duplicated line: const updatedDeck: Deck = { ...deck, sections: updatedSections, updated_at: new Date().toISOString() };
      try {
        await this.saveDeck(updatedDeck, deck.user_id);
        DeckService.logContentInteraction(proposal.deckId, 'AI_PROPOSAL_APPLIED',
          { proposalId: proposal.id, changeType: proposal.changeType }, deck.user_id,
          proposal.slideId, proposal.elementId
        ).catch(logError => console.error("Logging failed for AI_PROPOSAL_APPLIED:", logError));
      } catch (saveError) {
        console.error(`Error saving deck after applying proposal ${proposal.id}:`, saveError);
        DeckService.logContentInteraction(proposal.deckId, 'AI_PROPOSAL_APPLY_FAILED',
          { proposalId: proposal.id, error: (saveError as Error).message }, deck.user_id,
          proposal.slideId, proposal.elementId
        ).catch(logError => console.error("Logging failed for AI_PROPOSAL_APPLY_FAILED:", logError));
      }
    } else {
      DeckService.logContentInteraction(proposal.deckId, 'AI_PROPOSAL_ACCEPTED_NO_OP',
        { proposalId: proposal.id, changeType: proposal.changeType, elementId: proposal.elementId },
        deck.user_id, proposal.slideId, proposal.elementId
      ).catch(logError => console.error("Logging failed for AI_PROPOSAL_ACCEPTED_NO_OP:", logError));
    }
  }

  static async addComment(
    deckId: string,
    commentData: Omit<DeckComment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'reactions' |
                              'reviewerSessionId' | 'feedbackWeight' |
                              'aiSentimentScore' | 'aiExpertiseScore' | 'aiImprovementCategory'>,
    shareToken?: string,
    reviewerSessionId?: string
  ): Promise<DeckComment> {
    try {
      const newCommentId = generateUUID();
      let finalReviewerSessionId = reviewerSessionId;
      
      // AI Analysis
      let aiSentimentScore: number | undefined = undefined;
      let aiExpertiseScore: number | undefined = undefined;
      let aiImprovementCategory: string | undefined = undefined;

      if (commentData.textContent && aiService.isInitialized()) {
        const results = await Promise.allSettled([
          aiService.analyzeSentiment(commentData.textContent),
          aiService.detectExpertise(commentData.textContent),
          aiService.categorizeCommentTopics(commentData.textContent)
        ]);

        const sentimentResult = results[0];
        if (sentimentResult.status === 'fulfilled' && sentimentResult.value) {
          aiSentimentScore = sentimentResult.value.score;
        } else if (sentimentResult.status === 'rejected') {
          console.error("Error analyzing sentiment:", sentimentResult.reason);
        }

        const expertiseResult = results[1];
        if (expertiseResult.status === 'fulfilled' && expertiseResult.value) {
          aiExpertiseScore = expertiseResult.value.expertise_score;
        } else if (expertiseResult.status === 'rejected') {
          console.error("Error detecting expertise:", expertiseResult.reason);
        }

        const categoryResult = results[2];
        if (categoryResult.status === 'fulfilled' && categoryResult.value && categoryResult.value.length > 0) {
          // Assuming we take the first category if multiple are returned
          aiImprovementCategory = categoryResult.value[0].category;
        } else if (categoryResult.status === 'rejected') {
          console.error("Error categorizing comment topics:", categoryResult.reason);
        }
      }
      // End AI Analysis

      let calculatedFeedbackWeight = 1.0; 

      if (shareToken && !finalReviewerSessionId) {
        const tempSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const rSession = await this.createOrUpdateReviewerSession(shareToken, tempSessionId, {
          reviewerName: commentData.authorDisplayName, 
          userId: commentData.authorUserId ?? undefined,
        });
        finalReviewerSessionId = rSession.id;
      }
      
      let shareLinkDetails: SmartShareLink | null = null;
      if (finalReviewerSessionId) {
         const {data: sessionWithLink, error: sessionError} = await supabase
            .from('reviewer_sessions')
            .select(`
              *,
              smart_share_links (
                custom_weights,
                target_roles,
                focus_areas
              )
            `)
            .eq('id', finalReviewerSessionId)
            .single();

         if (sessionError) console.warn(`Error fetching session with link: ${sessionError.message}`);
         else if (sessionWithLink && sessionWithLink.smart_share_links) {
           shareLinkDetails = sessionWithLink.smart_share_links as SmartShareLink; 
           if (shareLinkDetails && shareLinkDetails.customWeights && commentData.declaredRole && 
               shareLinkDetails.customWeights[commentData.declaredRole]) {
             calculatedFeedbackWeight = shareLinkDetails.customWeights[commentData.declaredRole];
           }
         }
      }

      const dbCommentData = {
        id: newCommentId,
        deck_id: deckId,
        slide_id: commentData.slideId,
        element_id: commentData.elementId,
        parent_comment_id: commentData.parentCommentId,
        author_user_id: commentData.authorUserId ?? null,
        author_display_name: commentData.authorDisplayName,
        coordinates_x: commentData.coordinates?.x,
        coordinates_y: commentData.coordinates?.y,
        text_content: commentData.textContent,
        rich_text_content: commentData.richTextContent,
        voice_note_url: commentData.voiceNoteUrl,
        voice_transcription: commentData.voiceTranscription,
        markup_data: commentData.markupData,
        comment_type: commentData.commentType,
        urgency: commentData.urgency,
        status: commentData.status || 'Open',
        reviewer_session_id: finalReviewerSessionId,
        declared_role: commentData.declaredRole, 
        feedback_weight: calculatedFeedbackWeight,
        focus_area: commentData.focusArea,
        // Add AI fields
        ai_sentiment_score: aiSentimentScore,
        ai_expertise_score: aiExpertiseScore,
        ai_improvement_category: aiImprovementCategory,
        // Add new classification fields
        feedback_category: commentData.feedback_category || 'General',
        component_id: commentData.component_id,
      };

      const { data, error } = await supabase
        .from('deck_comments')
        .insert(dbCommentData)
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw new Error('Failed to add comment');
      }
      
      DeckService.logContentInteraction(
        deckId, 'COMMENT_ADD',
        { commentId: data.id, slideId: data.slide_id, viaShareToken: !!shareToken, reviewerSessionId: finalReviewerSessionId },
        data.author_user_id, data.slide_id, data.element_id, finalReviewerSessionId
      ).catch(logError => console.error("Logging failed for COMMENT_ADD:", logError));

      return {
        id: data.id,
        deckId: data.deck_id,
        slideId: data.slide_id,
        elementId: data.element_id,
        parentCommentId: data.parent_comment_id,
        authorUserId: data.author_user_id,
        authorDisplayName: data.author_display_name,
        coordinates: (data.coordinates_x !== null && data.coordinates_y !== null) ? { x: data.coordinates_x, y: data.coordinates_y } : undefined,
        textContent: data.text_content,
        richTextContent: data.rich_text_content,
        voiceNoteUrl: data.voice_note_url,
        voiceTranscription: data.voice_transcription,
        markupData: data.markup_data,
        commentType: data.comment_type as DeckComment['commentType'],
        urgency: data.urgency as DeckComment['urgency'],
        status: data.status as DeckComment['status'],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewerSessionId: data.reviewer_session_id,
        declaredRole: data.declared_role,
        feedbackWeight: data.feedback_weight,
        aiSentimentScore: data.ai_sentiment_score,
        aiExpertiseScore: data.ai_expertise_score,
        aiImprovementCategory: data.ai_improvement_category,
        focusArea: data.focus_area,
        feedback_category: data.feedback_category as FeedbackCategory,
        component_id: data.component_id,
        is_edited: data.is_edited,
        edit_history: data.edit_history,
      };
    } catch (error) {
      console.error('Exception in addComment:', error);
      throw error;
    }
  }

  static async updateComment(
    commentId: string,
    updates: Partial<DeckComment>
  ): Promise<DeckComment> {
    try {
      const existingComment = await this.getCommentById(commentId);
      if (!existingComment) {
        throw new Error(`Comment with ID ${commentId} not found.`);
      }

      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.textContent !== undefined && updates.textContent !== existingComment.textContent) {
        dbUpdates.text_content = updates.textContent;
        dbUpdates.is_edited = true;
      }
      
      if (updates.feedback_category !== undefined && updates.feedback_category !== existingComment.feedback_category) {
        dbUpdates.feedback_category = updates.feedback_category;
      }

      if (updates.status !== undefined && updates.status !== existingComment.status) {
        dbUpdates.status = updates.status;
      }

      if (dbUpdates.is_edited) {
        const editHistoryEntry = {
          timestamp: existingComment.updatedAt,
          oldValues: {
            textContent: existingComment.textContent,
          },
        };
        const newEditHistory = Array.isArray(existingComment.edit_history)
          ? [...existingComment.edit_history, editHistoryEntry]
          : [editHistoryEntry];
        dbUpdates.edit_history = newEditHistory;
      }

      if (Object.keys(dbUpdates).length === 1) {
        return existingComment;
      }

      const { data, error } = await supabase
        .from('deck_comments')
        .update(dbUpdates)
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating comment ${commentId}:`, error);
        throw new Error('Failed to update comment');
      }

      return {
        id: data.id,
        deckId: data.deck_id,
        slideId: data.slide_id,
        elementId: data.element_id,
        parentCommentId: data.parent_comment_id,
        authorUserId: data.author_user_id,
        authorDisplayName: data.author_display_name,
        coordinates: (data.coordinates_x !== null && data.coordinates_y !== null) ? { x: data.coordinates_x, y: data.coordinates_y } : undefined,
        textContent: data.text_content,
        richTextContent: data.rich_text_content,
        voiceNoteUrl: data.voice_note_url,
        voiceTranscription: data.voice_transcription,
        markupData: data.markup_data,
        commentType: data.comment_type as DeckComment['commentType'],
        urgency: data.urgency as DeckComment['urgency'],
        status: data.status as DeckComment['status'],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewerSessionId: data.reviewer_session_id,
        declaredRole: data.declared_role,
        feedbackWeight: data.feedback_weight,
        aiSentimentScore: data.ai_sentiment_score,
        aiExpertiseScore: data.ai_expertise_score,
        aiImprovementCategory: data.ai_improvement_category,
        focusArea: data.focus_area,
        feedback_category: data.feedback_category as FeedbackCategory,
        component_id: data.component_id,
        is_edited: data.is_edited,
        edit_history: data.edit_history,
      };
    } catch (error) {
      console.error(`Exception in updateComment for comment ${commentId}:`, error);
      throw error;
    }
  }

  static async updateCommentContent(commentId: string, textContent: string, feedbackCategory: FeedbackCategory): Promise<DeckComment> {
    try {
      const { data, error } = await supabase
        .from('deck_comments')
        .update({
          text_content: textContent,
          feedback_category: feedbackCategory,
          updated_at: new Date().toISOString(),
          is_edited: true,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating comment content for comment ${commentId}:`, error);
        throw new Error('Failed to update comment content');
      }

      return {
        id: data.id,
        deckId: data.deck_id,
        slideId: data.slide_id,
        elementId: data.element_id,
        parentCommentId: data.parent_comment_id,
        authorUserId: data.author_user_id,
        authorDisplayName: data.author_display_name,
        coordinates: (data.coordinates_x !== null && data.coordinates_y !== null) ? { x: data.coordinates_x, y: data.coordinates_y } : undefined,
        textContent: data.text_content,
        richTextContent: data.rich_text_content,
        voiceNoteUrl: data.voice_note_url,
        voiceTranscription: data.voice_transcription,
        markupData: data.markup_data,
        commentType: data.comment_type as DeckComment['commentType'],
        urgency: data.urgency as DeckComment['urgency'],
        status: data.status as DeckComment['status'],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewerSessionId: data.reviewer_session_id,
        declaredRole: data.declared_role,
        feedbackWeight: data.feedback_weight,
        aiSentimentScore: data.ai_sentiment_score,
        aiExpertiseScore: data.ai_expertise_score,
        aiImprovementCategory: data.ai_improvement_category,
        focusArea: data.focus_area,
        feedback_category: data.feedback_category as FeedbackCategory,
        component_id: data.component_id,
        is_edited: data.is_edited,
        edit_history: data.edit_history,
      };
    } catch (error) {
      console.error(`Exception in updateCommentContent for comment ${commentId}:`, error);
      throw error;
    }
  }

  static async deleteComment(commentId: string, deckId: string, userId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('deck_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        throw new Error('Failed to delete comment');
      }
      
      DeckService.logContentInteraction(
        deckId,
        'COMMENT_DELETE',
        { commentId },
        userId
      ).catch(logError => console.error("Logging failed for COMMENT_DELETE:", logError));

    } catch (error) {
      console.error('Exception in deleteComment:', error);
      throw error;
    }
  }

  static async getComments(deckId: string, slideId?: string): Promise<DeckComment[]> {
    try {
      let query = supabase
        .from('deck_comments')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true });

      if (slideId) {
        query = query.eq('slide_id', slideId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to fetch comments');
      }

      return (data || []).map(c => ({
        id: c.id,
        deckId: c.deck_id,
        slideId: c.slide_id,
        elementId: c.element_id,
        parentCommentId: c.parent_comment_id,
        authorUserId: c.author_user_id,
        authorDisplayName: c.author_display_name,
        coordinates: (c.coordinates_x !== null && c.coordinates_y !== null) ? { x: c.coordinates_x, y: c.coordinates_y } : undefined,
        textContent: c.text_content,
        richTextContent: c.rich_text_content,
        voiceNoteUrl: c.voice_note_url,
        voiceTranscription: c.voice_transcription,
        markupData: c.markup_data,
        commentType: c.comment_type as DeckComment['commentType'],
        urgency: c.urgency as DeckComment['urgency'],
        status: c.status as DeckComment['status'],
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        reviewerSessionId: c.reviewer_session_id,
        declaredRole: c.declared_role,
        feedbackWeight: c.feedback_weight,
        aiSentimentScore: c.ai_sentiment_score,
        aiExpertiseScore: c.ai_expertise_score,
        aiImprovementCategory: c.ai_improvement_category,
        focusArea: c.focus_area,
        feedback_category: c.feedback_category as FeedbackCategory,
        component_id: c.component_id,
        is_edited: c.is_edited,
        edit_history: c.edit_history,
      }));
    } catch (error) {
      console.error('Exception in getComments:', error);
      throw error;
    }
  }

  static subscribeToDeckComments(deckId: string, callback: (comments: DeckComment[]) => void): () => void {
    const channel = supabase.channel(`deck-comments-${deckId}`);
  
    const subscription = channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deck_comments', filter: `deck_id=eq.${deckId}` },
        async (payload) => {
          console.log('Real-time change received:', payload);
          // Refetch all comments for the deck to ensure consistency
          const updatedComments = await this.getComments(deckId);
          callback(updatedComments);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to deck comments for deck ${deckId}`);
        }
        if (err) {
          console.error(`Error subscribing to deck comments for deck ${deckId}:`, err);
        }
      });
  
    return () => {
      console.log(`Unsubscribing from deck comments for deck ${deckId}`);
      supabase.removeChannel(channel);
    };
  }
  
  private static async getCommentById(commentId: string): Promise<DeckComment | null> {
    const { data, error } = await supabase
      .from('deck_comments')
      .select('*')
      .eq('id', commentId)
      .single();
    if (error) {
      console.warn(`Error fetching comment by ID ${commentId}: ${error.message}`);
      return null;
    }
    if (!data) return null;
    return {
        id: data.id,
        deckId: data.deck_id,
        slideId: data.slide_id,
        elementId: data.element_id,
        parentCommentId: data.parent_comment_id,
        authorUserId: data.author_user_id,
        authorDisplayName: data.author_display_name,
        coordinates: (data.coordinates_x !== null && data.coordinates_y !== null) ? { x: data.coordinates_x, y: data.coordinates_y } : undefined,
        textContent: data.text_content,
        richTextContent: data.rich_text_content,
        voiceNoteUrl: data.voice_note_url,
        voiceTranscription: data.voice_transcription,
        markupData: data.markup_data,
        commentType: data.comment_type as DeckComment['commentType'],
        urgency: data.urgency as DeckComment['urgency'],
        status: data.status as DeckComment['status'],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewerSessionId: data.reviewer_session_id,
        declaredRole: data.declared_role,
        feedbackWeight: data.feedback_weight,
        aiSentimentScore: data.ai_sentiment_score,
        aiExpertiseScore: data.ai_expertise_score,
        aiImprovementCategory: data.ai_improvement_category,
        focusArea: data.focus_area,
        feedback_category: data.feedback_category as FeedbackCategory,
        component_id: data.component_id,
        is_edited: data.is_edited,
        edit_history: data.edit_history,
      };
  }

  static async logContentInteraction(
    deckId: string,
    actionType: string, 
    details: Record<string, any>,
    userId?: string, 
    slideId?: string,
    elementId?: string,
    sessionId?: string 
  ): Promise<void> {
    try {
      const logEntry = {
        deck_id: deckId,
        action_type: actionType,
        details: details,
        user_id: userId,
        slide_id: slideId,
        element_id: elementId,
        session_id: sessionId,
      };
      const { error } = await supabase.from('deck_content_interaction_logs').insert(logEntry);
      if (error) {
        console.error(`Error logging content interaction (${actionType}):`, error);
      }
    } catch (e) {
      console.error('Exception in logContentInteraction:', e);
    }
  }

  static async generateAndStoreAggregatedInsights(deckId: string, shareToken?: string): Promise<AIFeedbackInsight | null> {
    try {
      const comments = await this.getComments(deckId);
      if (!comments || comments.length === 0) {
        console.log(`No comments found for deck ${deckId} to generate aggregated insights.`);
        return null;
      }

      let totalComments = comments.length;
      let positiveSentiments = 0;
      let neutralSentiments = 0;
      let negativeSentiments = 0;
      let sumSentimentScore = 0;
      let sentimentScoresCount = 0;

      const categoryCounts: Record<string, number> = {};
      const expertiseCounts = { low: 0, mid: 0, high: 0 };

      comments.forEach(comment => {
        if (comment.aiSentimentScore !== undefined && comment.aiSentimentScore !== null) {
          sumSentimentScore += comment.aiSentimentScore;
          sentimentScoresCount++;
          if (comment.aiSentimentScore > 0.3) positiveSentiments++;
          else if (comment.aiSentimentScore < -0.3) negativeSentiments++;
          else neutralSentiments++;
        }
        if (comment.aiImprovementCategory) {
          categoryCounts[comment.aiImprovementCategory] = (categoryCounts[comment.aiImprovementCategory] || 0) + 1;
        }
        if (comment.aiExpertiseScore !== undefined && comment.aiExpertiseScore !== null) {
          if (comment.aiExpertiseScore > 0.7) expertiseCounts.high++;
          else if (comment.aiExpertiseScore < 0.4) expertiseCounts.low++; // Corrected to expertiseCounts.low++
          else expertiseCounts.mid++;
        }
      });

      const averageSentimentScore = sentimentScoresCount > 0 ? sumSentimentScore / sentimentScoresCount : 0;
      
      // Consider calling a dedicated AI function for a textual summary of themes if available
      // For now, using category counts as themes.
      const keyThemes = Object.entries(categoryCounts)
        .sort(([,a],[,b]) => b-a) // Sort by count descending
        .slice(0, 5) // Take top 5
        .map(([category, count]) => ({ category, count }));

      const insightsData = {
        totalComments,
        sentimentBreakdown: {
          positive: positiveSentiments,
          neutral: neutralSentiments,
          negative: negativeSentiments,
          averageScore: parseFloat(averageSentimentScore.toFixed(2)),
        },
        keyThemes, // Based on aiImprovementCategory counts
        expertiseDistribution: expertiseCounts,
        // Potentially add more insights like most commented slide, etc.
      };

      const insightRecord = {
        deck_id: deckId,
        share_token: shareToken, // Optional, could be null
        analysis_type: 'deck_comment_summary_v1',
        insights: insightsData,
        confidence_score: 0.8, // Placeholder confidence for the aggregation process itself
      };

      const { data, error } = await supabase
        .from('ai_feedback_insights')
        .insert(insightRecord)
        .select()
        .single();

      if (error) {
        console.error('Error storing aggregated AI feedback insights:', error);
        throw error;
      }
      
      DeckService.logContentInteraction(
        deckId,
        'AI_AGGREGATED_INSIGHTS_GENERATED',
        { insightId: data.id, analysisType: data.analysis_type, commentCount: totalComments },
        undefined, // Assuming system-generated or triggered by owner later
        undefined,
        shareToken
      ).catch(logError => console.error("Logging failed for AI_AGGREGATED_INSIGHTS_GENERATED:", logError));


      return {
        id: data.id,
        deckId: data.deck_id,
        shareToken: data.share_token,
        analysisType: data.analysis_type,
        insights: data.insights,
        confidenceScore: data.confidence_score,
        generatedAt: data.generated_at,
      };

    } catch (error) {
      console.error('Error generating and storing aggregated AI insights:', error);
      DeckService.logContentInteraction(
        deckId,
        'AI_AGGREGATED_INSIGHTS_FAILED',
        { error: (error as Error).message },
        undefined,
        undefined,
        shareToken
      ).catch(logError => console.error("Logging failed for AI_AGGREGATED_INSIGHTS_FAILED:", logError));
      return null;
    }
  }
}
