import React from 'react';
import { renderToString } from 'react-dom/server';
import IdeaRefinement from '../src/components/IdeaRefinement.tsx';
import { useAuthStore } from '../src/lib/store';

// Mock the useAuthStore hook
jest.mock('../src/lib/store', () => ({
  useAuthStore: jest.fn()
}));

// Set up the mock return value for useAuthStore
useAuthStore.mockReturnValue({
  user: {
    id: 'test-user-id',
    email: 'test@example.com'
  },
  profile: {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'admin'
  }
});

try {
  // Try to render the component to a string
  const html = renderToString(<IdeaRefinement />);
  console.log('IdeaRefinement component rendered successfully!');
} catch (error) {
  console.error('Error rendering IdeaRefinement component:', error);
}
