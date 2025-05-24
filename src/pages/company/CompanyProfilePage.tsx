import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyService } from "../../lib/services/company.service";
import { useAuthStore } from "../../lib/store";
import { useLogger } from "../../lib/hooks/useLogger";
import { getServiceRegistry } from "../../lib/services/registry";
import { Building2, Globe, Users, DollarSign, Target, Brain, Mail, Link as LinkIcon, Award, Star, UserCircle, Briefcase, ChevronRight } from "lucide-react";
import type { Company } from "../../lib/types/idea-playground.types";
import CompanyProfileForm from "./CompanyProfileForm";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_LOGO = "https://ui-avatars.com/api/?name=Company&background=4f46e5&color=fff&size=128";

export default function CompanyProfilePage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Get logger from hook
  const logger = useLogger();
  
  // Get logging service from registry
  // We'll use the logger hook which already uses the logging service

  // Ownership transfer state
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [transferTo, setTransferTo] = useState<string>("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  const navigate = useNavigate();

  async function fetchCompany() {
    if (!companyId) {
      setError("No company ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Log page view and company load attempt
      logger.info(`Loading company profile`, { companyId, referrer: document.referrer });
      
      const data = await companyService.getCompany(companyId);
      if (!data) {
        logger.warn(`Company not found`, { companyId });
        setError("Company not found.");
      } else {
        setCompany({
          ...data,
          metadata: data.metadata ?? {},
        });
        logger.info(`Company profile loaded successfully`, { companyId, companyName: data.name });
      }
    } catch (e: any) {
      logger.error(`Error loading company profile`, e);
      setError(e.message || "Error loading company.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompany();
    // eslint-disable-next-line
  }, [companyId]);

  useEffect(() => {
    async function fetchRole() {
      if (user?.id && companyId) {
        const role = await companyService.getUserRole(user.id, companyId);
        setUserRole(role);
      }
    }
    fetchRole();
  }, [user?.id, companyId]);

  // Fetch company members for ownership transfer
  useEffect(() => {
    async function fetchMembers() {
      if (company?.id) {
        const { data, error } = await companyService.getCompanyMembers(company.id);
        if (!error && data) setMembers(data);
      }
    }
    if (showTransferDialog && company?.id) {
      fetchMembers();
    }
  }, [showTransferDialog, company?.id]);

  const handleEdit = () => {
    setEditMode(true);
    setSaveError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setSaveError("");
  };

  const handleSave = async (updated: Partial<Company> & { metadata?: Record<string, any> }) => {
    setSaveLoading(true);
    setSaveError("");
    try {
      await companyService.updateCompany(companyId!, updated);
      await fetchCompany();
      setEditMode(false);
    } catch (e: any) {
      setSaveError(e.message || "Failed to save changes.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading company profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-red-600">{error}</span>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  // Mock data for demo enhancements
  const bannerUrl = company.metadata?.banner_url || DEFAULT_BANNER;
  const logoUrl = company.metadata?.logo_url || DEFAULT_LOGO;
  const team = company.metadata?.team || [
    { name: "Jane Doe", title: "CEO", avatar: "https://ui-avatars.com/api/?name=Jane+Doe&background=6366f1&color=fff" },
    { name: "John Smith", title: "CTO", avatar: "https://ui-avatars.com/api/?name=John+Smith&background=6366f1&color=fff" }
  ];
  const products = company.metadata?.products || [
    { name: "Product Alpha", description: "AI-powered analytics platform." },
    { name: "Product Beta", description: "Collaboration suite for remote teams." }
  ];
  const testimonials = company.metadata?.testimonials || [
    { quote: "This company transformed our business!", author: "Acme Corp" },
    { quote: "Innovative solutions and great support.", author: "Beta Inc." }
  ];
  const partners = company.metadata?.partners || [
    { name: "Acme Corp", logo: "https://ui-avatars.com/api/?name=Acme+Corp&background=4f46e5&color=fff" },
    { name: "Beta Inc.", logo: "https://ui-avatars.com/api/?name=Beta+Inc.&background=4f46e5&color=fff" }
  ];
  const awards = company.metadata?.awards || [
    { name: "Best Startup 2024", icon: <Award className="inline h-4 w-4 text-yellow-500 mr-1" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-0 px-0 sm:px-0 lg:px-0">
      {/* Banner */}
      <div className="relative w-full h-48 sm:h-64 bg-gray-200">
        <img src={bannerUrl} alt="Company Banner" className="object-cover w-full h-full" />
        {/* Logo */}
        <div className="absolute left-8 bottom-[-40px] sm:bottom-[-48px] bg-white rounded-full shadow-lg p-2 border-4 border-white">
          <img src={logoUrl} alt="Company Logo" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8 pt-16 mt-[-40px] sm:mt-[-48px]">
        {/* Company Name & Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{company.name}</h2>
            <div className="text-indigo-600 text-lg font-medium mt-1">{company.metadata?.tagline || "Innovating the Future"}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {company.industry && (
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {company.industry}
                </span>
              )}
              {company.metadata?.location && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  <Globe className="inline h-4 w-4 mr-1" />{company.metadata.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 mt-4 sm:mt-0">
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-indigo-600 hover:underline text-sm"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              {company.website || "Website"}
            </a>
            <button
              className="mt-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold shadow"
              onClick={() => window.open(`mailto:${company.metadata?.contact_email || "info@company.com"}`)}
            >
              <Mail className="inline h-4 w-4 mr-1" /> Connect
            </button>
          </div>
        </div>

        {/* Awards & Partners */}
        <div className="flex flex-wrap gap-4 mb-6">
          {awards.map((award: { name: string; icon: React.ReactNode }, i: number) => (
            <span key={i} className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              {award.icon}{award.name}
            </span>
          ))}
          {partners.map((partner: { name: string; logo: string }, i: number) => (
            <span key={i} className="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium ml-2">
              <img src={partner.logo} alt={partner.name} className="h-5 w-5 rounded-full mr-1" />
              {partner.name}
            </span>
          ))}
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-indigo-50 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-indigo-700 mb-1">Mission</h4>
            <p className="text-gray-700 text-sm">{company.metadata?.mission || "Our mission is to empower innovation."}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-blue-700 mb-1">Vision</h4>
            <p className="text-gray-700 text-sm">{company.metadata?.vision || "To be the leading force in our industry."}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-green-700 mb-1">Values</h4>
            <ul className="list-disc ml-5 text-gray-700 text-sm">
              {(company.metadata?.values || ["Innovation", "Integrity", "Collaboration"]).map((v: string, i: number) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Products/Services */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Products & Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product: { name: string; description: string }, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div className="font-semibold text-indigo-700">{product.name}</div>
                <div className="text-gray-700 text-sm">{product.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Leadership Team</h3>
          <div className="flex flex-wrap gap-6">
            {team.map((member: { name: string; title: string; avatar: string }, i: number) => (
              <div key={i} className="flex flex-col items-center bg-white rounded-lg shadow p-4 w-32">
                <img src={member.avatar} alt={member.name} className="h-16 w-16 rounded-full object-cover mb-2" />
                <div className="font-semibold text-gray-800 text-sm">{member.name}</div>
                <div className="text-gray-500 text-xs">{member.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Testimonials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testimonials.map((t: { quote: string; author: string }, i: number) => (
              <div key={i} className="bg-indigo-50 rounded-lg p-4 shadow-sm">
                <div className="italic text-gray-700 mb-2">"{t.quote}"</div>
                <div className="text-indigo-700 font-semibold text-sm">— {t.author}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">About</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Description: </span>
                <span className="text-gray-700">{company.description || "N/A"}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Business Model: </span>
                <span className="text-gray-700">{company.metadata?.business_model || "N/A"}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Revenue Model: </span>
                <span className="text-gray-700">{company.metadata?.revenue_model || "N/A"}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Target Market: </span>
                <span className="text-gray-700">{company.metadata?.target_market || "N/A"}</span>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Team Size: </span>
                <span className="text-gray-700">{company.metadata?.team_size || "N/A"}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Profile Visibility: </span>
                <span className="text-gray-700">{company.metadata?.is_public ? "Public" : "Private"}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Social Links: </span>
                <div className="flex gap-2 mt-1">
                  {company.metadata?.social_links?.linkedin && (
                    <a href={company.metadata.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                      LinkedIn
                    </a>
                  )}
                  {company.metadata?.social_links?.twitter && (
                    <a href={company.metadata.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Twitter
                    </a>
                  )}
                  {company.metadata?.social_links?.github && (
                    <a href={company.metadata.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">
                      GitHub
                    </a>
                  )}
                  {!company.metadata?.social_links?.linkedin &&
                    !company.metadata?.social_links?.twitter &&
                    !company.metadata?.social_links?.github && (
                      <span className="text-gray-400">N/A</span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-lg font-semibold shadow"
            onClick={() => window.open(`mailto:${company.metadata?.contact_email || "info@company.com"}`)}
          >
            <Mail className="inline h-5 w-5 mr-2" /> Contact {company.name}
          </button>
        </div>

        {/* Admin Actions */}
        {!editMode && (userRole === "owner" || userRole === "admin") && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Edit Profile
            </button>
            {userRole === "owner" && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTransferDialog(true)}
                  className="px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Transfer Ownership
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(true);
                    setDeleteInput("");
                    setDeleteError("");
                    setDeleteSuccess(false);
                  }}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Company
                </button>
              </div>
            )}
          </div>
        )}

        {editMode && (
          <CompanyProfileForm
            company={company}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={saveLoading}
            error={saveError}
          />
        )}
      </div>
      {/* Transfer Ownership Dialog */}
      {showTransferDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            {transferSuccess ? (
              <div>
                <h3 className="text-lg font-bold text-green-700 mb-4">Ownership Transferred</h3>
                <p className="mb-4">Company ownership has been transferred. You are now an admin.</p>
                <button
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => {
                    setShowTransferDialog(false);
                    window.location.reload();
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-yellow-700 mb-4">Transfer Company Ownership</h3>
                <p className="mb-2">
                  Select a member to transfer ownership of <span className="font-semibold">{company.name}</span> to. You will become an admin after transfer.
                </p>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  value={transferTo}
                  onChange={e => setTransferTo(e.target.value)}
                  disabled={transferLoading}
                >
                  <option value="">Select member</option>
                  {members
                    .filter(m => m.role !== "owner")
                    .map(m => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.user_email || m.user_id} ({m.role})
                      </option>
                    ))}
                </select>
                {transferError && (
                  <div className="text-red-600 text-sm mb-2">{transferError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => setShowTransferDialog(false)}
                    disabled={transferLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
                    disabled={!transferTo || transferLoading}
                    onClick={async () => {
                      setTransferLoading(true);
                      setTransferError("");
                      try {
                        await companyService.transferOwnership(company.id, transferTo, user?.id!);
                        setTransferSuccess(true);
                      } catch (e: any) {
                        setTransferError(e.message || "Failed to transfer ownership.");
                      } finally {
                        setTransferLoading(false);
                      }
                    }}
                  >
                    {transferLoading ? "Transferring..." : "Transfer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Delete Company Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            {deleteSuccess ? (
              <div>
                <h3 className="text-lg font-bold text-green-700 mb-4">Company Deleted</h3>
                <p className="mb-4">The company has been deleted. You will be redirected to the dashboard.</p>
                <button
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    navigate("/dashboard");
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-red-700 mb-4">Delete Company</h3>
                <p className="mb-2">
                  This action will permanently delete <span className="font-semibold">{company.name}</span> and all associated data. This cannot be undone.
                </p>
                <p className="mb-4">
                  To confirm, type the company name <span className="font-semibold">{company.name}</span> below:
                </p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type company name to confirm"
                  disabled={deleteLoading}
                />
                {deleteError && (
                  <div className="text-red-600 text-sm mb-2">{deleteError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    disabled={deleteInput !== company.name || deleteLoading}
                    onClick={async () => {
                      setDeleteLoading(true);
                      setDeleteError("");
                      try {
                        // Call backend to delete company
                        await companyService.deleteCompany(company.id);
                        setDeleteSuccess(true);
                        setTimeout(() => {
                          setShowDeleteDialog(false);
                          navigate("/dashboard");
                        }, 2000);
                      } catch (e: any) {
                        setDeleteError(e.message || "Failed to delete company.");
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
