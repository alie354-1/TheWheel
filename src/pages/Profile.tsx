import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { UserCircle, Save, Camera, Briefcase, GraduationCap, Building, Cog, Target } from 'lucide-react';
import { enhancedProfileService } from '../lib/services/enhanced-profile.service';
import { Link } from 'react-router-dom';
import { UserRoleType, CompanyStageType } from '../lib/types/enhanced-profile.types';

export default function Profile() {
  const { user, profile, setProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(!profile?.full_name);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedProfile, setEnhancedProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Basic profile
    full_name: profile?.full_name || '',
    is_public: profile?.is_public || false,
    allows_messages: profile?.allows_messages || false,
    avatar_url: profile?.avatar_url || '',
    // These fields might need to be added to the profile type
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
  
  // Fetch enhanced profile data if available
  useEffect(() => {
    if (!user) return;
    
    const fetchEnhancedProfile = async () => {
      setIsLoading(true);
      try {
        const data = await enhancedProfileService.getProfile(user.id);
        if (data) {
          setEnhancedProfile(data);
          setFormData(prev => ({
            ...prev,
            primary_role: data.primary_role || '',
            company_name: 'Company name will load separately', // Company is handled separately
            company_stage: data.company_stage || '',
            industry: data.industry || '',
            skill_level: data.skill_level || '',
            goals: data.goals || [],
            expertise: data.expertise || [],
            service_categories: data.service_categories || []
          }));
        }
      } catch (error) {
        console.error('Error fetching enhanced profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnhancedProfile();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  // Add or remove items from array fields
  const handleArrayItemChange = (field: string, value: string, isAdd: boolean = true) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[] || [];
      if (isAdd) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setIsLoading(true);
      
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
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
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
        .eq('id', profile?.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        alert('Error saving profile: ' + (error.message || 'Unknown error'));
        setIsLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        console.error('No data returned from profile update:', data);
        alert('No data returned from profile update.');
      }
      
      // Update enhanced profile if it exists
      if (enhancedProfile?.id) {
        await enhancedProfileService.updateProfile(user!.id, {
          primary_role: formData.primary_role as UserRoleType,
          // Don't update company_name as it's not in the EnhancedProfileType
          company_stage: formData.company_stage as CompanyStageType,
          industry: formData.industry,
          skill_level: formData.skill_level,
          goals: formData.goals,
          expertise: formData.expertise,
          service_categories: formData.service_categories
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            {isEditing ? 'Complete Your Profile' : 'Profile Settings'}
          </h1>
          
          <Link 
            to="/settings" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Cog className="h-4 w-4 mr-2" />
            System Settings
          </Link>
        </div>

        <div className="mt-6">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
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
                  <div className="md:col-span-2">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
                  </div>
                  
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="primary_role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
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
                  </div>

                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Company name if applicable"
                    />
                  </div>

                  <div>
                    <label htmlFor="company_stage" className="block text-sm font-medium text-gray-700">
                      Company Stage
                    </label>
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
                  </div>

                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                      Industry
                    </label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Your industry"
                    />
                  </div>

                  <div>
                    <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700">
                      Skill Level
                    </label>
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
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="professional_background" className="block text-sm font-medium text-gray-700">
                      Professional Background
                    </label>
                    <textarea
                      id="professional_background"
                      name="professional_background"
                      rows={4}
                      value={formData.professional_background}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Brief description of your professional background"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Goals & Expertise</h2>
                  </div>

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

                  <div className="md:col-span-2">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Social & Contact</h2>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Social Links
                    </label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={formData.social_links.linkedin}
                        onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <input
                        type="url"
                        placeholder="Twitter URL"
                        value={formData.social_links.twitter}
                        onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={formData.social_links.github}
                        onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <input
                        type="url"
                        placeholder="Personal Website"
                        value={formData.social_links.website}
                        onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

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

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                    
                    {isEditing && (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
