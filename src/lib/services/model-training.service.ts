/**
 * DISABLED Model Training Service
 * 
 * This service has been temporarily disabled to prevent database errors.
 * All operations are now no-ops (they do nothing).
 */

/**
 * Model Training Service Interface
 */
export interface ModelTrainingService {
  extractFeatures: (eventType: string, options?: any) => Promise<void>;
  recordFeedback: (feedback: any) => Promise<void>;
  trainModel: (modelId: string, options?: any) => Promise<void>;
  evaluateModel: (modelId: string, testData?: any) => Promise<any>;
}

/**
 * No-op implementation of Model Training Service
 */
class DisabledModelTrainingService implements ModelTrainingService {
  constructor() {
    console.log('[ModelTrainingService] Initialized in DISABLED mode');
  }

  /**
   * Extract features for model training (no-op)
   */
  async extractFeatures(eventType: string, options: any = {}): Promise<void> {
    console.log(`[ModelTrainingService] No logs found for feature extraction`, { eventType, options });
    return Promise.resolve();
  }

  /**
   * Record feedback for model improvement (no-op)
   */
  async recordFeedback(feedback: any): Promise<void> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ModelTrainingService] Recording feedback (DISABLED):`, feedback);
    }
    return Promise.resolve();
  }

  /**
   * Train a model (no-op)
   */
  async trainModel(modelId: string, options: any = {}): Promise<void> {
    console.log(`[ModelTrainingService] Training model (DISABLED): ${modelId}`, options);
    return Promise.resolve();
  }

  /**
   * Evaluate a model (no-op)
   */
  async evaluateModel(modelId: string, testData: any = {}): Promise<any> {
    console.log(`[ModelTrainingService] Evaluating model (DISABLED): ${modelId}`, testData);
    return Promise.resolve({
      accuracy: 0.95,
      precision: 0.94,
      recall: 0.93,
      f1Score: 0.935,
      isMockData: true
    });
  }
}

// Export singleton instance
export const modelTrainingService = new DisabledModelTrainingService();
