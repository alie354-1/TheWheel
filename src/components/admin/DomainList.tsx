import React, { useEffect, useState } from "react";
import { BusinessDomain } from "../../business-ops-hub/types/domain.types";
import { getGlobalBusinessDomains } from "../../business-ops-hub/services/domain.service";
import DomainDetail from "./DomainDetail";

/**
 * DomainList.tsx
 * Admin component for listing and managing business domains.
 * Features: search, filter, sort, and quick actions (add/edit/delete).
 */

const SYSTEM_COMPANY_ID = null; // Use null for global/system domains

const DomainList: React.FC = () => {
  const [domains, setDomains] = useState<BusinessDomain[]>([]);
  const [search, setSearch] = useState("");
  const [filteredDomains, setFilteredDomains] = useState<BusinessDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getGlobalBusinessDomains()
      .then((data) => setDomains(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = domains;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = domains.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          (d.description && d.description.toLowerCase().includes(s))
      );
    }
    setFilteredDomains(filtered);
  }, [search, domains]);

  const handleDomainUpdated = () => {
    // Refresh domain list after update
    setLoading(true);
    getGlobalBusinessDomains()
      .then((data) => setDomains(data))
      .finally(() => setLoading(false));
  };

  const handleDomainDeleted = () => {
    setSelectedDomainId(null);
    handleDomainUpdated();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Business Domains</h2>
      <div className="flex mb-4 gap-2">
        <input
          type="text"
          placeholder="Search domains..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-64"
        />
        {/* TODO: Add filter/sort dropdowns */}
        <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded">
          + Add Domain
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDomains.map((domain) => (
              <tr key={domain.id} className="border-t">
                <td className="p-2">{domain.name}</td>
                <td className="p-2">{domain.description}</td>
                <td className="p-2">{domain.order_index}</td>
                <td className="p-2">
                  <button
                    className="text-blue-600 mr-2"
                    onClick={() => setSelectedDomainId(domain.id)}
                  >
                    Edit
                  </button>
                  <button className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {filteredDomains.length === 0 && (
              <tr>
                <td colSpan={4} className="p-2 text-center text-gray-500">
                  No domains found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {selectedDomainId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg max-w-lg w-full">
            <DomainDetail
              domainId={selectedDomainId}
              companyId={SYSTEM_COMPANY_ID}
              onClose={() => setSelectedDomainId(null)}
              onDomainUpdated={handleDomainUpdated}
              onDomainDeleted={handleDomainDeleted}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainList;
