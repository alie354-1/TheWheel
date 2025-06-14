import { useState } from 'react';
import { newJourneyFeaturesService } from '../../../../lib/services/new_journey/new_journey_features.service';
import { NewStepOutcome } from '../../../../lib/types/new_journey.types';

export const useOutcomeCapture = (companyStepId: string) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outcomeData, setOutcomeData] = useState<Partial<Omit<NewStepOutcome, 'id' | 'created_at'>>>({
    company_step_id: companyStepId,
    task_results: {},
    share_anonymously: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const updateOutcomeField = (field: keyof typeof outcomeData, value: any) => {
    setOutcomeData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await newJourneyFeaturesService.captureOutcome(outcomeData as Omit<NewStepOutcome, 'id' | 'created_at'>);
      alert('Outcome captured successfully!');
      closeModal();
    } catch (error) {
      console.error('Failed to capture outcome:', error);
      alert('Failed to capture outcome.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    outcomeData,
    updateOutcomeField,
    handleSubmit,
    isSubmitting,
  };
};
