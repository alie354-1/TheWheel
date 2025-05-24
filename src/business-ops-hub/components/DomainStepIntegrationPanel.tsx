import React, { useState } from "react";
import DomainStepManager from "./DomainStepManager";
import StepSelector from "./StepSelector";
import { useDomainSteps } from "../hooks/useDomainSteps";
import { useCompany } from "@/lib/hooks/useCompany";

interface DomainStepIntegrationPanelProps {
  domainId: string;
  companyId: string;
}

export const DomainStepIntegrationPanel: React.FC<DomainStepIntegrationPanelProps> = ({
  domainId,
  companyId,
}) => {
  const [activeTab, setActiveTab] = useState<"manage" | "add">("manage");
  const [isStepSelectorOpen, setIsStepSelectorOpen] = useState(false);
  const { currentUser } = useCompany();
  const { steps, addStep } = useDomainSteps(domainId, companyId, currentUser?.id || null);

  const handleStepSelect = async (stepId: string) => {
    await addStep(stepId);
    setIsStepSelectorOpen(false);
  };

  const getCurrentStepIds = () => steps.map((step) => step.step_id);

  return (
    <div className="domain-step-integration-panel">
      <div className="flex items-center gap-4 mb-2">
        <button
          className={`tab-btn ${activeTab === "manage" ? "font-bold underline" : ""}`}
          onClick={() => setActiveTab("manage")}
        >
          Manage Steps
        </button>
        <button
          className={`tab-btn ${activeTab === "add" ? "font-bold underline" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          Add New Steps
        </button>
      </div>
      <div>
        {activeTab === "manage" && (
          <DomainStepManager domainId={domainId} companyId={companyId} />
        )}
        {activeTab === "add" && (
          <>
            <button
              className="open-selector-btn px-3 py-1 bg-blue-600 text-white rounded text-xs mb-2"
              onClick={() => setIsStepSelectorOpen(true)}
            >
              Browse All Steps
            </button>
            {isStepSelectorOpen && (
              <div className="modal-overlay fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="step-selector-modal bg-white rounded shadow-lg p-4 w-full max-w-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Select Steps to Add</h3>
                    <button
                      onClick={() => setIsStepSelectorOpen(false)}
                      className="text-gray-500 hover:text-gray-700 text-lg"
                    >
                      &times;
                    </button>
                  </div>
                  <StepSelector
                    onStepSelect={handleStepSelect}
                    excludeStepIds={getCurrentStepIds()}
                    domainId={domainId}
                    companyId={companyId}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DomainStepIntegrationPanel;
