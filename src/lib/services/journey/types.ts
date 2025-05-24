/**
 * Journey Service Types
 */

export interface Journey {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JourneyStep {
  id: string;
  journeyId: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  order: number;
  estimatedTimeMin?: number;
  estimatedTimeMax?: number;
  actualTimeSpent?: number;
  completedAt?: string;
  startedAt?: string;
  assignedTo?: string[];
  toolRecommendations?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JourneyChallenge {
  id: string;
  journeyId: string;
  name: string;
  description?: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  estimatedTimeMin?: number;
  estimatedTimeMax?: number;
  keyOutcomes?: string[];
  toolRecommendations?: string[];
  completedAt?: string;
  startedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JourneyService {
  /**
   * Get journeys for a company
   */
  getJourneys(companyId: string): Promise<Journey[]>;
  
  /**
   * Get a specific journey
   */
  getJourney(journeyId: string): Promise<Journey | null>;
  
  /**
   * Create a new journey
   */
  createJourney(journey: Omit<Journey, 'id' | 'createdAt' | 'updatedAt'>): Promise<Journey>;
  
  /**
   * Update a journey
   */
  updateJourney(journeyId: string, updates: Partial<Journey>): Promise<Journey>;
  
  /**
   * Delete a journey
   */
  deleteJourney(journeyId: string): Promise<void>;
  
  /**
   * Get steps for a journey
   */
  getJourneySteps(journeyId: string): Promise<JourneyStep[]>;
  
  /**
   * Get a specific step
   */
  getJourneyStep(stepId: string): Promise<JourneyStep | null>;
  
  /**
   * Create a journey step
   */
  createJourneyStep(step: Omit<JourneyStep, 'id' | 'createdAt' | 'updatedAt'>): Promise<JourneyStep>;
  
  /**
   * Update a journey step
   */
  updateJourneyStep(stepId: string, updates: Partial<JourneyStep>): Promise<JourneyStep>;
  
  /**
   * Delete a journey step
   */
  deleteJourneyStep(stepId: string): Promise<void>;
  
  /**
   * Get challenges for a journey
   */
  getJourneyChallenges(journeyId: string): Promise<JourneyChallenge[]>;
  
  /**
   * Get a specific challenge
   */
  getJourneyChallenge(challengeId: string): Promise<JourneyChallenge | null>;
  
  /**
   * Create a journey challenge
   */
  createJourneyChallenge(challenge: Omit<JourneyChallenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<JourneyChallenge>;
  
  /**
   * Update a journey challenge
   */
  updateJourneyChallenge(challengeId: string, updates: Partial<JourneyChallenge>): Promise<JourneyChallenge>;
  
  /**
   * Delete a journey challenge
   */
  deleteJourneyChallenge(challengeId: string): Promise<void>;
  
  /**
   * Get AI enrichment for a journey step
   */
  getStepEnrichment(stepId: string): Promise<any>;
  
  /**
   * Generate AI answers for a journey board
   */
  generateBoardAnswers(journeyId: string, question: string): Promise<string>;
}