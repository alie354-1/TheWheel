import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { multiPersonaProfileService } from '../../lib/services/multi-persona-profile.service';
import { useAuthStore } from '../../lib/store';
import { Plus, Edit, Trash, Check, RefreshCw } from 'lucide-react';

const PersonaManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [personas, setPersonas] = useState<any[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Load personas on component mount
  useEffect(() => {
    const loadPersonas = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userPersonas = await multiPersonaProfileService.getPersonas(user.id);
        setPersonas(userPersonas);
        
        const active = await multiPersonaProfileService.getActivePersona(user.id);
        if (active) {
          setActivePersonaId(active.id);
        }
      } catch (error) {
        console.error('Error loading personas:', error);
        setError('Failed to load personas. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPersonas();
  }, [user?.id]);
  
  // Handle showing success message with auto-clear
  const showSuccessMessage = (message: string) => {
    setError(message);
    const id = window.setTimeout(() => {
      setError(null);
    }, 2000);
    return () => window.clearTimeout(id);
  };
  
  // Handle making a persona active
  const handleSetActive = async (personaId: string) => {
    if (!user?.id) return;
    
    setActionLoading(personaId);
    try {
      await multiPersonaProfileService.setActivePersona(user.id, personaId);
      setActivePersonaId(personaId);
      
      // Show temporary success message
      showSuccessMessage('Persona activated successfully!');
    } catch (error) {
      console.error('Error setting active persona:', error);
      setError('Failed to set active persona. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle deleting a persona
  const handleDelete = async (personaId: string) => {
    if (!user?.id) return;
    
    setActionLoading(personaId);
    try {
      await multiPersonaProfileService.deletePersona(user.id, personaId);
      setPersonas(personas.filter(p => p.id !== personaId));
      setDeleteConfirmId(null);
      
      // Show temporary success message
      showSuccessMessage('Persona deleted successfully!');
    } catch (error) {
      console.error('Error deleting persona:', error);
      setError('Failed to delete persona. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Get type badge styling
  const getTypeStyles = (type: string): string => {
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900">Your Personas</h2>
            <button
              onClick={() => navigate('/personas/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Persona
            </button>
          </div>
          
          {/* Error/success message */}
          {error && (
            <div 
              className={`px-6 py-3 ${
                error.includes('success') 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              } border-b`}
            >
              {error}
            </div>
          )}
          
          {/* Personas list */}
          <div className="divide-y divide-gray-200">
            {personas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No personas</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new persona.</p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/personas/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Persona
                  </button>
                </div>
              </div>
            ) : (
              personas.map((persona) => (
                <div 
                  key={persona.id} 
                  className={`px-6 py-4 flex items-center justify-between ${
                    persona.id === activePersonaId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {persona.icon ? (
                        <img src={persona.icon} alt={persona.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-gray-500 text-lg font-semibold">
                          {persona.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900 flex items-center">
                        {persona.name}
                        {persona.id === activePersonaId && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Active
                          </span>
                        )}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyles(persona.type)}`}>
                        {persona.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Set Active Button */}
                    {persona.id !== activePersonaId && (
                      <button
                        onClick={() => handleSetActive(persona.id)}
                        disabled={actionLoading === persona.id}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {actionLoading === persona.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => navigate(`/personas/edit/${persona.id}`)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => 
                        deleteConfirmId === persona.id 
                          ? handleDelete(persona.id) 
                          : setDeleteConfirmId(persona.id)
                      }
                      disabled={actionLoading === persona.id}
                      className={`inline-flex items-center p-2 border rounded-md shadow-sm text-sm font-medium ${
                        deleteConfirmId === persona.id
                          ? 'bg-red-500 text-white hover:bg-red-600 border-transparent'
                          : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    >
                      {actionLoading === persona.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 text-right">
            <p className="text-sm text-gray-500">
              Different personas allow you to switch between different roles and settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaManagementPage;
