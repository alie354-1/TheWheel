import React, { useState } from 'react';
import { ExpertProfile } from '../../lib/types/community.types';
import { X } from 'lucide-react';

interface ExpertProfilePreviewProps {
  profile: Partial<ExpertProfile>;
  onClose: () => void;
}

/**
 * Component to preview how an expert profile will look to other users
 */
const ExpertProfilePreview: React.FC<ExpertProfilePreviewProps> = ({ profile, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'card'>('profile');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Profile Preview</h2>
          <div className="flex items-center space-x-4">
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-l-md border border-gray-300`}
                onClick={() => setActiveTab('profile')}
              >
                Full Profile
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-r-md border border-gray-300 border-l-0`}
                onClick={() => setActiveTab('card')}
              >
                Card View
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-100 mb-8">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 overflow-hidden">
                    {profile.user_avatar_url && (
                      <img 
                        src={profile.user_avatar_url} 
                        alt={profile.user_name || 'Expert'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">{profile.user_name || 'Your Name'}</h1>
                  <div className="text-blue-600 font-medium text-center mb-4">
                    {profile.primary_expertise_areas && profile.primary_expertise_areas.length > 0 ? 
                      `Expert in ${profile.primary_expertise_areas[0]}` : 
                      'Community Expert'}
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-gray-600">0 endorsements</span>
                  </div>
                  
                  <div className="w-full">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mb-2" disabled>
                      Request Consultation
                    </button>
                    <button className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded" disabled>
                      Send Message
                    </button>
                  </div>
                </div>
                
                <div className="md:w-2/3 p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">About</h2>
                    <p className="text-gray-600 whitespace-pre-line">
                      {profile.success_stories && profile.success_stories.length > 0 
                        ? profile.success_stories.join('\n\n')
                        : `Expert in ${profile.primary_expertise_areas?.join(', ') || 'various areas'}`}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.primary_expertise_areas?.map((area: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                          {area}
                        </span>
                      ))}
                      {profile.secondary_expertise_areas?.map((area: string, index: number) => (
                        <span key={`secondary-${index}`} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {profile.industry_experience && Object.keys(profile.industry_experience).length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Industry Experience</h2>
                      <div className="space-y-4">
                        {Object.entries(profile.industry_experience).map(([industry, details], index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <div className="font-medium">{industry}</div>
                            <div className="text-gray-600">{details.years} years</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile.functional_experience && Object.keys(profile.functional_experience).length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Functional Experience</h2>
                      <div className="space-y-4">
                        {Object.entries(profile.functional_experience).map(([function_area, details], index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <div className="font-medium">{function_area}</div>
                            <div className="text-gray-600">{details.years} years</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile.success_stories && profile.success_stories.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Success Stories</h2>
                      <div className="space-y-2">
                        {profile.success_stories.map((story: string, index: number) => (
                          <div key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{story}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Mentorship Capacity</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-600">
                        {profile.mentorship_capacity && profile.mentorship_capacity > 0 
                          ? `Available for mentorship (Capacity: ${profile.mentorship_capacity})` 
                          : 'Not currently available for mentorship'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col max-w-sm mx-auto">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 mr-4 overflow-hidden">
                    {profile.user_avatar_url && (
                      <img 
                        src={profile.user_avatar_url} 
                        alt={profile.user_name || 'Expert'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {profile.user_name || 'Your Name'}
                    </h2>
                    <div className="text-sm text-blue-600">
                      {profile.primary_expertise_areas && profile.primary_expertise_areas.length > 0 ? 
                        `Expert in ${profile.primary_expertise_areas[0]}` : 
                        'Community Expert'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-600">0 endorsements</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {profile.success_stories && profile.success_stories.length > 0 
                    ? profile.success_stories[0] 
                    : 'Expert in ' + profile.primary_expertise_areas?.join(', ')}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {profile.primary_expertise_areas?.slice(0, 3).map((area: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {area}
                    </span>
                  ))}
                  {profile.primary_expertise_areas && profile.primary_expertise_areas.length > 3 && (
                    <span className="text-xs text-gray-500">+{profile.primary_expertise_areas.length - 3} more</span>
                  )}
                </div>
                
                <button 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  disabled
                >
                  View Profile →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfilePreview;
