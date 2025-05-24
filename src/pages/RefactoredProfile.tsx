/**
 * Refactored Profile Page
 * 
 * Uses the new service registry pattern, hooks, and UI components.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Save, Camera, Cog } from 'lucide-react';

// Import UI components
import { Button, Card, FormField, Input } from '../components/ui';
import { LoadingSpinner, ErrorDisplay, Alert } from '../components/feedback';
import { Container, Stack } from '../components/layout';

// Import hooks
import { useAuth } from '../lib/hooks/useAuth';
import { useAnalytics } from '../lib/hooks/useAnalytics';

// Import service registry
import { serviceRegistry } from '../lib/services/registry';

// Import profile components
import LearningProfileDisplay from '../components/profile/LearningProfileDisplay';
import LearningProfileEditor from '../components/profile/LearningProfileEditor';
import CredentialManager from '../components/profile/CredentialManager';

// Import types
import { UserRoleType, CompanyStageType } from '../lib/types/enhanced-profile.types';

export interface ProfileForm {
  // Basic profile
  full_name: string;
  is_public: boolean;
  allows_messages: boolean;
  avatar_url: string;
  professional_background: string;
  social_links: Record<string, string>;
  // Enhanced profile data
  primary_role: string;
  company_name: string;
  company_stage: string;
  industry: string;
  skill_level: string;
  goals: string[];
  expertise: string[];
  service_categories: string[];
}

export default function Profile() {
  const { user, profile, isLoading: authLoading, error: authError, updateProfile } = useAuth();
  const { trackView, trackEvent } = useAnalytics();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLearningProfile, setIsEditingLearningProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedProfile, setEnhancedProfile] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState<ProfileForm>({
    // Basic profile
    full_name: profile?.full_name || '',
    is_public: profile?.is_public || false,
    allows_messages: profile?.allows_messages || false,
    avatar_url: profile?.avatar_url || '',
    professional_background: profile?.professional_background || '',
    social_links: profile?.social_links as Record<string, string> || {
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    },
    // Enhanced profile data with placeholders
    primary_role: '',
    company_name: '',
    company_stage: '',
    industry: '',
    skill_level: '',
    goals: [] as string[],
    expertise: [] as string[],
    service_categories: [] as string[]
  });
  
  // Derived values
  const companyId = enhancedProfile?.company_id || profile?.company_id || '';
  
  // Track page view
  useEffect(() => {
    trackView('page', 'profile');
  }, []);
  
  // Initialize editing state based on profile completeness
  useEffect(() => {
    if (profile) {
      setIsEditing(!profile.full_name);
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || '',
        is_public: profile.is_public || false,
        allows_messages: profile.allows_messages || false,
        avatar_url: profile.avatar_url || '',
        professional_background: profile.professional_background || '',
        social_links: profile.social_links as Record<string, string> || {
          linkedin: '',
          twitter: '',
          github: '',
          website: ''
        },
      }));
    }
  }, [profile]);
  
  // Load external integrations
  useEffect(() => {
    if (!companyId) return;
    
    setLoadingIntegrations(true);
    
    const loadIntegrations = async () => {
      try {
        // Get the integration service from the registry
        const { listIntegrations } = serviceRegistry.get('externalIntegration');
        const data = await listIntegrations(companyId);
        setIntegrations(data);
      } catch (err) {
        console.error('Error loading integrations:', err);
        setError('Failed to load external integrations');
      } finally {
        setLoadingIntegrations(false);
      }
    };
    
    loadIntegrations();
  }, [companyId]);
  
  // Fetch enhanced profile data
  useEffect(() => {
    if (!user) return;
    
    const fetchEnhancedProfile = async () => {
      setIsLoading(true);
      try {
        // Get the enhanced profile service from the registry
        const enhancedProfileService = serviceRegistry.get('enhancedProfile');
        const data = await enhancedProfileService.getProfile(user.id);
        
        if (data) {
          setEnhancedProfile(data);
          setFormData(prev => ({
            ...prev,
            primary_role: data.primary_role || '',
            company_name: 'Company name will load separately',
            company_stage: data.company_stage || '',
            industry: data.industry || '',
            skill_level: data.skill_level || '',
            goals: data.goals || [],
            expertise: data.expertise || [],
            service_categories: data.service_categories || []
          }));
          
          // Track profile loaded event
          trackEvent('enhanced_profile_loaded', { userId: user.id });
        }
      } catch (err: any) {
        console.error('Error fetching enhanced profile:', err);
        setError(err.message || 'Failed to load enhanced profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnhancedProfile();
  }, [user]);
  
  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  // Handle social link change
  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };
  
  // Handle array item change (add/remove items from arrays)
  const handleArrayItemChange = (field: keyof ProfileForm, value: string, isAdd: boolean = true) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[] || [];
      if (isAdd) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    try {
      setIsLoading(true);
      
      // Get the supabase service from the registry
      const { supabase } = serviceRegistry.get('supabase');
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));
      
      // Track avatar upload event
      trackEvent('avatar_uploaded', { userId: profile.id });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      if (!profile?.id) {
        throw new Error('Profile ID not found');
      }
      
      // Get the supabase service from the registry
      const { supabase } = serviceRegistry.get('supabase');
      
      // Update basic profile in the users table
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          is_public: formData.is_public,
          allows_messages: formData.allows_messages,
          avatar_url: formData.avatar_url,
          professional_background: formData.professional_background,
          social_links: formData.social_links,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Error saving profile');
      }
      
      if (data) {
        // Update the profile in auth store via the hook
        await updateProfile(profile.id, data);
      }
      
      // Update enhanced profile if it exists
      if (enhancedProfile?.id && user?.id) {
        // Get the enhanced profile service from the registry
        const enhancedProfileService = serviceRegistry.get('enhancedProfile');
        
        await enhancedProfileService.updateProfile(user.id, {
          primary_role: formData.primary_role as UserRoleType,
          company_stage: formData.company_stage as CompanyStageType,
          industry: formData.industry,
          skill_level: formData.skill_level,
          goals: formData.goals,
          expertise: formData.expertise,
          service_categories: formData.service_categories
        });
      }
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      
      // Track profile update event
      trackEvent('profile_updated', { userId: profile.id });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      
      // Track profile update error
      trackEvent('profile_update_error', { 
        userId: profile?.id, 
        error: err.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <Container maxWidth="lg" padding>
        <div className="py-8 text-center">
          <LoadingSpinner size="lg" text="Loading profile..." centered />
        </div>
      </Container>
    );
  }
  
  // Show error state if auth error
  if (authError) {
    return (
      <Container maxWidth="lg" padding>
        <ErrorDisplay
          title="Authentication Error"
          message={authError}
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="3xl" padding>
      <Stack spacing="md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            {isEditing ? 'Complete Your Profile' : 'Profile Settings'}
          </h1>
          
          <Link to="/settings">
            <Button variant="outline" size="sm" leftIcon={<Cog className="h-4 w-4" />}>
              System Settings
            </Button>
          </Link>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <Alert
            variant="success"
            message={successMessage}
            dismissible
            onDismiss={() => setSuccessMessage('')}
          />
        )}
        
        {/* Error message */}
        {error && (
          <Alert
            variant="error"
            message={error}
            dismissible
            onDismiss={() => setError('')}
          />
        )}
        
        {/* Main Content */}
        <Card shadow="md">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-full w-full p-4 text-gray-400" />
                )}
              </div>
              {isEditing && (
                <label
                  htmlFor="avatar"
                  className="mt-4 inline-flex cursor-pointer"
                >
                  <Button variant="outline" size="sm" leftIcon={<Camera className="h-4 w-4" />}>
                    Upload Photo
                  </Button>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information Section */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
              </div>
              
              {/* Full Name */}
              <div>
                <FormField label="Full Name" id="full_name" required={true}>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </FormField>
              </div>

              {/* Role */}
              <div>
                <FormField label="Role" id="primary_role">
                  <select
                    id="primary_role"
                    name="primary_role"
                    value={formData.primary_role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select your role</option>
                    <option value="founder">Founder</option>
                    <option value="company_member">Company Member</option>
                    <option value="service_provider">Service Provider</option>
                  </select>
                </FormField>
              </div>

              {/* Company Name */}
              <div>
                <FormField label="Company Name" id="company_name">
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Company name if applicable"
                  />
                </FormField>
              </div>

              {/* Company Stage */}
              <div>
                <FormField label="Company Stage" id="company_stage">
                  <select
                    id="company_stage"
                    name="company_stage"
                    value={formData.company_stage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a stage</option>
                    <option value="idea_stage">Idea stage</option>
                    <option value="solid_idea">Solid idea</option>
                    <option value="existing_company">Existing company</option>
                  </select>
                </FormField>
              </div>

              {/* Industry */}
              <div>
                <FormField label="Industry" id="industry">
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="Your industry"
                  />
                </FormField>
              </div>

              {/* Skill Level */}
              <div>
                <FormField label="Skill Level" id="skill_level">
                  <select
                    id="skill_level"
                    name="skill_level"
                    value={formData.skill_level}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select your expertise level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </FormField>
              </div>

              {/* Professional Background */}
              <div className="md:col-span-2">
                <FormField label="Professional Background" id="professional_background">
                  <textarea
                    id="professional_background"
                    name="professional_background"
                    rows={4}
                    value={formData.professional_background}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Brief description of your professional background"
                  />
                </FormField>
              </div>

              {/* Goals & Expertise Section */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Goals & Expertise</h2>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals
                </label>
                <div className="space-y-2">
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-grow p-2 bg-gray-50 rounded text-sm">{goal}</span>
                      <button
                        type="button"
                        onClick={() => handleArrayItemChange('goals', goal, false)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <span className="sr-only">Remove</span>
                        &times;
                      </button>
                    </div>
                  ))}
                  {isEditing && (
                    <div className="flex">
                      <input
                        type="text"
                        id="new-goal"
                        placeholder="Add a goal"
                        className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              handleArrayItemChange('goals', target.value.trim());
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = document.getElementById('new-goal') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleArrayItemChange('goals', input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm rounded-r-md"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expertise Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Areas
                </label>
                <div className="space-y-2">
                  {formData.expertise.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-grow p-2 bg-gray-50 rounded text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleArrayItemChange('expertise', item, false)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <span className="sr-only">Remove</span>
                        &times;
                      </button>
                    </div>
                  ))}
                  {isEditing && (
                    <div className="flex">
                      <input
                        type="text"
                        id="new-expertise"
                        placeholder="Add an expertise area"
                        className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              handleArrayItemChange('expertise', target.value.trim());
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = document.getElementById('new-expertise') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleArrayItemChange('expertise', input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm rounded-r-md"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Social & Contact Section */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Social & Contact</h2>
              </div>

              {/* Social Links */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Links
                </label>
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={formData.social_links.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  />
                  <Input
                    type="url"
                    placeholder="Twitter URL"
                    value={formData.social_links.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  />
                  <Input
                    type="url"
                    placeholder="GitHub URL"
                    value={formData.social_links.github}
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  />
                  <Input
                    type="url"
                    placeholder="Personal Website"
                    value={formData.social_links.website}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="is_public"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                    Make my profile public
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allows_messages"
                    name="allows_messages"
                    checked={formData.allows_messages}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="allows_messages" className="ml-2 block text-sm text-gray-900">
                    Allow other users to message me
                  </label>
                </div>
              </div>

              {/* Learning Profile Section */}
              {user && (
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-medium text-gray-900">Learning Preferences</h2>
                    {!isEditingLearningProfile && user && (
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => setIsEditingLearningProfile(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  {user && (
                    isEditingLearningProfile ? (
                      <LearningProfileEditor 
                        userId={user.id} 
                        onSave={() => setIsEditingLearningProfile(false)}
                        onCancel={() => setIsEditingLearningProfile(false)}
                      />
                    ) : (
                      <LearningProfileDisplay userId={user.id} />
                    )
                  )}
                </div>
              )}

              {/* External Credentials Section */}
              {user && companyId && (
                <div className="md:col-span-2 mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">External Credentials & Certificates</h2>
                  {loadingIntegrations ? (
                    <LoadingSpinner size="sm" text="Loading integrations..." />
                  ) : (
                    <CredentialManager userId={user.id} companyId={companyId} integrations={integrations} />
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="md:col-span-2 flex justify-end">
                <Button
                  variant="outline"
                  size="md"
                  className="mr-4"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                
                {isEditing && (
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Save className="h-4 w-4" />}
                    type="submit"
                    isLoading={isLoading}
                    loadingIndicator={<LoadingSpinner size="sm" />}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}