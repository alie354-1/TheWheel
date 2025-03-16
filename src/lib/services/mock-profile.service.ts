import { ExtendedUserProfile } from '../types/extended-profile.types';

export class MockProfileService {
  private mockProfile: ExtendedUserProfile = {
    id: 'mock-user-id',
    email: 'user@example.com',
    full_name: 'Test User',
    avatar_url: null,
    role: 'user',
    is_public: true,
    allows_messages: true,
    company_id: 'mock-company-id',
    company_name: 'Mock Company',
    company_role: 'Founder',
    company_description: 'A mock company for testing purposes',
    company_industry: 'Technology',
    company_size: '1-10',
    company_stage: 'Seed',
    company_products: ['Product A', 'Product B'],
    company_services: ['Service X', 'Service Y'],
    company_target_market: 'Small businesses',
    company_competitors: ['Competitor 1', 'Competitor 2']
  };

  constructor() {}

  async getProfile(userId: string): Promise<ExtendedUserProfile | null> {
    if (userId === 'mock-user-id') {
      return this.mockProfile;
    }
    return null;
  }

  async updateProfile(userId: string, updates: Partial<ExtendedUserProfile>): Promise<ExtendedUserProfile | null> {
    if (userId === 'mock-user-id') {
      this.mockProfile = { ...this.mockProfile, ...updates };
      return this.mockProfile;
    }
    return null;
  }
}

export const mockProfileService = new MockProfileService();
