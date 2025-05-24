/**
 * Feature Flags Defaults - Default configuration for all feature flags
 */

import { FeatureFlag, FeatureFlags, FeatureFlagDefinition, FeatureFlagGroup, FeatureFlagCategory } from './types';

/**
 * Default feature flags with their initial state
 */
export const defaultFeatureFlags: FeatureFlags = {
  // Navigation features
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
  
  // Component features
  aiCofounder: { enabled: true, visible: true },
  marketResearch: { enabled: true, visible: true },
  pitchDeck: { enabled: true, visible: true },
  documentStore: { enabled: true, visible: true },
  teamManagement: { enabled: true, visible: true },
  
  // Idea Playground features
  enhancedIdeaPlayground: { enabled: false, visible: true }, // Disabled to ensure PathwayRouter is used
  useRealAI: { enabled: true, visible: true }, // Real AI Only Mode is on by default
  useMockAI: { enabled: true, visible: true }, // Enable mock examples as fallback by default
  multiTieredAI: { enabled: false, visible: true },
  
  // System features
  analytics: { enabled: true, visible: true },
  logging: { enabled: true, visible: true },
  errorReporting: { enabled: true, visible: true },
  
  // Experimental features
  journeyRedesign: { enabled: false, visible: false },
  enhancedProfiles: { enabled: false, visible: false },
  virtualOffice: { enabled: false, visible: false }
};

/**
 * Feature flag definitions with full metadata
 */
