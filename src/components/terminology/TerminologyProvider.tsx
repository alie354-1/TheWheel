import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TerminologyService } from '../../lib/services/terminology.service';
import { ResolvedTerminologyMap } from '../../lib/types/terminology.types';
import { useAuth, useCompany } from '../../lib/hooks';

// Define context shape
type TerminologyContextType = {
  terminology: ResolvedTerminologyMap;
  isLoading: boolean;
  error: Error | null;
  refreshTerminology: () => Promise<void>;
};

// Create context with default values
const TerminologyContext = createContext<TerminologyContextType>({
  terminology: {},
  isLoading: true,
  error: null,
  refreshTerminology: async () => {},
});

export const useTerminology = () => useContext(TerminologyContext);

type TerminologyProviderProps = {
  children: ReactNode;
};

export const TerminologyProvider: React.FC<TerminologyProviderProps> = ({ children }) => {
  const [terminology, setTerminology] = useState<ResolvedTerminologyMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = useAuth();
  const { currentCompany, currentTeam } = useCompany();

  const loadTerminology = async () => {
    if (!user) {
      // If no user is logged in, use default terminology
      try {
        const defaults = await TerminologyService.getDefaultTerminology();
        setTerminology(defaults);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load default terminology'));
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determine the appropriate entity type and ID based on available context
      let entityType: 'user' | 'team' | 'company' | null = null;
      let entityId: string | null = null;

      if (currentTeam?.id) {
        entityType = 'team';
        entityId = currentTeam.id;
      } else if (currentCompany?.id) {
        entityType = 'company';
        entityId = currentCompany.id;
      } else if (user?.id) {
        entityType = 'user';
        entityId = user.id;
      }

      if (entityType && entityId) {
        const resolvedTerminology = await TerminologyService.resolveTerminology(
          entityType,
          entityId,
          { ignoreCache: false }
        );
        setTerminology(resolvedTerminology);
      } else {
        // Fall back to default terminology if no entity context is available
        const defaults = await TerminologyService.getDefaultTerminology();
        setTerminology(defaults);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load terminology'));
      console.error('Error loading terminology:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load terminology on mount and when user/company/team changes
  useEffect(() => {
    loadTerminology();
  }, [user?.id, currentCompany?.id, currentTeam?.id]);

  const refreshTerminology = async () => {
    await loadTerminology();
  };

  return (
    <TerminologyContext.Provider
      value={{
        terminology,
        isLoading,
        error,
        refreshTerminology,
      }}
    >
      {children}
    </TerminologyContext.Provider>
  );
};
