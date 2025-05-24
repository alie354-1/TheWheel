import { supabase } from '../supabase';
import { UserLearningProfile } from '../types/profile.types';
import { loggingService } from './logging.service';
import { withCache, invalidateCache } from '../utils/cache'; // Import withCache and invalidateCache

/**
 * Fetches the learning profile for a given user.
 *
 * @param userId - The ID of the user whose profile to fetch.
 * @returns A promise resolving to the user's learning profile or null if not found/error.
 */
// Define the core fetching logic separately
const _fetchUserLearningProfile = async (userId: string): Promise<UserLearningProfile | null> => {
  if (!userId) {
    loggingService.logError(new Error('_fetchUserLearningProfile called without userId'));
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to return null if not found, instead of an error

    if (error) {
      loggingService.logError(new Error(error.message), { context: 'getUserLearningProfile', userId, dbError: error });
      console.error('Error fetching user learning profile:', error.message);
      return null;
    }

    return data;
  } catch (exception: any) {
    loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'getUserLearningProfile', userId, exception });
    console.error('Exception fetching user learning profile:', exception);
    return null;
  }
};

// Wrap the fetching logic with the cache utility
export const getUserLearningProfile = withCache(
  'userLearningProfile', // Cache key prefix
  _fetchUserLearningProfile,
  15 * 60 * 1000 // Cache for 15 minutes
);

/**
 * Updates or creates a user's learning profile.
 *
 * @param userId - The ID of the user whose profile to update/create.
 * @param profileData - The partial or full learning profile data to update.
 * @returns A promise resolving to the updated learning profile or null if error.
 */
// Define the core upsert logic separately
const _upsertUserLearningProfile = async (
  userId: string,
  profileData: Partial<Omit<UserLearningProfile, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserLearningProfile | null> => {
   if (!userId) {
    loggingService.logError(new Error('_upsertUserLearningProfile called without userId'));
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_learning_profiles')
      .upsert({ user_id: userId, ...profileData }, { onConflict: 'user_id' })
      .select()
      .single(); // Return the updated/inserted row

    if (error) {
      loggingService.logError(new Error(error.message), { context: 'upsertUserLearningProfile', userId, dbError: error });
      console.error('Error upserting user learning profile:', error.message);
      return null;
    }

    return data;
  } catch (exception: any) {
    loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'upsertUserLearningProfile', userId, exception });
    console.error('Exception upserting user learning profile:', exception);
    return null;
  }
};

