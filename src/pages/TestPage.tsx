import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="text-gray-600">This is a test page to verify routing is working correctly.</p>
        <div className="mt-6">
          <a 
            href="/idea-hub/playground" 
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Idea Playground
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
