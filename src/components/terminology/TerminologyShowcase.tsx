import React, { useState } from 'react';
import {
  Term,
  CapitalizedTerm,
  DynamicText,
  CapitalizedDynamicText,
  TitleDynamicText
} from '.';

/**
 * Component to showcase the terminology system components
 * This serves as both a test case and an example for developers
 */
export const TerminologyShowcase: React.FC = () => {
  const [count, setCount] = useState(5);
  
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Terminology Components Showcase</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Term Components</h2>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Basic Term</h3>
            <div className="flex flex-col gap-2">
              <p>A single <Term keyPath="journeyTerms.mainUnit.singular" /> is part of the startup process.</p>
              <p>You have completed multiple <Term keyPath="journeyTerms.mainUnit.plural" />.</p>
              <p>Each <Term keyPath="journeyTerms.stepUnit.singular" /> should be carefully considered.</p>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Capitalized Term</h3>
            <div className="flex flex-col gap-2">
              <p><CapitalizedTerm keyPath="journeyTerms.mainUnit.singular" /> completion is important.</p>
              <p><CapitalizedTerm keyPath="journeyTerms.stepUnit.plural" /> should be organized by priority.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Enhanced Dynamic Text Components</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Basic Dynamic Text</h3>
            <div className="flex flex-col gap-2">
              <p>
                <DynamicText
                  keyPath="journeyTerms.mainUnit.singular"
                  className="text-blue-600 font-semibold"
                />
              </p>
              
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change count:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCount(prev => Math.max(0, prev - 1))}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{count}</span>
                  <button
                    onClick={() => setCount(prev => prev + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <p className="mt-2">
                <DynamicText
                  template="You have {{count}} {{term}} remaining."
                  values={{
                    count,
                    term: count === 1 
                      ? <Term keyPath="journeyTerms.stepUnit.singular" /> 
                      : <Term keyPath="journeyTerms.stepUnit.plural" />
                  }}
                  keyPath="journeyTerms.mainUnit.singular" // Fallback if no template provided
                  className="text-green-600"
                />
              </p>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Transformed Dynamic Text</h3>
            <div className="flex flex-col gap-2">
              <p>
                <CapitalizedDynamicText
                  keyPath="journeyTerms.stepUnit.singular"
                  className="text-purple-600"
                />
                {' '}- First letter capitalized
              </p>
              
              <p>
                <TitleDynamicText
                  keyPath="journeyTerms.progressTerms.inProgress"
                  className="text-orange-600"
                />
                {' '}- Title case (each word capitalized)
              </p>
              
              <p>
                <DynamicText
                  keyPath="journeyTerms.stepUnit.plural"
                  as="h4"
                  className="text-red-600 font-bold"
                  transform={(s: string) => s.toUpperCase()}
                />
                {' '}- Custom transform (uppercase)
              </p>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Different HTML Elements</h3>
            <div className="flex flex-col gap-2">
              <DynamicText
                keyPath="systemTerms.application.name"
                fallback="The Wheel"
                as="h1"
                className="text-xl font-bold text-blue-800"
              />
              
              <DynamicText
                keyPath="systemTerms.application.tagline"
                fallback="Your startup journey, simplified"
                as="p"
                className="text-gray-600 italic"
              />
              
              <DynamicText
                template="Start your {{journey}} today with our comprehensive toolkit."
                values={{
                  journey: <Term keyPath="journeyTerms.mainUnit.singular" className="font-medium" />
                }}
                keyPath="journeyTerms.mainUnit.singular"
                as="div"
                className="text-green-700 mt-2"
              />
            </div>
          </div>
        </div>
      </section>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="font-medium text-gray-700 mb-2">How It Works</h3>
        <p className="text-sm text-gray-600">
          The terminology components retrieve values from a context-aware terminology system.
          This allows for dynamic text substitution based on user preferences,
          company settings, white labeling, and more - all without changing the component code.
        </p>
      </div>
    </div>
  );
};