// When upserting, we need to invalidate the cache for the specific user
export const upsertUserLearningProfile = async (
  userId: string,
  profileData: Partial<Omit<UserLearningProfile, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserLearningProfile | null> => {
  const result = await _upsertUserLearningProfile(userId, profileData);
  if (result) {
    // Invalidate the cache for this user's profile
    const cacheKey = `userLearningProfile:${JSON.stringify([userId])}`;
    invalidateCache(cacheKey); // Use imported invalidateCache
  }
  return result;
};

// Example Usage (to be implemented elsewhere):
/*
async function example(userId: string) {
  let profile = await getUserLearningProfile(userId);
  if (!profile) {
    console.log('No profile found, creating one.');
    profile = await upsertUserLearningProfile(userId, { learning_style_preference: 'visual' });
  } else {
    console.log('Existing profile:', profile);
    profile = await upsertUserLearningProfile(userId, { pace_preference: 4 });
  }
  console.log('Updated profile:', profile);
}
*/

// --- New Personalization Functions (Sprint 5) ---

/**
 * Analyzes user interaction data to update their learning profile characteristics.
 * This would likely run periodically or be triggered by specific events.
 *
 * @param userId - The ID of the user to analyze.
 * @returns A promise resolving to the potentially updated learning profile or null.
 */
export const analyzeUserBehavior = async (userId: string): Promise<UserLearningProfile | null> => {
  if (!userId) {
    loggingService.logError(new Error('analyzeUserBehavior called without userId'));
    return null;
  }
  // Removed console.warn as basic implementation is added
  // console.warn(`analyzeUserBehavior: Not implemented yet for user ${userId}.`);
  // TODO: Refine logic with more sophisticated analysis and potentially ML models.

  try {
    // --- Basic Implementation ---
    // 1. Fetch recent user interaction data (e.g., last 20 events)
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('event_name, payload, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20); // Limit the number of events to analyze

    if (eventsError) {
      loggingService.logError(new Error(eventsError.message), { context: 'analyzeUserBehavior', userId, dbError: eventsError });
      return null; // Return null on error
    }
    
    // Use optional chaining and nullish coalescing for safety
    const safeEvents = events ?? [];
    if (safeEvents.length === 0) {
      // Use type assertion for loggingService methods if necessary
      if (typeof (loggingService as any).logInfo === 'function') {
        (loggingService as any).logInfo('No recent events found for behavior analysis', { userId });
      }
      return await getUserLearningProfile(userId); // Return current profile if no events
    }

    // 2. Apply simple rules based on recent events
    let videoViews = 0;
    let articleViews = 0;
    let tutorialInteractions = 0;
    let totalTimeSpent = 0; // Assuming time_spent events exist

    safeEvents.forEach(event => {
      if (event.event_name === 'content_viewed') {
        if (event.payload?.contentType === 'video') videoViews++;
        if (event.payload?.contentType === 'article') articleViews++;
        if (event.payload?.contentType === 'tutorial') tutorialInteractions++;
      }
      if (event.event_name === 'time_spent' && typeof event.payload?.duration === 'number') {
        totalTimeSpent += event.payload.duration;
      }
      // Add more event analysis as needed
    });

    let inferredLearningStyle = 'mixed';
    if (videoViews > articleViews && videoViews > tutorialInteractions) inferredLearningStyle = 'visual';
    else if (articleViews > videoViews && articleViews > tutorialInteractions) inferredLearningStyle = 'reading';
    else if (tutorialInteractions > videoViews && tutorialInteractions > articleViews) inferredLearningStyle = 'kinesthetic';

    // Simple pace inference (adjust thresholds as needed)
    const avgTimePerEvent = safeEvents.length > 0 ? totalTimeSpent / safeEvents.length : 0;
    const inferredPace = avgTimePerEvent < 60 ? 4 : (avgTimePerEvent > 300 ? 2 : 3); // Faster if avg time < 1min, slower if > 5min

    const updates: Partial<Omit<UserLearningProfile, 'user_id' | 'created_at' | 'updated_at'>> = {};
    // Only update if the inferred style is different from current or not set
    const currentProfile = await getUserLearningProfile(userId);
    if (inferredLearningStyle !== currentProfile?.learning_style_preference) {
      updates.learning_style_preference = inferredLearningStyle;
    }
    if (inferredPace !== currentProfile?.pace_preference) {
      updates.pace_preference = inferredPace;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
       if (typeof (loggingService as any).logInfo === 'function') {
        (loggingService as any).logInfo('Updating profile based on behavior analysis', { userId, updates });
      }
      const updatedProfile = await upsertUserLearningProfile(userId, updates);
      // Invalidate cache after successful update
      if (updatedProfile) {
         const cacheKey = `userLearningProfile:${JSON.stringify([userId])}`;
         invalidateCache(cacheKey);
      }
      return updatedProfile;
    } else {
       if (typeof (loggingService as any).logInfo === 'function') {
        (loggingService as any).logInfo('No profile updates needed based on behavior analysis', { userId });
      }
      return currentProfile; // Return current profile if no updates needed
    }
    // --- End Basic Implementation ---

  } catch (exception: any) {
     loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'analyzeUserBehavior', userId, exception });
     console.error('Exception analyzing user behavior:', exception);
     return null; // Return null on exception
  }
};

/**
 * Generates a personalized learning path (sequence of steps) for a user.
 *
 * @param userId - The ID of the user.
 * @param journeyId - The ID of the base journey to personalize.
 * @param goals - Optional user-defined goals or target outcomes.
 * @returns A promise resolving to an ordered list of step IDs or null.
 */
