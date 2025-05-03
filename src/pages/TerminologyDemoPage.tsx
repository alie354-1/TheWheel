import React from 'react';
import { TerminologyShowcase, TerminologyProvider } from '../components/terminology';

/**
 * Demo page for showcasing the Terminology system
 * This page serves as both a demonstration and a testing ground for terminology components
 */
export const TerminologyDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terminology System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This page demonstrates the Multi-Tenant Terminology System components
            and how they can be used throughout the application.
          </p>
        </header>
        
        {/* The TerminologyProvider is already available globally in the app,
            but we include it here to emphasize its importance */}
        <TerminologyProvider>
          <TerminologyShowcase />
        </TerminologyProvider>
        
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Developer Usage Guide</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Basic Usage</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { Term } from '../components/terminology';

// In your component:
<p>
  The next <Term keyPath="journeyTerms.stepUnit.singular" /> is ready.
</p>`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">With Templates</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { DynamicText, Term } from '../components/terminology';

// In your component:
<DynamicText
  template="You have {{count}} {{term}} remaining."
  values={{
    count: 5,
    term: <Term keyPath="journeyTerms.stepUnit.plural" />
  }}
  keyPath="journeyTerms.mainUnit.singular" // Fallback
/>`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">With Styling & Elements</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`<DynamicText
  keyPath="systemTerms.application.name"
  as="h1"
  className="text-2xl font-bold text-blue-800"
/>`}</code>
              </pre>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h3 className="font-medium text-blue-800 mb-2">Best Practices</h3>
            <ul className="list-disc pl-5 space-y-2 text-blue-900">
              <li>Always use terminology components for user-facing strings that might need customization</li>
              <li>Provide meaningful fallbacks for optional terms</li>
              <li>Use template strings for complex text with multiple terminology references</li>
              <li>Consider text transformations (capitalization, etc.) for proper display</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminologyDemoPage;