export const featureFlagDefinitions: FeatureFlagDefinition[] = [
  // Navigation Features
  {
    key: 'ideaHub',
    name: 'Idea Hub',
    description: 'AI-powered idea exploration and validation',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.ideaHub
  },
  {
    key: 'community',
    name: 'Community',
    description: 'Community engagement and networking',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.community
  },
  {
    key: 'messages',
    name: 'Messages',
    description: 'Direct messaging system',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.messages
  },
  {
    key: 'directory',
    name: 'Directory',
    description: 'User and company directory',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.directory
  },
  {
    key: 'library',
    name: 'Resource Library',
    description: 'Knowledge base and resources',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.library
  },
  {
    key: 'marketplace',
    name: 'Marketplace',
    description: 'Service provider marketplace',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.marketplace
  },
  {
    key: 'legalHub',
    name: 'Legal Hub',
    description: 'Legal templates and guidance',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.legalHub
  },
  {
    key: 'devHub',
    name: 'Dev Hub',
    description: 'Development tools and resources',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.devHub
  },
  {
    key: 'utilities',
    name: 'Utilities',
    description: 'Helper tools and utilities',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.utilities
  },
  {
    key: 'financeHub',
    name: 'Finance Hub',
    description: 'Financial tools and tracking',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.financeHub
  },
  {
    key: 'adminPanel',
    name: 'Admin Panel',
    description: 'Administrative controls',
    category: FeatureFlagCategory.NAVIGATION,
    defaultValue: defaultFeatureFlags.adminPanel
  },
  
  // Component Features
  {
    key: 'aiCofounder',
    name: 'AI Co-founder',
    description: 'AI-powered guidance and feedback',
    category: FeatureFlagCategory.COMPONENTS,
    defaultValue: defaultFeatureFlags.aiCofounder
  },
  {
    key: 'marketResearch',
    name: 'Market Research',
    description: 'Market analysis tools',
    category: FeatureFlagCategory.COMPONENTS,
    defaultValue: defaultFeatureFlags.marketResearch
  },
  {
    key: 'pitchDeck',
    name: 'Pitch Deck',
    description: 'Presentation builder',
    category: FeatureFlagCategory.COMPONENTS,
    defaultValue: defaultFeatureFlags.pitchDeck
  },
  {
    key: 'documentStore',
    name: 'Document Store',
    description: 'Document management',
    category: FeatureFlagCategory.COMPONENTS,
    defaultValue: defaultFeatureFlags.documentStore
  },
  {
    key: 'teamManagement',
    name: 'Team Management',
    description: 'Team member controls',
    category: FeatureFlagCategory.COMPONENTS,
    defaultValue: defaultFeatureFlags.teamManagement
  },
  
  // Idea Playground Features
  {
    key: 'enhancedIdeaPlayground',
    name: 'Enhanced Idea Playground',
    description: 'Guided workflow for idea development',
    category: FeatureFlagCategory.IDEA_PLAYGROUND,
    defaultValue: defaultFeatureFlags.enhancedIdeaPlayground
  },
  {
    key: 'useRealAI',
    name: 'Real AI Only Mode',
    description: 'Generate only real AI suggestions without any mock examples',
    category: FeatureFlagCategory.IDEA_PLAYGROUND,
    defaultValue: defaultFeatureFlags.useRealAI
  },
  {
    key: 'useMockAI',
    name: 'Use Mock Examples',
    description: 'Allow mock examples as fallback when AI generation fails',
    category: FeatureFlagCategory.IDEA_PLAYGROUND,
    defaultValue: defaultFeatureFlags.useMockAI
  },
  {
    key: 'multiTieredAI',
    name: 'Multi-tiered AI',
    description: 'Use different AI models based on user tier',
    category: FeatureFlagCategory.IDEA_PLAYGROUND,
    defaultValue: defaultFeatureFlags.multiTieredAI
  },
  
  // System Features
  {
    key: 'analytics',
    name: 'Analytics',
    description: 'User and system analytics tracking',
    category: FeatureFlagCategory.SYSTEM,
    defaultValue: defaultFeatureFlags.analytics
  },
  {
    key: 'logging',
    name: 'Logging',
    description: 'System logging and diagnostics',
    category: FeatureFlagCategory.SYSTEM,
    defaultValue: defaultFeatureFlags.logging
  },
  {
    key: 'errorReporting',
    name: 'Error Reporting',
    description: 'Automatic error reporting and diagnostics',
    category: FeatureFlagCategory.SYSTEM,
    defaultValue: defaultFeatureFlags.errorReporting
  },
  
  // Experimental Features
  {
    key: 'journeyRedesign',
    name: 'Journey Redesign',
    description: 'New journey experience with enhanced UX',
    category: FeatureFlagCategory.EXPERIMENTAL,
    defaultValue: defaultFeatureFlags.journeyRedesign
  },
  {
    key: 'enhancedProfiles',
    name: 'Enhanced Profiles',
    description: 'Advanced user profile with additional insights',
    category: FeatureFlagCategory.EXPERIMENTAL,
    defaultValue: defaultFeatureFlags.enhancedProfiles
  },
  {
    key: 'virtualOffice',
    name: 'Virtual Office',
    description: 'Virtual workspace for remote collaboration',
    category: FeatureFlagCategory.EXPERIMENTAL,
    defaultValue: defaultFeatureFlags.virtualOffice
  }
];

/**
 * Feature flag groups for UI organization
 */
export const featureFlagGroups: FeatureFlagGroup[] = [
  {
    name: 'Navigation',
    description: 'Control visibility of navigation items',
    category: FeatureFlagCategory.NAVIGATION,
    features: featureFlagDefinitions.filter(def => def.category === FeatureFlagCategory.NAVIGATION)
  },
  {
    name: 'Components',
    description: 'Control visibility of specific components',
    category: FeatureFlagCategory.COMPONENTS,
    features: featureFlagDefinitions.filter(def => def.category === FeatureFlagCategory.COMPONENTS)
  },
  {
    name: 'Idea Playground',
    description: 'Control features of the Idea Playground',
    category: FeatureFlagCategory.IDEA_PLAYGROUND,
    features: featureFlagDefinitions.filter(def => def.category === FeatureFlagCategory.IDEA_PLAYGROUND)
  },
  {
    name: 'System',
    description: 'Core system functionality controls',
    category: FeatureFlagCategory.SYSTEM,
    features: featureFlagDefinitions.filter(def => def.category === FeatureFlagCategory.SYSTEM)
  },
  {
    name: 'Experimental',
    description: 'Cutting-edge features in development',
    category: FeatureFlagCategory.EXPERIMENTAL,
    features: featureFlagDefinitions.filter(def => def.category === FeatureFlagCategory.EXPERIMENTAL)
  }
];