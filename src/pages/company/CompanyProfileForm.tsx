import React, { useState } from "react";
import type { Company } from "../../lib/types/idea-playground.types";

interface CompanyProfileFormProps {
  company: Company;
  onSave: (updated: Partial<Company> & { metadata?: Record<string, any> }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export default function CompanyProfileForm({
  company,
  onSave,
  onCancel,
  loading = false,
  error = "",
}: CompanyProfileFormProps) {
  const [form, setForm] = useState({
    name: company.name || "",
    description: company.description || "",
    website: company.website || "",
    industry: company.industry || "",
    // Metadata fields
    mission: company.metadata?.mission || "",
    business_model: company.metadata?.business_model || "",
    revenue_model: company.metadata?.revenue_model || "",
    team_size: company.metadata?.team_size || "",
    target_market: company.metadata?.target_market || "",
    is_public: company.metadata?.is_public || false,
    social_links: company.metadata?.social_links || { linkedin: "", twitter: "", github: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith("social_links.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        social_links: { ...prev.social_links, [key]: value },
      }));
    } else if (type === "checkbox") {
      // Type guard for HTMLInputElement to access checked
      if ("checked" in e.target) {
        setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name: form.name,
      description: form.description,
      website: form.website,
      industry: form.industry,
      metadata: {
        ...company.metadata,
        mission: form.mission,
        business_model: form.business_model,
        revenue_model: form.revenue_model,
        team_size: form.team_size,
        target_market: form.target_market,
        is_public: form.is_public,
        social_links: form.social_links,
      },
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Website</label>
        <input
          type="url"
          name="website"
          value={form.website}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Industry</label>
        <input
          type="text"
          name="industry"
          value={form.industry}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mission</label>
        <input
          type="text"
          name="mission"
          value={form.mission}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Business Model</label>
        <input
          type="text"
          name="business_model"
          value={form.business_model}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Revenue Model</label>
        <input
          type="text"
          name="revenue_model"
          value={form.revenue_model}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Team Size</label>
        <input
          type="text"
          name="team_size"
          value={form.team_size}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Target Market</label>
        <input
          type="text"
          name="target_market"
          value={form.target_market}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Profile Visibility</label>
        <input
          type="checkbox"
          name="is_public"
          checked={form.is_public}
          onChange={handleChange}
          className="mr-2"
        />
        <span>{form.is_public ? "Public" : "Private"}</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Social Links</label>
        <div className="flex flex-col gap-2">
          <input
            type="url"
            name="social_links.linkedin"
            value={form.social_links.linkedin || ""}
            onChange={handleChange}
            placeholder="LinkedIn URL"
            className="mt-1 block w-full border rounded px-3 py-2"
          />
          <input
            type="url"
            name="social_links.twitter"
            value={form.social_links.twitter || ""}
            onChange={handleChange}
            placeholder="Twitter URL"
            className="mt-1 block w-full border rounded px-3 py-2"
          />
          <input
            type="url"
            name="social_links.github"
            value={form.social_links.github || ""}
            onChange={handleChange}
            placeholder="GitHub URL"
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
