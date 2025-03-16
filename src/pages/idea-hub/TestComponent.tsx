import React from 'react';
import IdeaRefinement from '../../components/IdeaRefinement';
import { useAuthStore } from '../../lib/store';

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'test@example.com',
  role: 'authenticated'
};

// Mock profile for testing
const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  role: 'admin' as 'admin', // Type assertion to fix TypeScript error
  is_public: true,
  allows_messages: true,
  settings: {}
};

export default function TestComponent() {
  // Set the mock user and profile in the auth store
  const { setUser, setProfile } = useAuthStore();
  
  React.useEffect(() => {
    setUser(mockUser);
    setProfile(mockProfile);
  }, [setUser, setProfile]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Test Component</h1>
      <div className="bg-gray-100 p-4 mb-4 rounded">
        <p>This is a test component that renders the IdeaRefinement component with a mock user.</p>
      </div>
      <IdeaRefinement />
    </div>
  );
}
