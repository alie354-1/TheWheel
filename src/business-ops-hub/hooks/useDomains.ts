import { useState, useEffect, useCallback } from 'react';
import { useCompany } from '@/lib/hooks/useCompany';
import {
  getAllCompanyDomains,
  getCompanyDomainById,
  createCompanyDomain,
  updateCompanyDomain,
  deleteCompanyDomain
} from '../services/domain.service';
import { BusinessDomain } from '../types/domain.types';
type DomainSummary = any;
type CreateDomainParams = any;

// Add type for domain statistics
type DomainStat = {
  domain_id: string;
  total_steps?: number;
  completed_steps?: number;
  in_progress_steps?: number;
  not_started_steps?: number;
  skipped_steps?: number;
  completion_percentage?: number;
};

export interface UseDomains {
  domains: BusinessDomain[];
  loading: boolean;
  error: string | null;
  fetchDomains: () => Promise<void>;
  fetchDomainById: (id: string) => Promise<BusinessDomain | null>;
  fetchDomainSummary: (domainId: string) => Promise<DomainSummary | null>;
  createDomain: (params: CreateDomainParams) => Promise<BusinessDomain | null>;
  updateDomain: (id: string, params: Partial<BusinessDomain>) => Promise<BusinessDomain | null>;
  deleteDomain: (id: string) => Promise<boolean>;
}

/**
 * Hook to manage business domains
 */
export const useDomains = (): UseDomains => {
  const { currentCompany: company } = useCompany();
  const [domains, setDomains] = useState<BusinessDomain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all company domains
   */
  const fetchDomains = useCallback(async (): Promise<void> => {
    if (!company?.id) {
      setDomains([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const domainList = await getAllCompanyDomains(company.id);
      setDomains(domainList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch domains');
      console.error('Error fetching company domains:', err);
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  /**
   * Fetch a single company domain by ID
   */
  const fetchDomainById = useCallback(async (id: string): Promise<BusinessDomain | null> => {
    if (!company?.id) return null;
    try {
      return await getCompanyDomainById(id, company.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch domain');
      console.error(`Error fetching company domain ${id}:`, err);
      return null;
    }
  }, [company?.id]);

  /**
   * Fetch domain summary (stub: just returns the domain for now)
   */
  const fetchDomainSummary = useCallback(async (domainId: string): Promise<DomainSummary | null> => {
    return await fetchDomainById(domainId);
  }, [fetchDomainById]);

  /**
   * Create a new company domain
   */
  const createDomain = useCallback(async (params: CreateDomainParams): Promise<BusinessDomain | null> => {
    if (!company?.id) return null;
    try {
      const newDomain = await createCompanyDomain({
        name: params.name,
        description: params.description ?? undefined,
        company_id: company.id
      });

      if (newDomain) {
        setDomains(prev => [...prev, newDomain]);
      }
      return newDomain;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create domain');
      console.error('Error creating company domain:', err);
      return null;
    }
  }, [company?.id]);

  /**
   * Update a company domain
   */
  const updateDomain = useCallback(async (id: string, params: Partial<BusinessDomain>): Promise<BusinessDomain | null> => {
    if (!company?.id) return null;
    try {
      // Only pass supported fields and convert nulls to undefined
      const { name, description } = params;
      const updateFields: { name?: string; description?: string } = {};
      if (typeof name !== "undefined") updateFields.name = name;
      if (typeof description !== "undefined" && description !== null) updateFields.description = description;
      const updatedDomain = await updateCompanyDomain(id, updateFields);

      if (updatedDomain) {
        setDomains(prev =>
          prev.map(domain => domain.id === id ? updatedDomain : domain)
        );
      }
      return updatedDomain;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update domain');
      console.error(`Error updating company domain ${id}:`, err);
      return null;
    }
  }, [company?.id]);

  /**
   * Delete a company domain
   */
  const deleteDomain = useCallback(async (id: string): Promise<boolean> => {
    if (!company?.id) return false;
    try {
      await deleteCompanyDomain(id);

      setDomains(prev => prev.filter(domain => domain.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete domain');
      console.error(`Error deleting company domain ${id}:`, err);
      return false;
    }
  }, [company?.id]);

  // Load domains on mount
  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return {
    domains,
    loading,
    error,
    fetchDomains,
    fetchDomainById,
    fetchDomainSummary,
    createDomain,
    updateDomain,
    deleteDomain
  };
};
