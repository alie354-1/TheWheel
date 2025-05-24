import { supabase } from '@/lib/supabase';
import type { StepRelationship } from '@/lib/types/journey-steps.types';

// Assuming EventData is defined elsewhere or needs to be defined here
interface EventData {
  [key: string]: any;
}

export class RelationshipsRecommendationService {
  /**
   * Get step relationships showing which steps are connected
   */
  public static async getStepRelationships(
    stepId: string,
    depth: number = 1
  ): Promise<StepRelationship[]> {
    try {
      // Track relationship request for analytics
      await this.trackRelationshipEvent(stepId, 'request', { depth });

      // Get the step's prerequisite relationships
      const { data: prerequisites, error: prereqError } = await supabase
        .from('journey_steps')
        .select('prerequisite_steps')
        .eq('id', stepId)
        .single();

      if (prereqError && prereqError.code !== 'PGRST116') throw prereqError; // Ignore 'No rows found'

      // Find steps that have this step as a prerequisite
      const { data: dependentsData, error: depError } = await supabase
        .from('journey_steps')
        .select('id, name, prerequisite_steps')
        .contains('prerequisite_steps', [stepId]);

      if (depError) throw depError;
      const dependents = dependentsData || [];

      // Find related steps (those that are frequently completed together)
      // Ensure the RPC function exists and handles potential errors
      let related: any[] = [];
      try {
        const { data: relatedData, error: relatedError } = await supabase
          .rpc('get_related_steps', { p_step_id: stepId, p_threshold: 0.3 });
        if (relatedError) throw relatedError;
        related = relatedData || [];
      } catch (rpcError) {
         console.error("Error calling RPC 'get_related_steps':", rpcError);
         // Decide how to handle RPC errors, e.g., continue without related steps
      }


      const relationships: StepRelationship[] = [];

      // Add prerequisites (Check if prerequisites and prerequisite_steps exist)
      if (prerequisites && prerequisites.prerequisite_steps && prerequisites.prerequisite_steps.length > 0) {
        const { data: prereqStepsData, error: stepsError } = await supabase
          .from('journey_steps')
          .select('id, name')
          .in('id', prerequisites.prerequisite_steps);

        if (stepsError) throw stepsError;
        const prereqSteps = prereqStepsData || [];

        prereqSteps?.forEach(step => {
          relationships.push({
            source_id: step.id,
            source_name: step.name,
            target_id: stepId,
            // target_name: // Need target name if required by StepRelationship
            relationship_type: 'prerequisite'
          });
        });
      }

      // Add dependents
      dependents?.forEach(step => {
        relationships.push({
          source_id: stepId,
          // source_name: // Need source name if required by StepRelationship
          target_id: step.id,
          target_name: step.name,
          relationship_type: 'dependent'
        });
      });

      // Add related steps
      related?.forEach((rel: any) => {
        if (rel.step_id !== stepId) {
          relationships.push({
            source_id: stepId,
             // source_name: // Need source name if required by StepRelationship
            target_id: rel.step_id,
            target_name: rel.step_name,
            relationship_type: 'related'
          });
        }
      });

      // If depth > 1, recursively get relationships for related steps
      // Note: Recursive calls within static methods can be tricky. Ensure this works as expected.
      // Consider potential infinite loops if relationships are circular. Add visited set if needed.
      if (depth > 1) {
        const relatedStepIds = relationships.map(rel =>
          rel.source_id === stepId ? rel.target_id : rel.source_id
        ).filter((id, index, self) => id !== stepId && self.indexOf(id) === index); // Unique related IDs

        const visited = new Set<string>([stepId]); // Prevent infinite loops

        for (const relatedId of relatedStepIds) {
           if (!visited.has(relatedId)) {
              visited.add(relatedId);
              try {
                 const nestedRelationships = await this.getStepRelationships(relatedId, depth - 1);
                 // Filter out duplicates and the original step
                 const filteredNested = nestedRelationships.filter(nested => {
                   const existingIds = new Set(relationships.map(r => `${r.source_id}-${r.target_id}`));
                   const nestedPairFwd = `${nested.source_id}-${nested.target_id}`;
                   const nestedPairRev = `${nested.target_id}-${nested.source_id}`; // Check reverse too?
                   return !existingIds.has(nestedPairFwd) && !existingIds.has(nestedPairRev) &&
                          nested.source_id !== stepId &&
                          nested.target_id !== stepId;
                 });
                 relationships.push(...filteredNested);
              } catch (nestedError) {
                 console.error(`Error getting nested relationships for step ${relatedId}:`, nestedError);
                 // Continue with other relationships
              }
           }
        }
      }


      // Track successful relationship mapping
      await this.trackRelationshipEvent(
        stepId,
        'success',
        { count: relationships.length }
      );

      return relationships;
    } catch (error) {
      console.error('Error getting step relationships:', error);
      // Track error for analytics
      await this.trackRelationshipEvent(stepId, 'error', { error: String(error) });
      return [];
    }
  }

  /**
   * Track relationship events for analytics.
   * NOTE: This might need to be moved to a dedicated analytics service later.
   * @private
   */
  private static async trackRelationshipEvent(
    stepId: string,
    eventType: 'request' | 'success' | 'error',
    data: EventData
  ): Promise<void> {
    console.warn(`trackRelationshipEvent: Placeholder for ${eventType}. Step: ${stepId}, Data:`, data);
    // TODO: Implement actual event tracking logic, potentially calling an analytics service.
     try {
       // Example: await AnalyticsService.track('relationship_event', { stepId, eventType, ...data });
       await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async operation
    } catch (error) {
       console.error('Failed to track relationship event:', error);
    }
  }
}
