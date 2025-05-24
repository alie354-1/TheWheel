import { useState, useEffect, useCallback } from "react";
import {
  getDomainSteps,
  addStepToDomain,
  removeStepFromDomain,
  batchAddStepsToDomain,
  generateStepRecommendations,
} from "../services/domain.service";
import { logDomainStepAction } from "../services/logging.service";
import { DomainStep } from "../types/domain-extended.types";

export const useDomainSteps = (
  domainId: string,
  companyId: string,
  userId?: string | null
) => {
  const [steps, setSteps] = useState<DomainStep[]>([]);
  const [recommendedSteps, setRecommendedSteps] = useState<DomainStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSteps = useCallback(
    async (includeRecommended: boolean = false) => {
      try {
        setLoading(true);
        const data = await getDomainSteps(domainId, companyId, includeRecommended);

        if (includeRecommended) {
          setSteps(data.filter((step) => !step.is_recommended));
          setRecommendedSteps(data.filter((step) => step.is_recommended));
        } else {
          setSteps(data);
        }

        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [domainId, companyId]
  );

  const addStep = useCallback(
    async (
      stepId: string,
      options?: {
        isRequired?: boolean;
        relevanceScore?: number;
        domainSpecificDescription?: string;
      }
    ) => {
      try {
        await addStepToDomain(domainId, stepId, companyId, options);
        // Log the add action
        await logDomainStepAction(
          companyId,
          domainId,
          stepId,
          userId || null,
          "add",
          { ...options }
        );
        fetchSteps(true);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    [domainId, companyId, fetchSteps, userId]
  );

  const removeStep = useCallback(
    async (stepId: string) => {
      try {
        await removeStepFromDomain(domainId, stepId, companyId);
        // Log the remove action
        await logDomainStepAction(
          companyId,
          domainId,
          stepId,
          userId || null,
          "remove"
        );
        fetchSteps(true);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    [domainId, companyId, fetchSteps, userId]
  );

  const bulkAddSteps = useCallback(
    async (stepIds: string[]) => {
      try {
        const count = await batchAddStepsToDomain(domainId, companyId, stepIds);
        fetchSteps(true);
        return count;
      } catch (err: any) {
        setError(err.message);
        return 0;
      }
    },
    [domainId, companyId, fetchSteps]
  );

  const refreshRecommendations = useCallback(async () => {
    try {
      await generateStepRecommendations(domainId);
      fetchSteps(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [domainId, fetchSteps]);

  useEffect(() => {
    fetchSteps(true);
  }, [fetchSteps]);

  return {
    steps,
    recommendedSteps,
    loading,
    error,
    addStep,
    removeStep,
    bulkAddSteps,
    refreshRecommendations,
    refetch: fetchSteps,
  };
};
