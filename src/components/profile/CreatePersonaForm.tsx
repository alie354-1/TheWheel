import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { multiPersonaProfileService } from '../../lib/services/multi-persona-profile.service';
import { useAuthStore } from '../../lib/store';

export const CreatePersonaForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [personaType, setPersonaType] = useState<'founder' | 'service_provider' | 'company_member' | 'investor' | 'advisor' | 'community' | 'custom' | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name for your persona');
      return;
    }
    
    if (!personaType) {
      setError('Please select a persona type');
      return;
    }
    
    if (!user?.id) {
      setError('You must be logged in to create a persona');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newPersona = await multiPersonaProfileService.createPersona(user.id, {
        name,
        type: personaType,
        icon: undefined, // We can add icon support later
        is_active: true, // Make this the active persona
      });
      
      // Redirect to onboarding for this new persona
      if (newPersona) {
        navigate(`/onboarding/${newPersona.id}`);
      } else {
        setError('Failed to create persona. Please try again.');
      }
    } catch (err) {
      console.error('Error creating persona:', err);
      setError('Failed to create persona. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 my-10">
      <h2 className="text-lg font-medium text-gray-900 mb-5">Create New Persona</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Persona Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="e.g. My Founder Profile"
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a... <span className="text-gray-500">(select your role)</span>
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="founder"
                name="personaType"
                type="radio"
                value="founder"
                checked={personaType === 'founder'}
                onChange={() => setPersonaType('founder')}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                disabled={loading}
              />
              <label htmlFor="founder" className="ml-3 block text-sm font-medium text-gray-700">
                Founder or Co-founder
                <span className="block text-xs text-gray-500">I'm building a company or startup</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="company_member"
                name="personaType"
                type="radio"
                value="company_member"
                checked={personaType === 'company_member'}
                onChange={() => setPersonaType('company_member')}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                disabled={loading}
              />
              <label htmlFor="company_member" className="ml-3 block text-sm font-medium text-gray-700">
                Company Member
                <span className="block text-xs text-gray-500">I work for a company or organization</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="service_provider"
                name="personaType"
                type="radio"
                value="service_provider"
                checked={personaType === 'service_provider'}
                onChange={() => setPersonaType('service_provider')}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                disabled={loading}
              />
              <label htmlFor="service_provider" className="ml-3 block text-sm font-medium text-gray-700">
                Service Provider
                <span className="block text-xs text-gray-500">I provide services to companies or startups</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/personas')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create & Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePersonaForm;
