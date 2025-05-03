import React, { useState } from 'react';
import { User } from '@supabase/supabase-js'; // Keep User type for reference if needed elsewhere
import { enhancedProfileService } from '../../lib/services/enhanced-profile.service';
import { UserRoleType, CompanyStageType } from '../../lib/types/enhanced-profile.types';

interface InitialOnboardingWizardProps {
  user: { id: string }; // Only require the user ID
  onComplete: () => void;
}

const InitialOnboardingWizard: React.FC<InitialOnboardingWizardProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<UserRoleType | null>(null);
  const [companyStage, setCompanyStage] = useState<CompanyStageType | undefined>(undefined);
  const [isServiceProvider, setIsServiceProvider] = useState<boolean>(false);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Create or update the enhanced profile
      await enhancedProfileService.createProfile({
        user_id: user.id,
        primary_role: role as UserRoleType,
        company_stage: companyStage || undefined,
        service_categories: isServiceProvider ? serviceCategories : [],
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceCategoryChange = (category: string) => {
    if (serviceCategories.includes(category)) {
      setServiceCategories(serviceCategories.filter(c => c !== category));
    } else {
      setServiceCategories([...serviceCategories, category]);
    }
  };

  // Progress indicator
  const totalSteps = role === 'founder' || isServiceProvider ? 3 : 2;
  const progress = Math.floor((step / totalSteps) * 100);

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-center">Welcome to Wheel99</h2>
      
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Tell us about yourself</h3>
          <p className="text-gray-600">Which of the following best describes you?</p>
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setRole('founder');
                setIsServiceProvider(false);
                setStep(2);
              }}
              className={`w-full p-4 text-left border rounded-lg ${role === 'founder' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">I'm a founder</p>
                  <p className="text-sm text-gray-500">I'm starting or running a company</p>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setRole('company_member');
                setIsServiceProvider(false);
                setStep(2);
              }}
              className={`w-full p-4 text-left border rounded-lg ${role === 'company_member' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">I'm a company member</p>
                  <p className="text-sm text-gray-500">I'm part of an existing company</p>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setRole('service_provider');
                setIsServiceProvider(true);
                setStep(2);
              }}
              className={`w-full p-4 text-left border rounded-lg ${role === 'service_provider' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">I provide services to companies</p>
                  <p className="text-sm text-gray-500">I'm a consultant, freelancer, or service provider</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 2 && role === 'founder' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">What stage is your company at?</h3>
          <p className="text-gray-600">This helps us recommend the right tools for you.</p>
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setCompanyStage('idea_stage');
                setStep(3);
              }}
              className={`w-full p-4 text-left border rounded-lg ${companyStage === 'idea_stage' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Idea stage</p>
                  <p className="text-sm text-gray-500">I have a concept or idea I'm exploring</p>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setCompanyStage('solid_idea');
                setStep(3);
              }}
              className={`w-full p-4 text-left border rounded-lg ${companyStage === 'solid_idea' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Solid idea ready to form a company</p>
                  <p className="text-sm text-gray-500">I need help with company formation and structure</p>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setCompanyStage('existing_company');
                setStep(3);
              }}
              className={`w-full p-4 text-left border rounded-lg ${companyStage === 'existing_company' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Already have a company</p>
                  <p className="text-sm text-gray-500">I want to manage my existing company</p>
                </div>
              </div>
            </button>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 2 && role === 'company_member' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">What's your role in the company?</h3>
          <p className="text-gray-600">We'll personalize your experience based on your answer.</p>
          
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              As a company member, you'll need to either join an existing company or create a new one.
              You can do this after completing onboarding.
            </p>
            
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-800">
                  You'll be directed to join a company after setup
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && isServiceProvider && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">What services do you provide?</h3>
          <p className="text-gray-600">Select all that apply. This helps us match you with the right opportunities.</p>
          
          <div className="space-y-2">
            {[
              'Legal Services',
              'Accounting',
              'Software Development',
              'Design',
              'Marketing',
              'Sales',
              'HR & Recruiting',
              'Business Consulting',
              'Financial Advisory'
            ].map((service) => (
              <div key={service} className="flex items-center">
                <input
                  id={`service-${service}`}
                  name="services"
                  type="checkbox"
                  checked={serviceCategories.includes(service)}
                  onChange={() => handleServiceCategoryChange(service)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`service-${service}`} className="ml-3 block text-sm font-medium text-gray-700">
                  {service}
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={serviceCategories.length === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (role === 'founder' || isServiceProvider) && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Ready to get started!</h3>
          
          {role === 'founder' && companyStage === 'idea_stage' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">We recommend:</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      <strong>Idea Playground</strong> - An interactive space to brainstorm, explore, and refine your business ideas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {role === 'founder' && companyStage === 'solid_idea' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">We recommend:</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      <strong>Company Formation</strong> - Tools and resources to help you formally establish your business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {role === 'founder' && companyStage === 'existing_company' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">We recommend:</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      <strong>Company Dashboard</strong> - Tools to manage your existing company's operations and team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isServiceProvider && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">We recommend:</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      <strong>Service Provider Directory</strong> - Build your profile and connect with businesses that need your services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mt-4">
            Click "Complete Setup" to save your preferences and start using Wheel99.
          </p>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialOnboardingWizard;
