import React, { useEffect, useState } from "react";
import { BusinessDomain } from "../types/domain.types";
import { getGlobalBusinessDomains } from "../services/domain.service";

/**
 * DomainList.tsx
 * Admin component for listing and managing business domains.
 * Features: search, filter, sort, and quick actions (add/edit/delete).
 */

const DomainList: React.FC = () => {
  const [domains, setDomains] = useState<BusinessDomain[]>([]);
  const [search, setSearch] = useState("");
  const [filteredDomains, setFilteredDomains] = useState<BusinessDomain[]>([]);
  const [loading, setLoading] = useState(false);

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
                  {/* TODO: Implement edit/delete actions */}
                  <button className="text-blue-600 mr-2">Edit</button>
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
    </div>
  );
};

export default DomainList;
