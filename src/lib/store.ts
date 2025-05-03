import { create } from 'zustand';
import { User } from '../lib/types/profile.types';
import { profileService } from './services/profile.service';

// Always use the real profile service (mock service is deprecated for new schema)
const profileSvc = profileService;

export interface FeatureFlags {
  [key: string]: {
    enabled: boolean;
    visible: boolean;
  };
}

const defaultFeatureFlags: FeatureFlags = {
  ideaHub: { enabled: true, visible: true },
  community: { enabled: true, visible: true },
  messages: { enabled: true, visible: true },
  directory: { enabled: true, visible: true },
  library: { enabled: false, visible: false },
  marketplace: { enabled: false, visible: false },
  legalHub: { enabled: false, visible: false },
  devHub: { enabled: false, visible: false },
  utilities: { enabled: false, visible: false },
  financeHub: { enabled: false, visible: false },
  adminPanel: { enabled: true, visible: true },
  aiCofounder: { enabled: true, visible: true },
  marketResearch: { enabled: true, visible: true },
  pitchDeck: { enabled: true, visible: true },
  documentStore: { enabled: true, visible: true },
  teamManagement: { enabled: true, visible: true },
  // Feature flags for mock services
  useMockAuth: { enabled: true, visible: true },
  useMockAI: { enabled: true, visible: true }, // Enable mock examples as fallback by default
  // Enhanced Idea Playground feature flags
  enhancedIdeaPlayground: { enabled: false, visible: true }, // Disabled to ensure PathwayRouter is used
  useRealAI: { enabled: true, visible: true }, // Real AI Only Mode is on by default
  multiTieredAI: { enabled: false, visible: true }
  // Hugging Face integration flags removed - now using OpenAI exclusively
};

interface AuthState {
  user: User | null;
  profile: User | null;
  featureFlags: FeatureFlags;
  setUser: (user: User | null) => void;
  setProfile: (profile: User | null) => void;
  setFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateSetupProgress: (progress: any) => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  featureFlags: defaultFeatureFlags,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setFeatureFlags: (flags) => set(state => {
    // Create a new featureFlags object with all the existing flags
    const updatedFlags: FeatureFlags = { ...state.featureFlags };
    
    // Update only the specified flags
    Object.entries(flags).forEach(([key, value]) => {
      if (updatedFlags[key]) {
        updatedFlags[key] = { ...updatedFlags[key], ...value };
      } else {
        updatedFlags[key] = value as { enabled: boolean; visible: boolean };
      }
    });
    
    return { featureFlags: updatedFlags };
  }),
  fetchProfile: async (userId: string) => {
    try {
      const profile = await profileSvc.getProfile(userId);
      if (profile) {
        set({ profile });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  },

  updateSetupProgress: async (progress: any) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) return;

      const updatedProfile: User = {
        ...profile,
        setup_progress: progress
      };

      set({ profile: updatedProfile });
      await profileSvc.updateProfile(user.id, { setup_progress: progress });
      console.log('Setup progress updated:', progress);
    } catch (error) {
      console.error('Error updating setup progress:', error);
    }
  },
  clearAuth: () => set({ user: null, profile: null })
}));

interface IdeaPlaygroundState {
  currentCanvasId: string | null;
  currentIdeaId: string | null;
  isGeneratingIdeas: boolean;
  setCurrentCanvasId: (id: string | null) => void;
  setCurrentIdeaId: (id: string | null) => void;
  setIsGeneratingIdeas: (isGenerating: boolean) => void;
}

export const useIdeaPlaygroundStore = create<IdeaPlaygroundState>((set) => ({
  currentCanvasId: null,
  currentIdeaId: null,
  isGeneratingIdeas: false,
  setCurrentCanvasId: (id) => set({ currentCanvasId: id }),
  setCurrentIdeaId: (id) => set({ currentIdeaId: id }),
  setIsGeneratingIdeas: (isGenerating) => set({ isGeneratingIdeas: isGenerating })
}));

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setDarkMode: (enabled) => set({ darkMode: enabled }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
}));
