import { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { Persona } from '../types/multi-persona-profile.types';
import { multiPersonaProfileService } from '../services/multi-persona-profile.service';

/**
 * Hook to manage persona state and operations
 */
export const usePersona = () => {
  const { user } = useAuthStore();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load personas and active persona on component mount
  useEffect(() => {
    const loadPersonas = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const allPersonas = await multiPersonaProfileService.getPersonas(user.id);
        setPersonas(allPersonas);
        
        const active = await multiPersonaProfileService.getActivePersona(user.id);
        setActivePersona(active);
      } catch (error) {
        console.error('Error loading personas:', error);
        setError('Failed to load personas');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPersonas();
  }, [user?.id]);

  // Handle persona switching
  const switchPersona = async (personaId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const success = await multiPersonaProfileService.setActivePersona(user.id, personaId);
      
      if (success) {
        // Find the persona that was switched to
        const persona = personas.find(p => p.id === personaId);
        setActivePersona(persona || null);
        
        // Show a temporary success message
        const originalError = error;
        setError(`Switched to ${persona?.name || 'new persona'}`);
        setTimeout(() => {
          setError(originalError);
        }, 2000);
        
        return true;
      } else {
        throw new Error('Failed to switch persona');
      }
    } catch (error) {
      console.error('Error switching persona:', error);
      setError('Error switching persona');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    personas,
    activePersona,
    isLoading,
    error,
    switchPersona,
  };
};
