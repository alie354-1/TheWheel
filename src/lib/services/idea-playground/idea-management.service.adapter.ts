import { IdeaGenerationResult } from './idea-generation.service';
import { RefinementResult } from './refinement.service';
import { IdeaStatus, IdeaManagementService } from './idea-management.service';
import { StoredIdea, IdeaQueryOptions, IdeaPlaygroundIdea } from '../../types/idea-playground.types';

/**
 * Adapter class that wraps the new IdeaManagementService to make it compatible
 * with the facade's expected interface.
 */
export class IdeaManagementServiceAdapter {
  private service: IdeaManagementService;

  constructor(service?: IdeaManagementService) {
    this.service = service || new IdeaManagementService();
  }

  /**
   * Create a new idea with additional metadata
   */
  async createIdea(
    idea: IdeaGenerationResult, 
    userId?: string, 
    teamId?: string
  ): Promise<StoredIdea> {
    const ideaId = await this.service.createIdea(idea);
    
    const storedIdea: StoredIdea = {
      id: ideaId,
      title: idea.title,
      status: IdeaStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      tags: Array.isArray(idea.tags) ? [...idea.tags] : [],
      content: idea,
      refinementHistory: [],
      userId,
      teamId,
      attributes: {}
    };
    
    return storedIdea;
  }

  /**
   * Update an existing idea
   */
  async updateIdea(ideaId: string, updates: Partial<StoredIdea>): Promise<StoredIdea> {
    const idea = await this.service.getIdea(ideaId);
    if (!idea) {
      throw new Error(`Idea with ID ${ideaId} not found`);
    }

    // Update content if provided
    if (updates.content) {
      await this.service.updateIdeaContent(ideaId, updates.content);
    }

    // Update status if provided
    if (updates.status) {
      await this.service.updateIdeaStatus(ideaId, updates.status);
    }

    // Update tags if provided
    if (updates.tags) {
      await this.service.updateTags(ideaId, updates.tags);
    }

    // Update label if provided
    if (updates.label) {
      await this.service.setLabel(ideaId, updates.label, updates.labelColor);
    }

    // Update favorite status if explicitly provided
    if (updates.isFavorite !== undefined && updates.isFavorite !== idea.meta.isFavorite) {
      await this.service.toggleFavorite(ideaId);
    }

    // Get the updated idea
    const updatedIdea = await this.service.getIdea(ideaId);
    if (!updatedIdea) {
      throw new Error(`Idea with ID ${ideaId} not found after updating`);
    }

    // Convert to StoredIdea format
    return this.convertToStoredIdea(updatedIdea);
  }

  /**
   * Apply a refinement to an idea
   */
  async applyRefinement(ideaId: string, refinement: RefinementResult): Promise<StoredIdea> {
    const success = await this.service.addRefinement(ideaId, refinement);
    
    if (!success) {
      throw new Error(`Failed to apply refinement to idea with ID ${ideaId}`);
    }
    
    // Get the updated idea
    const updatedIdea = await this.service.getIdea(ideaId);
    if (!updatedIdea) {
      throw new Error(`Idea with ID ${ideaId} not found after applying refinement`);
    }
    
    // Convert to StoredIdea format
    return this.convertToStoredIdea(updatedIdea);
  }

  /**
   * Get an idea by ID
   */
  async getIdea(ideaId: string): Promise<StoredIdea | null> {
    const idea = await this.service.getIdea(ideaId);
    
    if (!idea) {
      return null;
    }
    
    return this.convertToStoredIdea(idea);
  }

  /**
   * Get all ideas with optional filtering
   */
  async getIdeas(options: IdeaQueryOptions = {}): Promise<StoredIdea[]> {
    let ideas = await this.service.getAllIdeas(options.status);
    
    // Apply additional filtering
    if (options.userId) {
      ideas = ideas.filter(idea => idea.meta.createdBy === options.userId);
    }
    
    if (options.onlyFavorites) {
      ideas = ideas.filter(idea => idea.meta.isFavorite);
    }
    
    if (options.tags && options.tags.length > 0) {
      ideas = ideas.filter(idea => {
        const ideaTags = idea.meta.tags.map(tag => tag.toLowerCase());
        return options.tags!.some(tag => ideaTags.includes(tag.toLowerCase()));
      });
    }
    
    if (options.searchText) {
      const searchText = options.searchText.toLowerCase();
      ideas = ideas.filter(idea => {
        return (
          idea.meta.title.toLowerCase().includes(searchText) ||
          idea.content.description.toLowerCase().includes(searchText) ||
          (idea.content.problem_statement && idea.content.problem_statement.toLowerCase().includes(searchText)) ||
          (idea.content.solution_concept && idea.content.solution_concept.toLowerCase().includes(searchText))
        );
      });
    }
    
    // Convert all to StoredIdea format
    return ideas.map(idea => this.convertToStoredIdea(idea));
  }

