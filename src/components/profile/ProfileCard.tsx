/**
 * Profile Card Component
 * 
 * Displays user profile information in a card format.
 * Uses the service registry to access the profile service.
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorDisplay } from '../shared/ErrorDisplay';
import { getServiceRegistry } from '../../lib/services/registry';
import { UserProfile, ProfilePersona } from '../../lib/services/profile/types';

interface ProfileCardProps {
  userId: string;
  onEdit?: () => void;
  className?: string;
}

export function ProfileCard({ userId, onEdit, className }: ProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activePersona, setActivePersona] = useState<ProfilePersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the profile service from the service registry
  const profileService = getServiceRegistry().profileService;

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        // Get profile and active persona
        const profileData = await profileService.getProfile(userId);
        let personaData = null;
        
        if (profileData?.activePersonaId) {
          personaData = await profileService.getActivePersona(userId);
        }

        setProfile(profileData);
        setActivePersona(personaData);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId, profileService]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-6">
          <LoadingSpinner text="Loading profile..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <ErrorDisplay 
            message="Error loading profile" 
            details={error}
            onRetry={() => setLoading(true)} 
          />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="text-center text-gray-500">
            <p>Profile not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500">
              {profile.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium">{profile.displayName}</h3>
            {activePersona && (
              <p className="text-sm text-gray-500">{activePersona.role}</p>
            )}
          </div>
        </div>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {profile.bio && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500">Bio</h4>
            <p className="mt-1 text-sm">{profile.bio}</p>
          </div>
        )}

        {profile.expertise && profile.expertise.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500">Expertise</h4>
            <div className="mt-1 flex flex-wrap gap-1">
              {profile.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Connect</h4>
            <div className="mt-1 flex space-x-2">
              {Object.entries(profile.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-500"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {profile.personas && profile.personas.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Personas</h4>
            <div className="mt-2 space-y-2">
              {profile.personas.map((persona) => (
                <div
                  key={persona.id}
                  className={`flex items-center space-x-2 p-2 rounded ${persona.isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  role="button"
                  onClick={async () => {
                    if (!persona.isActive) {
                      try {
                        await profileService.setActivePersona(userId, persona.id);
                        // Refresh profile data
                        const updatedProfile = await profileService.getProfile(userId);
                        const updatedPersona = await profileService.getActivePersona(userId);
                        setProfile(updatedProfile);
                        setActivePersona(updatedPersona);
                      } catch (err: any) {
                        console.error('Error switching persona:', err);
                        setError(err.message || 'Failed to switch persona');
                      }
                    }
                  }}
                >
                  {persona.avatarUrl ? (
                    <img
                      src={persona.avatarUrl}
                      alt={persona.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                      {persona.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                  )}
                  <span className={`text-sm ${persona.isActive ? 'font-medium' : ''}`}>
                    {persona.name}
                  </span>
                  {persona.isActive && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}