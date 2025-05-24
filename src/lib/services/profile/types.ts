/**
 * Profile Service Types
 * 
 * This file contains types and interfaces for the profile service.
 * It combines functionality from both profile.service.ts and multi-persona-profile.service.ts
 */

/**
 * User profile structure
 */
export interface UserProfile {
  id?: string;
  userId: string;
  displayName?: string;
  bio?: string;
  position?: string;
  expertise?: string[];
  interests?: string[];
  avatarUrl?: string;
  socialLinks?: SocialLinks;
  createdAt?: string;
  updatedAt?: string;
  preferences?: UserPreferences;
  personas?: ProfilePersona[];
  activePersonaId?: string;
}

/**
 * Social media links
 */
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  [key: string]: string | undefined;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyDigest?: boolean;
  language?: string;
  timezone?: string;
  [key: string]: any;
}

/**
 * Profile persona (for multi-persona profiles)
 */
export interface ProfilePersona {
  id: string;
  name: string;
  description?: string;
  role?: string;
  area?: string;
  expertise?: string[];
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Profile section (for customizable profiles)
 */
export interface ProfileSection {
  id: string;
  userId: string;
  personaId?: string;
  sectionType: string;
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Profile service interface
 * 
 * This interface combines functionality from both profile services
 */
export interface ProfileService {
  /**
   * Get a user's profile
   */
  getProfile(userId: string): Promise<UserProfile | null>;
  
  /**
   * Create a new profile
   */
  createProfile(profile: UserProfile): Promise<UserProfile>;
  
  /**
   * Update an existing profile
   */
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  
  /**
   * Get profile sections
   */
  getProfileSections(userId: string, personaId?: string): Promise<ProfileSection[]>;
  
  /**
   * Add a profile section
   */
  addProfileSection(section: Omit<ProfileSection, 'id'>): Promise<ProfileSection>;
  
  /**
   * Update a profile section
   */
  updateProfileSection(sectionId: string, updates: Partial<ProfileSection>): Promise<ProfileSection>;
  
  /**
   * Remove a profile section
   */
  removeProfileSection(sectionId: string): Promise<void>;
  
  /**
   * Get user personas
   */
  getPersonas(userId: string): Promise<ProfilePersona[]>;
  
  /**
   * Create a new persona
   */
  createPersona(userId: string, persona: Omit<ProfilePersona, 'id'>): Promise<ProfilePersona>;
  
  /**
   * Update a persona
   */
  updatePersona(personaId: string, updates: Partial<ProfilePersona>): Promise<ProfilePersona>;
  
  /**
   * Delete a persona
   */
  deletePersona(personaId: string): Promise<void>;
  
  /**
   * Set active persona
   */
  setActivePersona(userId: string, personaId: string): Promise<void>;
  
  /**
   * Get active persona
   */
  getActivePersona(userId: string): Promise<ProfilePersona | null>;
}