  /**
   * Change the status of an idea
   */
  async changeIdeaStatus(ideaId: string, status: IdeaStatus): Promise<StoredIdea> {
    const success = await this.service.updateIdeaStatus(ideaId, status);
    
    if (!success) {
      throw new Error(`Failed to update status for idea with ID ${ideaId}`);
    }
    
    // Get the updated idea
    const updatedIdea = await this.service.getIdea(ideaId);
    if (!updatedIdea) {
      throw new Error(`Idea with ID ${ideaId} not found after updating status`);
    }
    
    // Convert to StoredIdea format
    return this.convertToStoredIdea(updatedIdea);
  }

  /**
   * Delete an idea
   */
  async deleteIdea(ideaId: string): Promise<boolean> {
    return this.service.deleteIdea(ideaId);
  }

  /**
   * Add tags to an idea
   */
  async addTags(ideaId: string, tags: string[]): Promise<StoredIdea> {
    const idea = await this.service.getIdea(ideaId);
    
    if (!idea) {
      throw new Error(`Idea with ID ${ideaId} not found`);
    }
    
    // Combine existing tags with new tags, remove duplicates
    const newTags = Array.from(new Set([...idea.meta.tags, ...tags]));
    
    const success = await this.service.updateTags(ideaId, newTags);
    
    if (!success) {
      throw new Error(`Failed to add tags to idea with ID ${ideaId}`);
    }
    
    // Get the updated idea
    const updatedIdea = await this.service.getIdea(ideaId);
    if (!updatedIdea) {
      throw new Error(`Idea with ID ${ideaId} not found after adding tags`);
    }
    
    // Convert to StoredIdea format
    return this.convertToStoredIdea(updatedIdea);
  }

  /**
   * Remove tags from an idea
   */
  async removeTags(ideaId: string, tags: string[]): Promise<StoredIdea> {
    const idea = await this.service.getIdea(ideaId);
    
    if (!idea) {
      throw new Error(`Idea with ID ${ideaId} not found`);
    }
    
    // Filter out the tags to be removed
    const tagsLowercase = tags.map(tag => tag.toLowerCase());
    const newTags = idea.meta.tags.filter(tag => !tagsLowercase.includes(tag.toLowerCase()));
    
    const success = await this.service.updateTags(ideaId, newTags);
    
    if (!success) {
      throw new Error(`Failed to remove tags from idea with ID ${ideaId}`);
    }
    
    // Get the updated idea
    const updatedIdea = await this.service.getIdea(ideaId);
    if (!updatedIdea) {
      throw new Error(`Idea with ID ${ideaId} not found after removing tags`);
    }
    
    // Convert to StoredIdea format
    return this.convertToStoredIdea(updatedIdea);
  }

  /**
   * Convert internal CompleteIdea to the StoredIdea format expected by the facade
   */
  private convertToStoredIdea(idea: any): StoredIdea {
    return {
      id: idea.meta.id,
      title: idea.meta.title,
      status: idea.meta.status,
      createdAt: idea.meta.createdAt,
      updatedAt: idea.meta.updatedAt,
      userId: idea.meta.createdBy,
      isFavorite: idea.meta.isFavorite,
      tags: [...idea.meta.tags],
      label: idea.meta.label,
      labelColor: idea.meta.labelColor,
      content: { ...idea.content },
      refinementHistory: [...idea.refinements],
      businessModelCanvas: idea.businessModelCanvas ? { ...idea.businessModelCanvas } : undefined,
      valuePropositionCanvas: idea.valuePropositionCanvas ? { ...idea.valuePropositionCanvas } : undefined,
      attributes: idea.attributes ? { ...idea.attributes } : {}
    };
  }

  /**
   * Convert from legacy IdeaPlaygroundIdea to the new CompleteIdea format
   */
  convertFromLegacyIdea(legacyIdea: IdeaPlaygroundIdea): any {
    return {
      meta: {
        id: legacyIdea.id,
        title: legacyIdea.title,
        status: legacyIdea.status,
        createdAt: legacyIdea.createdAt,
        updatedAt: legacyIdea.updatedAt,
        createdBy: legacyIdea.userId,
        isFavorite: legacyIdea.isFavorite,
        tags: [...legacyIdea.tags],
        label: legacyIdea.label,
        labelColor: legacyIdea.labelColor
      },
      content: {
        title: legacyIdea.title,
        description: legacyIdea.description,
        problem_statement: legacyIdea.problem_statement,
        solution_concept: legacyIdea.solution_concept,
        target_audience: legacyIdea.target_audience,
        unique_value: legacyIdea.unique_value,
        business_model: legacyIdea.business_model,
        tags: [...legacyIdea.tags]
      },
      refinements: [],
      attributes: legacyIdea.attributes || {}
    };
  }
}
