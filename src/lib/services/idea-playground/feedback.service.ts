/**
 * Types of feedback that can be provided on ideas
 */
export enum FeedbackType {
  GENERAL = 'general',
  PROBLEM_STATEMENT = 'problem_statement',
  SOLUTION = 'solution',
  BUSINESS_MODEL = 'business_model',
  MARKET_FIT = 'market_fit',
  TECHNICAL_FEASIBILITY = 'technical_feasibility',
  COMPETITIVE_ANALYSIS = 'competitive_analysis'
}

/**
 * Feedback data structure
 */
export interface IdeaFeedback {
  id: string;
  ideaId: string;
  content: string;
  rating?: number;
  type: FeedbackType | string;
  userId?: string;
  createdAt: string;
}

/**
 * Service for handling feedback on business ideas
 */
export class FeedbackService {
  private feedbackStore: Map<string, IdeaFeedback[]> = new Map();
  
  /**
   * Save feedback for an idea
   * 
   * @param ideaId The idea ID
   * @param feedback The feedback text
   * @param rating Optional rating (1-5)
   * @param type Type of feedback
   * @param userId Optional user ID of the feedback provider
   * @returns Success status
   */
  async saveFeedback(
    ideaId: string, 
    feedback: string, 
    rating?: number, 
    type: FeedbackType | string = FeedbackType.GENERAL,
    userId?: string
  ): Promise<boolean> {
    try {
      // Validate input
      if (!ideaId || !feedback) {
        console.error('Invalid feedback: missing ideaId or feedback content');
        return false;
      }
      
      // Create feedback object
      const feedbackItem: IdeaFeedback = {
        id: this.generateId(),
        ideaId,
        content: feedback,
        rating: rating ? Math.min(Math.max(1, rating), 5) : undefined, // Ensure rating is between 1-5
        type,
        userId,
        createdAt: new Date().toISOString()
      };
      
      // Get existing feedback for this idea or create a new array
      const existingFeedback = this.feedbackStore.get(ideaId) || [];
      
      // Add the new feedback
      existingFeedback.push(feedbackItem);
      
      // Update the store
      this.feedbackStore.set(ideaId, existingFeedback);
      
      return true;
    } catch (error) {
      console.error('Error saving feedback:', error);
      return false;
    }
  }
  
  /**
   * Get all feedback for a specific idea
   * 
   * @param ideaId The idea ID
   * @returns Array of feedback items
   */
  async getFeedbackForIdea(ideaId: string): Promise<IdeaFeedback[]> {
    return this.feedbackStore.get(ideaId) || [];
  }
  
  /**
   * Get all feedback of a specific type for an idea
   * 
   * @param ideaId The idea ID
   * @param type The feedback type
   * @returns Array of feedback items of the specified type
   */
  async getFeedbackByType(ideaId: string, type: FeedbackType | string): Promise<IdeaFeedback[]> {
    const allFeedback = await this.getFeedbackForIdea(ideaId);
    return allFeedback.filter(item => item.type === type);
  }
  
  /**
   * Get the average rating for an idea
   * 
   * @param ideaId The idea ID
   * @returns Average rating or null if no ratings exist
   */
  async getAverageRating(ideaId: string): Promise<number | null> {
    const feedback = await this.getFeedbackForIdea(ideaId);
    const ratingsCount = feedback.filter(item => item.rating !== undefined).length;
    
    if (ratingsCount === 0) {
      return null;
    }
    
    const totalRating = feedback.reduce((sum, item) => sum + (item.rating || 0), 0);
    return totalRating / ratingsCount;
  }
  
  /**
   * Delete a specific feedback item
   * 
   * @param feedbackId The feedback ID to delete
   * @returns Success status
   */
  async deleteFeedback(feedbackId: string): Promise<boolean> {
    try {
      // Iterate through all ideas in the store
      for (const [ideaId, feedbackList] of this.feedbackStore.entries()) {
        const index = feedbackList.findIndex(item => item.id === feedbackId);
        
        if (index !== -1) {
          // Remove the feedback item
          feedbackList.splice(index, 1);
          this.feedbackStore.set(ideaId, feedbackList);
          return true;
        }
      }
      
      // Feedback not found
      return false;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return false;
    }
  }
  
  /**
   * Clear all feedback for an idea
   * 
   * @param ideaId The idea ID
   * @returns Success status
   */
  async clearFeedbackForIdea(ideaId: string): Promise<boolean> {
    try {
      this.feedbackStore.delete(ideaId);
      return true;
    } catch (error) {
      console.error('Error clearing feedback:', error);
      return false;
    }
  }
  
  /**
   * Generate a unique ID for a feedback item
   * 
   * @returns Unique ID
   */
  private generateId(): string {
    return 'feedback_' + Math.random().toString(36).substring(2, 11);
  }
}