export const generatePersonalizedPath = async (
  userId: string,
  journeyId: string, // Assuming journeyId might be used to filter base steps
  goals?: string[]
): Promise<string[] | null> => {
   if (!userId || !journeyId) { // Keep journeyId check for potential future use
    loggingService.logError(new Error('generatePersonalizedPath called without userId or journeyId'));
    return null;
  }
  // Removed console.warn as basic implementation is added
  // console.warn(`generatePersonalizedPath: Not implemented yet for user ${userId}, journey ${journeyId}.`);
  // TODO: Refine personalization rules (e.g., based on learning style, difficulty).
  // TODO: Fetch steps based on journeyId if applicable.

  try {
    // --- Basic Implementation ---
    // 1. Fetch user's learning profile
    const profile = await getUserLearningProfile(userId);
    // Use nullish coalescing for defaults
    const learningStyle = profile?.learning_style_preference ?? 'mixed';
    const pacePreference = profile?.pace_preference ?? 3; // Default to medium pace

    // 2. Fetch base journey steps 
    // Assuming 'journey_steps' contains all steps, potentially filter by a journeyId if needed
    const { data: baseStepsData, error: stepsError } = await supabase
      .from('journey_steps') // Use the actual table name
      .select('id, name, order_index, difficulty_level, estimated_time_min, estimated_time_max') // Select relevant fields
      // Add .eq('journey_id', journeyId) here if steps are tied to specific journeys
      .order('order_index', { ascending: true });

    if (stepsError) throw stepsError;
    const baseSteps = baseStepsData ?? [];

    // 3. Fetch user's progress on these steps
    const stepIds = baseSteps.map(s => s.id);
    if (stepIds.length === 0) return []; // No steps in the journey

    const { data: progressData, error: progressError } = await supabase
      .from('company_journey_steps') // Assuming progress is stored per company/user
      .select('step_id, status')
      .eq('user_id', userId) // Filter by user
      .in('step_id', stepIds);

    if (progressError) throw progressError;
    const completedStepIds = new Set((progressData ?? []).filter(p => p.status === 'completed').map(p => p.step_id));

    // 4. Apply personalization rules
    let availableSteps = baseSteps.filter(step => !completedStepIds.has(step.id));

    // Rule: Adjust order slightly based on pace preference and estimated time
    availableSteps.sort((a, b) => {
      const timeA = (a.estimated_time_min + a.estimated_time_max) / 2;
      const timeB = (b.estimated_time_min + b.estimated_time_max) / 2;
      // Handle potential null/NaN times gracefully
      const validTimeA = !isNaN(timeA) ? timeA : Infinity;
      const validTimeB = !isNaN(timeB) ? timeB : Infinity;

      if (pacePreference > 3) return validTimeA - validTimeB; // Faster pace: shorter steps first
      if (pacePreference < 3) return validTimeB - validTimeA; // Slower pace: longer steps first
      return a.order_index - b.order_index; // Default: original order
    });
    
    // Rule: Prioritize steps matching goals (move them towards the beginning)
    if (goals && goals.length > 0) {
       // Create a copy to sort based on goals without affecting the pace sort permanently
       let goalSortedSteps = [...availableSteps]; 
       goalSortedSteps.sort((a, b) => {
          const aMatchesGoal = goals.some(goal => a.name.toLowerCase().includes(goal.toLowerCase()));
          const bMatchesGoal = goals.some(goal => b.name.toLowerCase().includes(goal.toLowerCase()));
          if (aMatchesGoal && !bMatchesGoal) return -1; // a comes first
          if (!aMatchesGoal && bMatchesGoal) return 1;  // b comes first
          return 0; // Keep relative order for non-goal/goal matches
       });
       availableSteps = goalSortedSteps; // Use the goal-prioritized order
    }

    const personalizedStepIds = availableSteps.map(step => step.id);
    
    if (typeof (loggingService as any).logInfo === 'function') {
      (loggingService as any).logInfo('Generated personalized path', { userId, journeyId, personalizedStepIds });
    }
    // --- End Basic Implementation ---

    // 5. Return the ordered list of step IDs
    return personalizedStepIds;

  } catch (exception: any) {
    loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'generatePersonalizedPath', userId, journeyId, goals, exception });
    console.error('Exception generating personalized path:', exception);
    return null; // Return null on exception
  }
};

