import React from "react";
import { useCompany } from "@/lib/hooks/useCompany";
import ExternalTrainingIntegrationManager from "@/components/company/integrations/ExternalTrainingIntegrationManager";

/**
 * Page for managing external LMS and content provider integrations.
 * Accessible to company admins.
 */
const ExternalIntegrationsPage: React.FC = () => {
  const { currentCompany } = useCompany();

  if (!currentCompany?.id) {
    return <div className="p-8 text-center text-gray-500">No company selected.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">External Training Integrations</h1>
      <ExternalTrainingIntegrationManager companyId={currentCompany.id} />
    </div>
  );
};

export default ExternalIntegrationsPage;
