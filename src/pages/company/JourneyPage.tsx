import React from 'react';
import JourneyHomePage from '../../components/company/journey/pages/JourneyHomePage';
import { useCompany } from "@/lib/hooks/useCompany";

const JourneyPage: React.FC = () => {
  const { currentCompany } = useCompany();
  let companyId = currentCompany?.id;
  if (!companyId) {
    companyId = localStorage.getItem("companyId") || "";
  }
  // Patch: If companyId is still not set, but localStorage has a value, force a reload to re-mount with the correct prop
  if (!companyId && localStorage.getItem("companyId")) {
    // Try to force a hard reload with cache clear
    localStorage.setItem("forceJourneyCompanyId", localStorage.getItem("companyId") || "");
    window.location.href = window.location.href;
    return null;
  }
  if (!companyId) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Company Journey</h1>
        <p className="mb-4">Company ID is not set. Please visit the <a href="/company/dashboard" className="text-blue-600 underline">Company Dashboard</a> first to initialize your company context, then return to the journey page.</p>
      </div>
    );
  }
  return <JourneyHomePage companyId={companyId} />;
};

export default JourneyPage;
