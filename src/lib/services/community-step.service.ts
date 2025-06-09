import { supabase } from '../supabase';
import { Step } from '../../components/company/journey/types/journey.types';

export interface CommunityStep {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const communityStepService = {
  async submitStep(step: Pick<CommunityStep, 'name' | 'description' | 'user_id'>): Promise<CommunityStep> {
    const { data, error } = await supabase
      .from('community_steps')
      .insert([
        {
          ...step,
          status: 'pending_review',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getCommunitySteps(status?: CommunityStep['status']): Promise<CommunityStep[]> {
    let query = supabase.from('community_steps').select('*');
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateStepStatus(id: string, status: 'approved' | 'rejected'): Promise<CommunityStep> {
    const { data, error } = await supabase
      .from('community_steps')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};