/**
 * Identifies skill gaps based on user profile and progress, and recommends relevant steps.
 *
 * @param userId - The ID of the user.
 * @param companyId - The company context for relevant skills.
 * @returns A promise resolving to a list of recommended step IDs or null.
 */
export const getSkillGapRecommendations = async (
  userId: string,
  companyId: string // Keep companyId for potential future use (e.g., company-specific skill requirements)
): Promise<{ stepId: string; reason: string }[] | null> => {
  if (!userId || !companyId) {
    loggingService.logError(new Error('getSkillGapRecommendations called without userId or companyId'));
    return null;
  }
  // Removed console.warn as basic implementation is added
  // console.warn(`getSkillGapRecommendations: Not implemented yet for user ${userId}, company ${companyId}.`);
  // TODO: Refine skill mapping and required skills fetching.

  try {
    // --- Basic Implementation ---
    // 1. Fetch user's learning profile, potentially including assessed skills.
    const profile = await getUserLearningProfile(userId);
    // Assuming skill_gaps is stored like { "skill_name": level }
    const assessedSkills = profile?.skill_gaps as Record<string, number> || {}; 

    // 2. Fetch user's role/goals (Could come from profile or another source)
    // const userRole = profile?.role || 'default'; // Example

    // 3. Fetch required skills (Simulated - this should ideally come from DB based on role/company)
    const requiredSkills: Record<string, number> = {
      'react': 4,
      'typescript': 4,
      'state-management': 3,
      'testing': 3,
      'cicd': 2,
    };
    if (typeof (loggingService as any).logInfo === 'function') {
      (loggingService as any).logInfo('Required skills', { requiredSkills });
    }

    // 4. Identify discrepancies (skill gaps)
    const skillGaps: string[] = Object.entries(requiredSkills)
      .filter(([skillId, requiredLevel]) => (assessedSkills[skillId] || 0) < requiredLevel)
      .map(([skillId]) => skillId);
      
    if (typeof (loggingService as any).logInfo === 'function') {
      (loggingService as any).logInfo('Identified skill gaps', { userId, skillGaps });
    }
    if (skillGaps.length === 0) return []; // No gaps found

    // 5. Map skills to relevant journey steps (Simulated - needs a proper mapping in DB or config)
    const skillToStepMap: Record<string, { stepId: string; reason: string }> = {
      'react': { stepId: 'react-advanced', reason: 'Gap identified in React proficiency.' },
      'typescript': { stepId: 'typescript-deep-dive', reason: 'Gap identified in TypeScript proficiency.' },
      'state-management': { stepId: 'state-management-patterns', reason: 'Improve state management understanding.' },
      'testing': { stepId: 'advanced-testing', reason: 'Skill assessment indicates need for advanced testing knowledge.' },
      'cicd': { stepId: 'cicd-setup', reason: 'Introduction to CI/CD required.' },
    };

    // 6. Fetch user's progress to avoid recommending completed steps
    const { data: progressData, error: progressError } = await supabase
      .from('company_journey_steps') // Assuming progress is stored per company/user
      .select('step_id, status')
      .eq('user_id', userId) // Filter by user
      .eq('status', 'completed');
      
    if (progressError) throw progressError;
    const completedStepIds = new Set((progressData ?? []).map(p => p.step_id));

    // 7. Return a list of recommended step IDs with reasons, filtering out completed ones
    const recommendations = skillGaps
      .map(skillId => skillToStepMap[skillId])
      .filter(recommendation => recommendation && !completedStepIds.has(recommendation.stepId));
      
    if (typeof (loggingService as any).logInfo === 'function') {
      (loggingService as any).logInfo('Generated skill gap recommendations', { userId, recommendations });
    }
    // --- End Basic Implementation ---

    return recommendations;

  } catch (exception: any) {
    loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'getSkillGapRecommendations', userId, companyId, exception });
    console.error('Exception getting skill gap recommendations:', exception);
    return null; // Return null on exception
  }
};
