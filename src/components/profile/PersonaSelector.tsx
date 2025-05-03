import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersona } from '../../lib/hooks/usePersona';
import { ChevronDown, Plus, Settings } from 'lucide-react';

/**
 * PersonaSelector component
 * 
 * Displays the current active persona and allows switching between personas
 * or creating new personas.
 */
export const PersonaSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { personas, activePersona, isLoading, error, switchPersona } = usePersona();
  const navigate = useNavigate();

  // Handle persona switching
  const handleSwitchPersona = async (personaId: string) => {
    const success = await switchPersona(personaId);
    
    if (success) {
      setIsOpen(false);
      // Refresh current page to update content for new persona
      window.location.reload();
    }
  };

  // Navigate to create new persona page
  const handleCreatePersona = () => {
    navigate('/personas/new');
    setIsOpen(false);
  };

  // Navigate to persona management page
  const handleManagePersonas = () => {
    navigate('/personas');
    setIsOpen(false);
  };

  // Get persona type badge color
  const getPersonaTypeColor = (type: string): string => {
    switch (type) {
      case 'founder':
        return 'bg-green-100 text-green-800';
      case 'service_provider':
        return 'bg-purple-100 text-purple-800';
      case 'company_member':
        return 'bg-blue-100 text-blue-800';
      case 'investor':
        return 'bg-orange-100 text-orange-800';
      case 'advisor':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <button
        disabled
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white"
      >
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading
      </button>
    );
  }

  // If no active persona, show a message
  if (!activePersona) {
    return (
      <button
        onClick={handleCreatePersona}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Persona
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md"
      >
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
            {activePersona.icon ? (
              <img src={activePersona.icon} alt={activePersona.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm font-semibold">
                {activePersona.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">
              {activePersona.name}
            </div>
            <div className={`text-xs px-1.5 py-0.5 rounded-full ${getPersonaTypeColor(activePersona.type)}`}>
              {activePersona.type.replace('_', ' ')}
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              YOUR PERSONAS
            </div>
            
            {personas.map(persona => (
              <button
                key={persona.id}
                onClick={() => handleSwitchPersona(persona.id)}
                className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                  persona.id === activePersona.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center w-full">
                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
                    {persona.icon ? (
                      <img src={persona.icon} alt={persona.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-xs font-semibold">
                        {persona.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{persona.name}</div>
                    <div className={`text-xs px-1 py-0.5 rounded-full ${getPersonaTypeColor(persona.type)} inline-block`}>
                      {persona.type.replace('_', ' ')}
                    </div>
                  </div>
                  {persona.id === activePersona.id && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">
                      Active
                    </span>
                  )}
                </div>
              </button>
            ))}
            
            <hr className="my-1" />
            
            <button
              onClick={handleCreatePersona}
              className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Persona</span>
            </button>
            
            <button
              onClick={handleManagePersonas}
              className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Manage Personas</span>
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-full mt-1 right-0 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
