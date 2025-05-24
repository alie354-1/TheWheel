/**
 * Profile Service Tests
 */
import { MultiPersonaProfileService } from './profile.service';
import { ProfilePersona, UserProfile } from './types';

// Mock supabase
jest.mock('../../supabase', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        if (table === 'user_core_profiles') {
          return {
            data: {
              id: 'test-user-id',
              email: 'test@example.com',
              full_name: 'Test User',
              display_name: 'Test',
              avatar_url: 'https://example.com/avatar.png',
              active_persona_id: 'test-persona-id',
              account_created_at: '2023-01-01T00:00:00Z',
              system_metadata: {
                profile_version: 1,
                last_updated: '2023-01-01T00:00:00Z',
                two_factor_enabled: false
              }
            },
            error: null
          };
        } else if (table === 'users') {
          return {
            data: {
              id: 'test-user-id',
              email: 'test@example.com',
              full_name: 'Test User',
              display_name: 'Test',
              avatar_url: 'https://example.com/avatar.png',
              professional_background: 'Test background',
              social_links: { linkedin: 'https://linkedin.com/test' },
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z'
            },
            error: null
          };
        } else if (table === 'user_personas') {
          return {
            data: {
              id: 'test-persona-id',
              user_id: 'test-user-id',
              name: 'Test Persona',
              description: 'Test Description',
              type: 'custom',
              is_active: true,
              is_public: false,
              avatar_url: 'https://example.com/avatar.png',
              professional: {
                title: 'Developer',
                industry: 'Technology',
                expertise_areas: ['JavaScript', 'React']
              },
              created_at: '2023-01-01T00:00:00Z',
              last_used_at: '2023-01-01T00:00:00Z'
            },
            error: null
          };
        } else if (table === 'profile_sections') {
          return {
            data: {
              id: 'test-section-id',
              user_id: 'test-user-id',
              persona_id: 'test-persona-id',
              section_type: 'bio',
              title: 'About Me',
              content: 'Test content',
              order: 1,
              is_visible: true,
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z'
            },
            error: null
          };
        }
        return { data: null, error: null };
      }),
      maybeSingle: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User',
              preferred_name: 'Test'
            },
            email_confirmed_at: '2023-01-01T00:00:00Z'
          }
        },
        error: null
      })
    }
  }
}));

describe('MultiPersonaProfileService', () => {
  let profileService: MultiPersonaProfileService;

  beforeEach(() => {
    profileService = new MultiPersonaProfileService();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should retrieve a user profile', async () => {
      const profile = await profileService.getProfile('test-user-id');
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('test-user-id');
      expect(profile?.displayName).toBe('Test');
    });
  });

  describe('getPersonas', () => {
    it('should retrieve user personas', async () => {
      const personas = await profileService.getPersonas('test-user-id');
      expect(personas.length).toBeGreaterThan(0);
      expect(personas[0].id).toBe('test-persona-id');
      expect(personas[0].name).toBe('Test Persona');
    });
  });

  describe('getActivePersona', () => {
    it('should retrieve the active persona', async () => {
      const persona = await profileService.getActivePersona('test-user-id');
      expect(persona).not.toBeNull();
      expect(persona?.id).toBe('test-persona-id');
      expect(persona?.isActive).toBe(true);
    });
  });

  describe('getProfileSections', () => {
    it('should retrieve profile sections', async () => {
      const sections = await profileService.getProfileSections('test-user-id');
      expect(sections.length).toBeGreaterThan(0);
      expect(sections[0].title).toBe('About Me');
    });
  });

  // Skipping actual implementation tests that would modify data
  describe('Profile Updates', () => {
    it('should update a profile', async () => {
      // Mock implementation to just check the function runs
      const testProfile: UserProfile = {
        id: 'test-user-id',
        userId: 'test-user-id',
        displayName: 'Updated Name',
        bio: 'Updated Bio',
        position: 'Developer',
        expertise: ['JavaScript', 'React'],
        interests: [],
        avatarUrl: 'https://example.com/avatar.png',
        socialLinks: { linkedin: 'https://linkedin.com/updated' },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      // This test just verifies the function doesn't throw
      await expect(profileService.updateProfile('test-user-id', testProfile))
        .resolves.not.toThrow();
    });
  });

  describe('Persona Management', () => {
    it('should create a persona', async () => {
      const testPersona: Omit<ProfilePersona, 'id'> = {
        name: 'New Persona',
        description: 'New Description',
        role: 'Designer',
        area: 'UX/UI',
        expertise: ['UI Design', 'Figma'],
        avatarUrl: 'https://example.com/avatar2.png',
        isActive: false
      };

      // This test just verifies the function doesn't throw
      await expect(profileService.createPersona('test-user-id', testPersona))
        .resolves.not.toThrow();
    });
  });
});