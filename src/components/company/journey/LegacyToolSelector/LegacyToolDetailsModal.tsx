import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface ToolDetailsModalProps {
  open: boolean;
  onClose: () => void;
  toolId: string | null;
}

interface ToolDetails {
  id: string;
  name: string;
  description: string;
  url: string;
  logo_url?: string;
  type?: string;
  category?: string;
  ranking: number;
  is_premium?: boolean;
  pros?: string;
  cons?: string;
  customer_stage?: string;
  founded?: string;
  last_funding_round?: string;
  comp_svc_pkg?: number;
  ease_of_use?: number;
  affordability?: number;
  customer_support?: number;
  speed_of_setup?: number;
  customization?: number;
  range_of_services?: number;
  integration?: number;
  pro_assistance?: number;
  reputation?: number;
  reasoning_comp_svc_pkg?: string;
  reasoning_ease_of_use?: string;
  reasoning_affordability?: string;
  reasoning_customer_support?: string;
  reasoning_speed_of_setup?: string;
  reasoning_customization?: string;
  reasoning_range_of_services?: string;
  reasoning_integration?: string;
  reasoning_pro_assistance?: string;
  reasoning_reputation?: string;
  source?: string;
  status?: string;
  default_ranking?: number;
}

const ToolDetailsModal: React.FC<ToolDetailsModalProps> = ({ open, onClose, toolId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolDetails | null>(null);

  useEffect(() => {
    if (!open || !toolId) return;
    
    const fetchToolDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("journey_step_tools")
          .select("*")
          .eq("id", toolId)
          .single();
        
        if (error) throw error;
        
        setTool(data);
      } catch (err: any) {
        console.error("Error fetching tool details:", err);
        setError(err.message || "Failed to load tool details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchToolDetails();
  }, [open, toolId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error shadow-md">Error: {error}</div>
        ) : tool ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
              {tool.logo_url && (
                <img 
                  src={tool.logo_url} 
                  alt={tool.name} 
                  className="w-16 h-16 object-contain rounded-md"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{tool.name}</h2>
                <div className="flex items-center mt-1">
                  <div className="rating rating-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name="rating-readonly"
                        className="mask mask-star-2 bg-orange-400"
                        checked={Math.round(tool.ranking || 0) === star}
                        readOnly
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {tool.ranking ? tool.ranking.toFixed(1) : "No ratings"}
                  </span>
                  {tool.is_premium && (
                    <span className="ml-2 badge badge-premium">Premium</span>
                  )}
                </div>
                {tool.category && (
                  <div className="mt-1">
                    <span className="badge badge-outline">{tool.category}</span>
                    {tool.type && <span className="ml-2 badge badge-outline">{tool.type}</span>}
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-base-content/80">{tool.description}</p>
            </div>
            
            {/* Pros & Cons */}
            {(tool.pros || tool.cons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.pros && (
                  <div className="card bg-base-200 p-4">
                    <h3 className="text-lg font-semibold mb-2 text-success">Pros</h3>
                    <p className="text-base-content/80 whitespace-pre-line">{tool.pros}</p>
                  </div>
                )}
                {tool.cons && (
                  <div className="card bg-base-200 p-4">
                    <h3 className="text-lg font-semibold mb-2 text-error">Cons</h3>
                    <p className="text-base-content/80 whitespace-pre-line">{tool.cons}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Company Info */}
            {(tool.founded || tool.customer_stage || tool.last_funding_round) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tool.founded && (
                    <div>
                      <h4 className="font-medium">Founded</h4>
                      <p>{tool.founded}</p>
                    </div>
                  )}
                  {tool.customer_stage && (
                    <div>
                      <h4 className="font-medium">Customer Stage</h4>
                      <p>{tool.customer_stage}</p>
                    </div>
                  )}
                  {tool.last_funding_round && (
                    <div>
                      <h4 className="font-medium">Last Funding Round</h4>
                      <p>{tool.last_funding_round}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Ratings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {tool.ease_of_use !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Ease of Use</span>
                      <span>{tool.ease_of_use}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.ease_of_use} 
                      max="10"
                    ></progress>
                    {tool.reasoning_ease_of_use && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_ease_of_use}</p>
                    )}
                  </div>
                )}
                
                {tool.affordability !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Affordability</span>
                      <span>{tool.affordability}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.affordability} 
                      max="10"
                    ></progress>
                    {tool.reasoning_affordability && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_affordability}</p>
                    )}
                  </div>
                )}
                
                {tool.customer_support !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Customer Support</span>
                      <span>{tool.customer_support}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.customer_support} 
                      max="10"
                    ></progress>
                    {tool.reasoning_customer_support && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_customer_support}</p>
                    )}
                  </div>
                )}
                
                {tool.speed_of_setup !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Speed of Setup</span>
                      <span>{tool.speed_of_setup}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.speed_of_setup} 
                      max="10"
                    ></progress>
                    {tool.reasoning_speed_of_setup && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_speed_of_setup}</p>
                    )}
                  </div>
                )}
                
                {tool.customization !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Customization</span>
                      <span>{tool.customization}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.customization} 
                      max="10"
                    ></progress>
                    {tool.reasoning_customization && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_customization}</p>
                    )}
                  </div>
                )}
                
                {tool.range_of_services !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Range of Services</span>
                      <span>{tool.range_of_services}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.range_of_services} 
                      max="10"
                    ></progress>
                    {tool.reasoning_range_of_services && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_range_of_services}</p>
                    )}
                  </div>
                )}
                
                {tool.integration !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Integration</span>
                      <span>{tool.integration}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.integration} 
                      max="10"
                    ></progress>
                    {tool.reasoning_integration && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_integration}</p>
                    )}
                  </div>
                )}
                
                {tool.pro_assistance !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Professional Assistance</span>
                      <span>{tool.pro_assistance}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.pro_assistance} 
                      max="10"
                    ></progress>
                    {tool.reasoning_pro_assistance && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_pro_assistance}</p>
                    )}
                  </div>
                )}
                
                {tool.reputation !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Reputation</span>
                      <span>{tool.reputation}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.reputation} 
                      max="10"
                    ></progress>
                    {tool.reasoning_reputation && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_reputation}</p>
                    )}
                  </div>
                )}
                
                {tool.comp_svc_pkg !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Comprehensive Service Package</span>
                      <span>{tool.comp_svc_pkg}/10</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={tool.comp_svc_pkg} 
                      max="10"
                    ></progress>
                    {tool.reasoning_comp_svc_pkg && (
                      <p className="text-sm mt-1 text-base-content/70">{tool.reasoning_comp_svc_pkg}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Website Link */}
            <div className="mt-6">
              <a 
                href={tool.url.startsWith('http') ? tool.url : `https://${tool.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Visit Website
              </a>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">Tool not found</div>
        )}
      </div>
    </div>
  );
};

export default ToolDetailsModal;
