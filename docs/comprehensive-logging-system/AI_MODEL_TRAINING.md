# AI Model Training with Logging Data

## Overview

This document provides detailed guidance and examples of how to use the data collected by the Comprehensive Logging System to train AI models. It expands on the conceptual framework defined in the [Data Modeling](./DATA_MODELING.md) document by providing concrete implementation examples, processing pipelines, and best practices.

## Table of Contents

1. [Data Processing Pipeline](#data-processing-pipeline)
2. [Feature Engineering Examples](#feature-engineering-examples)
3. [Model Training Workflows](#model-training-workflows)
4. [Evaluation and Validation](#evaluation-and-validation)
5. [Deployment and Feedback Loop](#deployment-and-feedback-loop)
6. [Case Studies](#case-studies)
7. [Best Practices](#best-practices)

## Data Processing Pipeline

### Raw Data Extraction

The first step is extracting relevant data from the logging system:

```typescript
// src/lib/training/data-extraction.ts
import { supabase } from '../supabase';
import { privacyService } from '../services/privacy.service';

export async function extractTrainingData(
  startDate: Date,
  endDate: Date,
  consentFilter = true
): Promise<any[]> {
  // Only include users who have consented to AI training
  let query = supabase
    .from('system_logs')
    .select(`
      id,
      user_id,
      persona_id,
      company_id,
      event_type,
      event_source,
      action,
      data,
      metadata,
      created_at
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    // Filter out sensitive data classifications
    .not('data_classification', 'eq', 'sensitive');
    
  if (consentFilter) {
    // Join with user_consent to check AI training consent
    query = query.in(
      'user_id', 
      supabase
        .from('user_consent')
        .select('user_id')
        .eq('ai_training', true)
    );
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to extract training data: ${error.message}`);
  }
  
  // Apply additional privacy transformations
  const transformedData = [];
  for (const log of data) {
    // Convert personal data to pseudonymized form
    if (log.data_classification === 'personal') {
      const anonymizedData = await privacyService.anonymizeData(
        log.data,
        'pseudonymize'
      );
      log.data = anonymizedData;
    }
    
    transformedData.push(log);
  }
  
  return transformedData;
}
```

### Data Transformation

Next, we transform raw logs into a format suitable for model training:

```typescript
// src/lib/training/data-transformation.ts
import { LogEvent } from '../types/logging.types';

// Transform logs into feature vectors
export function transformLogsToFeatures(logs: LogEvent[]): any[] {
  // Group logs by user
  const userLogs = groupBy(logs, 'user_id');
  
  return Object.entries(userLogs).map(([userId, userEvents]) => {
    // Sort by timestamp
    const sortedEvents = userEvents.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Extract user features
    return {
      user_id: userId,
      
      // Activity patterns
      event_count: userEvents.length,
      active_days: countUniqueDays(userEvents),
      last_active: sortedEvents[sortedEvents.length - 1].created_at,
      first_active: sortedEvents[0].created_at,
      
      // Engagement features
      feature_usage: extractFeatureUsage(userEvents),
      workflow_completions: extractWorkflowCompletions(userEvents),
      session_duration: calculateAverageSessionDuration(userEvents),
      
      // Behavioral features
      preferred_time: extractPreferredTimeOfDay(userEvents),
      response_patterns: extractResponsePatterns(userEvents),
      
      // Content features
      content_interactions: extractContentInteractions(userEvents),
      
      // Company context (if applicable)
      company_id: userEvents[0].company_id || null,
      company_features: extractCompanyFeatures(userEvents)
    };
  });
}

// Helper functions for feature extraction
function groupBy(array: any[], key: string): Record<string, any[]> {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
}

function countUniqueDays(events: LogEvent[]): number {
  const uniqueDays = new Set();
  for (const event of events) {
    const date = new Date(event.created_at).toISOString().split('T')[0];
    uniqueDays.add(date);
  }
  return uniqueDays.size;
}

function extractFeatureUsage(events: LogEvent[]): Record<string, number> {
  const featureUsage: Record<string, number> = {};
  
  for (const event of events) {
    if (event.event_type === 'user_action' && event.component) {
      featureUsage[event.component] = (featureUsage[event.component] || 0) + 1;
    }
  }
  
  return featureUsage;
}

function extractWorkflowCompletions(events: LogEvent[]): Record<string, number> {
  const workflows: Record<string, number> = {};
  
  // Identify workflow completion events
  for (const event of events) {
    if (event.action && event.action.endsWith('_complete')) {
      const workflow = event.action.replace('_complete', '');
      workflows[workflow] = (workflows[workflow] || 0) + 1;
    }
  }
  
  return workflows;
}

// Additional feature extraction helper functions...
```

### Sequence Processing

For many AI models, event sequences are more valuable than individual events:

```typescript
// src/lib/training/sequence-processing.ts
import { LogEvent } from '../types/logging.types';

// Create sequence data for sequential models (LSTM, Transformers)
export function createSequenceData(logs: LogEvent[], windowSize = 10): any[] {
  const sequences = [];
  
  // Group by user and session
  const userSessions = groupByUserAndSession(logs);
  
  for (const [userId, sessions] of Object.entries(userSessions)) {
    for (const sessionEvents of Object.values(sessions)) {
      // Sort by timestamp
      const sortedEvents = sessionEvents.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Create sliding windows of events
      for (let i = 0; i <= sortedEvents.length - windowSize; i++) {
        const windowEvents = sortedEvents.slice(i, i + windowSize);
        const sequenceFeatures = extractSequenceFeatures(windowEvents);
        
        // The next event is the target to predict
        const targetEvent = i + windowSize < sortedEvents.length 
          ? sortedEvents[i + windowSize] 
          : null;
          
        if (targetEvent) {
          sequences.push({
            features: sequenceFeatures,
            target: extractTargetFeatures(targetEvent)
          });
        }
      }
    }
  }
  
  return sequences;
}

function groupByUserAndSession(logs: LogEvent[]): Record<string, Record<string, LogEvent[]>> {
  const result: Record<string, Record<string, LogEvent[]>> = {};
  
  for (const log of logs) {
    if (!log.user_id || !log.session_id) continue;
    
    if (!result[log.user_id]) {
      result[log.user_id] = {};
    }
    
    if (!result[log.user_id][log.session_id]) {
      result[log.user_id][log.session_id] = [];
    }
    
    result[log.user_id][log.session_id].push(log);
  }
  
  return result;
}

function extractSequenceFeatures(events: LogEvent[]): any {
  return events.map(event => ({
    event_type: event.event_type,
    action: event.action,
    component: event.component,
    // Extract relevant features for sequence prediction
    timestamp_delta: event.metadata?.timestamp_delta || 0,
    // Encode event-specific features
    data_features: extractDataFeatures(event.data)
  }));
}

function extractTargetFeatures(event: LogEvent): any {
  // Target features to predict
  return {
    event_type: event.event_type,
    action: event.action,
    component: event.component
  };
}

function extractDataFeatures(data: any): any {
  // Extract numeric features from data
  // This is domain-specific and depends on the data structure
  const features: Record<string, number> = {};
  
  // Example feature extraction
  if (data) {
    if (typeof data.duration === 'number') features.duration = data.duration;
    if (typeof data.count === 'number') features.count = data.count;
    if (data.items && Array.isArray(data.items)) features.item_count = data.items.length;
    // Add more data feature extraction logic...
  }
  
  return features;
}
```

## Feature Engineering Examples

### User Behavior Modeling

Extract features that help predict user behavior:

```typescript
// src/lib/training/behavior-features.ts
import { LogEvent } from '../types/logging.types';

export function extractBehaviorFeatures(userLogs: LogEvent[]): any {
  // User engagement features
  const engagementScore = calculateEngagementScore(userLogs);
  const retentionFeatures = calculateRetentionFeatures(userLogs);
  const usagePatterns = extractUsagePatterns(userLogs);
  
  // Workflow patterns
  const workflowEfficiency = calculateWorkflowEfficiency(userLogs);
  const preferredFeatures = extractPreferredFeatures(userLogs);
  
  // Collaboration patterns (for team products)
  const collaborationFeatures = extractCollaborationFeatures(userLogs);
  
  return {
    engagement: engagementScore,
    retention: retentionFeatures,
    usage_patterns: usagePatterns,
    workflow_efficiency: workflowEfficiency,
    preferred_features: preferredFeatures,
    collaboration: collaborationFeatures
  };
}

function calculateEngagementScore(logs: LogEvent[]): number {
  // Define weights for different event types
  const weights = {
    page_view: 1,
    feature_interaction: 2,
    content_creation: 3,
    sharing: 4,
    feedback: 5
  };
  
  // Calculate weighted sum of events
  let totalScore = 0;
  let weightedCount = 0;
  
  for (const log of logs) {
    const category = categorizeEvent(log);
    if (weights[category]) {
      totalScore += weights[category];
      weightedCount += 1;
    }
  }
  
  return weightedCount > 0 ? totalScore / weightedCount : 0;
}

function categorizeEvent(log: LogEvent): string {
  // Categorize events based on type and action
  if (log.event_type === 'navigation') return 'page_view';
  if (log.event_type === 'user_action' && log.action?.includes('create')) return 'content_creation';
  if (log.event_type === 'user_action' && log.action?.includes('share')) return 'sharing';
  if (log.event_type === 'feedback') return 'feedback';
  return 'feature_interaction'; // Default
}

function calculateRetentionFeatures(logs: LogEvent[]): any {
  // Sort logs by date
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  if (sortedLogs.length === 0) return { days_active: 0, retention_days: [] };
  
  const firstDate = new Date(sortedLogs[0].created_at);
  const lastDate = new Date(sortedLogs[sortedLogs.length - 1].created_at);
  
  // Calculate days between first and last activity
  const totalDays = Math.ceil(
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Get all dates with activity
  const activeDays = new Set();
  for (const log of sortedLogs) {
    const date = new Date(log.created_at).toISOString().split('T')[0];
    activeDays.add(date);
  }
  
  // Calculate day-by-day retention
  const retentionDays = [];
  const startDay = new Date(firstDate);
  startDay.setHours(0, 0, 0, 0);
  
  for (let i = 0; i <= totalDays; i++) {
    const currentDate = new Date(startDay);
    currentDate.setDate(startDay.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    retentionDays.push({
      day: i,
      active: activeDays.has(dateString)
    });
  }
  
  return {
    days_active: activeDays.size,
    retention_days: retentionDays
  };
}

// Additional feature extraction functions...
```

### Content Interaction Features

Analyze how users interact with content:

```typescript
// src/lib/training/content-features.ts
import { LogEvent } from '../types/logging.types';

export function extractContentFeatures(logs: LogEvent[]): any {
  // Filter to content-related events
  const contentEvents = logs.filter(log => 
    log.event_type === 'content_interaction' || 
    (log.event_type === 'user_action' && log.action?.includes('content'))
  );
  
  // Extract features related to content consumption
  const contentConsumption = analyzeContentConsumption(contentEvents);
  
  // Extract features related to content creation
  const contentCreation = analyzeContentCreation(contentEvents);
  
  // Extract content preferences
  const contentPreferences = analyzeContentPreferences(contentEvents);
  
  return {
    consumption: contentConsumption,
    creation: contentCreation,
    preferences: contentPreferences
  };
}

function analyzeContentConsumption(events: LogEvent[]): any {
  // Identify view events
  const viewEvents = events.filter(e => 
    e.action?.includes('view') || 
    e.action?.includes('read') || 
    e.action?.includes('open')
  );
  
  // Calculate time spent on content
  const timeSpentByContentType: Record<string, number> = {};
  const viewCountByContentType: Record<string, number> = {};
  
  for (const event of viewEvents) {
    const contentType = event.data?.content_type || 'unknown';
    const duration = event.data?.duration || 0;
    
    timeSpentByContentType[contentType] = (timeSpentByContentType[contentType] || 0) + duration;
    viewCountByContentType[contentType] = (viewCountByContentType[contentType] || 0) + 1;
  }
  
  // Calculate completion rates
  const completionEvents = events.filter(e => e.action?.includes('complete'));
  const completionRates: Record<string, number> = {};
  
  for (const contentType of Object.keys(viewCountByContentType)) {
    const viewCount = viewCountByContentType[contentType] || 0;
    const completeCount = completionEvents.filter(
      e => e.data?.content_type === contentType
    ).length;
    
    completionRates[contentType] = viewCount > 0 ? completeCount / viewCount : 0;
  }
  
  return {
    view_counts: viewCountByContentType,
    time_spent: timeSpentByContentType,
    completion_rates: completionRates
  };
}

// Additional content analysis functions...
```

### AI Interaction Features

Analyze user interactions with AI features:

```typescript
// src/lib/training/ai-interaction-features.ts
import { LogEvent } from '../types/logging.types';

export function extractAIInteractionFeatures(logs: LogEvent[]): any {
  // Filter to AI interaction events
  const aiEvents = logs.filter(log => log.event_type === 'ai_interaction');
  
  if (aiEvents.length === 0) {
    return { has_ai_interactions: false };
  }
  
  // Calculate usage frequency
  const usageFrequency = calculateAIUsageFrequency(aiEvents);
  
  // Analyze prompt patterns
  const promptPatterns = analyzePromptPatterns(aiEvents);
  
  // Calculate satisfaction metrics
  const satisfactionMetrics = calculateSatisfactionMetrics(aiEvents);
  
  // Analyze feedback patterns
  const feedbackPatterns = analyzeFeedbackPatterns(aiEvents);
  
  return {
    has_ai_interactions: true,
    usage_frequency: usageFrequency,
    prompt_patterns: promptPatterns,
    satisfaction: satisfactionMetrics,
    feedback: feedbackPatterns
  };
}

function calculateAIUsageFrequency(events: LogEvent[]): any {
  // Group events by date
  const eventsByDate: Record<string, LogEvent[]> = {};
  
  for (const event of events) {
    const date = new Date(event.created_at).toISOString().split('T')[0];
    eventsByDate[date] = eventsByDate[date] || [];
    eventsByDate[date].push(event);
  }
  
  // Calculate usage metrics
  const dailyCount = Object.values(eventsByDate).map(events => events.length);
  
  return {
    total_interactions: events.length,
    unique_days: Object.keys(eventsByDate).length,
    avg_daily_interactions: dailyCount.length > 0 
      ? dailyCount.reduce((sum, count) => sum + count, 0) / dailyCount.length 
      : 0,
    max_daily_interactions: Math.max(...dailyCount, 0)
  };
}

function analyzePromptPatterns(events: LogEvent[]): any {
  // Extract prompt-related events
  const promptEvents = events.filter(e => 
    e.action?.includes('prompt') || 
    e.action?.includes('request') || 
    e.action?.includes('query')
  );
  
  // Calculate prompt length statistics
  const promptLengths = promptEvents
    .map(e => e.data?.prompt_length || e.data?.query_length || 0)
    .filter(length => length > 0);
  
  // Identify common prompt types
  const promptTypes: Record<string, number> = {};
  for (const event of promptEvents) {
    const promptType = event.data?.prompt_type || 'unknown';
    promptTypes[promptType] = (promptTypes[promptType] || 0) + 1;
  }
  
  return {
    count: promptEvents.length,
    avg_length: promptLengths.length > 0 
      ? promptLengths.reduce((sum, length) => sum + length, 0) / promptLengths.length 
      : 0,
    types: promptTypes
  };
}

// Additional AI interaction analysis functions...
```

## Model Training Workflows

### User Behavior Prediction Model

Train a model to predict user behavior:

```typescript
// src/lib/training/behavior-model.ts
import * as tf from '@tensorflow/tfjs';
import { extractTrainingData } from './data-extraction';
import { extractBehaviorFeatures } from './behavior-features';

export async function trainBehaviorModel(
  startDate: Date, 
  endDate: Date
): Promise<tf.LayersModel> {
  // Extract and transform the data
  const logs = await extractTrainingData(startDate, endDate);
  
  // Group logs by user
  const userLogs = groupBy(logs, 'user_id');
  
  // Prepare training data
  const trainingData = [];
  const trainingLabels = [];
  
  for (const [userId, userEvents] of Object.entries(userLogs)) {
    // Split data into training period and label period
    const splitDate = new Date(endDate);
    splitDate.setDate(splitDate.getDate() - 7); // Use last 7 days for labels
    
    const trainingPeriodEvents = userEvents.filter(
      e => new Date(e.created_at) < splitDate
    );
    
    const labelPeriodEvents = userEvents.filter(
      e => new Date(e.created_at) >= splitDate
    );
    
    if (trainingPeriodEvents.length === 0 || labelPeriodEvents.length === 0) {
      continue; // Skip users with insufficient data
    }
    
    // Extract features from training period
    const features = extractBehaviorFeatures(trainingPeriodEvents);
    
    // Calculate labels from label period
    const labels = calculateBehaviorLabels(labelPeriodEvents);
    
    // Add to training data
    trainingData.push(flattenFeatures(features));
    trainingLabels.push(labels);
  }
  
  // Convert to tensors
  const xs = tf.tensor2d(trainingData);
  const ys = tf.tensor2d(trainingLabels);
  
  // Create and train the model
  const model = createBehaviorModel(xs.shape[1], ys.shape[1]);
  
  await model.fit(xs, ys, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: tf.callbacks.earlyStopping({ patience: 5 })
  });
  
  return model;
}

function flattenFeatures(features: any): number[] {
  // Convert nested feature object to flat array
  const result = [];
  
  // Engagement score
  result.push(features.engagement);
  
  // Retention features
  result.push(features.retention.days_active);
  
  // Usage patterns
  const usagePatterns = features.usage_patterns;
  result.push(usagePatterns.morning_activity || 0);
  result.push(usagePatterns.afternoon_activity || 0);
  result.push(usagePatterns.evening_activity || 0);
  result.push(usagePatterns.weekend_activity || 0);
  
  // Workflow efficiency
  result.push(features.workflow_efficiency.completion_rate || 0);
  result.push(features.workflow_efficiency.avg_completion_time || 0);
  
  // Add more feature flattening...
  
  return result;
}

function calculateBehaviorLabels(events: LogEvent[]): number[] {
  // Calculate label values to predict
  return [
    events.length > 0 ? 1 : 0, // Active user
    calculateFeatureUsageIntensity(events), // Usage intensity
    calculateWorkflowCompletionRate(events), // Workflow completion
    events.some(e => e.action?.includes('upgrade')) ? 1 : 0, // Conversion
    calculateContentEngagement(events) // Content engagement
  ];
}

function createBehaviorModel(inputSize: number, outputSize: number): tf.LayersModel {
  const model = tf.sequential();
  
  // Add layers
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu',
    inputShape: [inputSize]
  }));
  
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: outputSize,
    activation: 'sigmoid'
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
}

// Helper functions...
```

### Content Recommendation Model

Train a collaborative filtering model for content recommendations:

```typescript
// src/lib/training/recommendation-model.ts
import * as tf from '@tensorflow/tfjs';
import { extractTrainingData } from './data-extraction';

export async function trainContentRecommendationModel(
  startDate: Date,
  endDate: Date
): Promise<tf.LayersModel> {
  // Extract content interaction data
  const logs = await extractTrainingData(startDate, endDate);
  
  // Filter to content view events
  const contentViews = logs.filter(log => 
    log.event_type === 'content_interaction' && 
    log.action === 'view_content'
  );
  
  // Create user-content interaction matrix
  const { userIndices, contentIndices, interactions } = processInteractions(contentViews);
  
  // Extract metadata features
  const contentFeatures = extractContentFeatures(logs, contentIndices);
  const userFeatures = extractUserFeatures(logs, userIndices);
  
  // Create and train the model
  const model = createRecommendationModel(
    userIndices.size,
    contentIndices.size,
    userFeatures.shape[1],
    contentFeatures.shape[1]
  );
  
  // Prepare training data
  const userIdTensor = tf.tensor1d(interactions.map(i => i.userIndex), 'int32');
  const contentIdTensor = tf.tensor1d(interactions.map(i => i.contentIndex), 'int32');
  const labelsTensor = tf.tensor1d(interactions.map(i => i.score));
  
  // Train the model
  await model.fit(
    [userIdTensor, contentIdTensor, userFeatures, contentFeatures],
    labelsTensor,
    {
      epochs: 20,
      batchSize: 64,
      validationSplit: 0.2,
      callbacks: tf.callbacks.earlyStopping({ patience: 3 })
    }
  );
  
  return model;
}

function processInteractions(contentViews: LogEvent[]): any {
  // Create maps for indexing
  const userIndices = new Map<string, number>();
  const contentIndices = new Map<string, number>();
  const interactions = [];
  
  // Create indices and interaction records
  for (const view of contentViews) {
    const userId = view.user_id;
    const contentId = view.data?.content_id;
    
    if (!userId || !contentId) continue;
    
    // Create indices if needed
    if (!userIndices.has(userId)) {
      userIndices.set(userId, userIndices.size);
    }
    
    if (!contentIndices.has(contentId)) {
      contentIndices.set(contentId, contentIndices.size);
    }
    
    // Add interaction with derived engagement score
    const engagementScore = calculateEngagementScore(view);
    
    interactions.push({
      userIndex: userIndices.get(userId),
      contentIndex: contentIndices.get(contentId),
      score: engagementScore
    });
  }
  
  return { userIndices, contentIndices, interactions };
}

function calculateEngagementScore(view: LogEvent): number {
  // Calculate engagement score from 0 to 1
  let score = 0.5; // Default value
  
  // Adjust based on view duration
  if (view.data?.duration) {
    const duration = view.data.duration;
    const contentLength = view.data?.content_length || 1000; // Default if unknown
    
    // Calculate read percentage with a cap
    const readPercentage = Math.min(duration / contentLength, 1);
    score += readPercentage * 0.3; // Weight for read percentage
  }
  
  // Adjust based on interactions
  if (view.data?.interactions) {
    const interactionCount = view.data.interactions.length;
    score += Math.min(interactionCount / 5, 0.2); // Weight for interactions
  }
  
  // Cap at 0-1 range
  return Math.max(0, Math.min(1, score));
}

function extractContentFeatures(logs: LogEvent[], contentIndices: Map<string, number>): tf.Tensor2d {
  // Create feature array
  const features = Array(contentIndices.size).fill(null).map(() => {
    return Array(10).fill(0); // 10 features per content item
  });
  
  // Collect content metadata
  const contentMetadata = new Map<string, any>();
  
  for (const log of logs) {
    if (log.event_type === 'content_metadata' && log.data?.content_id) {
      contentMetadata.set(log.data.content_id, log.data);
    }
  }
  
  // Fill in features
  for (const [contentId, index] of contentIndices.entries()) {
    const metadata = contentMetadata.get(contentId) || {};
    
    // Set feature values based on metadata
    features[index][0] = metadata.type === 'article' ? 1 : 0;
    features[index][1] = metadata.type === 'video' ? 1 : 0;
    features[index][2] = metadata.type === 'interactive' ? 1 : 0;
    features[index][3] = metadata.difficulty || 0.5;
    features[index][4] = metadata.word_count ? Math.min(metadata.word_count / 2000, 1) : 0.5;
    // Add more features...
  }
  
  return tf.tensor2d(features);
}

// More helper functions...

function createRecommendationModel(
  numUsers: number,
  numContent: number,
  userFeatureDim: number,
  contentFeatureDim: number
): tf.LayersModel {
  // User input and embedding
  const userInput = tf.input({ shape: [1], name: 'user_id', dtype: 'int32' });
  const userEmbedding = tf.layers.embedding({
    inputDim: numUsers,
    outputDim: 16,
    inputLength: 1
  }).apply(userInput);
  const userFeatureInput = tf.input({ shape: [userFeatureDim], name: 'user_features' });
  
  // Content input and embedding
  const contentInput = tf.input({ shape: [1], name: 'content_id', dtype: 'int32' });
  const contentEmbedding = tf.layers.embedding({
    inputDim: numContent,
    outputDim: 16,
    inputLength: 1
  }).apply(contentInput);
  const contentFeatureInput = tf.input({ shape: [contentFeatureDim], name: 'content_features' });
  
  // Reshape embeddings
  const reshapeLayer = tf.layers.flatten();
  const userVector = reshapeLayer.apply(userEmbedding);
  const contentVector = reshapeLayer.apply(contentEmbedding);
  
  // Combine embeddings and features
  const userCombined = tf.layers.concatenate().apply([
    userVector, user
