import React, { useState, useEffect } from 'react';
import { 
  Coins,
  Brain,
  AlertCircle,
  RotateCw,
  Check,
  Plus
} from 'lucide-react';
import { useIdeaContext } from '../../lib/contexts/IdeaContext';
import { ideaGenerationService, BusinessSuggestions } from '../../lib/services/idea-generation.service';
import { useAuthStore } from '../../lib/store';
import { ideaMemoryService } from '../../lib/services/idea-memory.service';

const BusinessModelGenerator: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    ideaData, 
    setIdeaData, 
    error, 
    setError,
    isLoading,
    setIsLoading
  } = useIdeaContext();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<BusinessSuggestions | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, string[]>>({
    target_audience: [],
    sales_channels: [],
    pricing_model: [],
    customer_type: [],
    integration_needs: []
  });

  // Initialize selected suggestions from context if available
  useEffect(() => {
    if (ideaData.selected_suggestions) {
      setSelectedSuggestions(ideaData.selected_suggestions);
    }
    
    // If we already have business suggestions in the context, use them
    if (ideaData.business_suggestions) {
      setSuggestions(ideaData.business_suggestions);
    } else {
      // Otherwise, generate them automatically
      handleGenerateSuggestions();
    }
  }, [ideaData.selected_suggestions, ideaData.business_suggestions]);

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Check if enhanced idea generation is enabled
      const isEnhanced = await ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', user?.id);
      
      if (isEnhanced) {
        // Use the new ideaGenerationService
        const context = {
          userId: user?.id || '',
          companyId: undefined,
          useExistingModels: true
        };
        
        const idea = {
          title: ideaData.title,
          description: ideaData.description,
          problem_statement: ideaData.problem_statement,
          solution_concept: ideaData.solution_concept
        };
        
        const businessSuggestions = await ideaGenerationService.generateBusinessModel(idea, context);
        setSuggestions(businessSuggestions);
        
        // Save the suggestions to the context
        setIdeaData(prev => ({
          ...prev,
          business_suggestions: businessSuggestions
        }));
      } else {
        // Fallback to mock data
        const mockSuggestions: BusinessSuggestions = {
          target_audience: [
            "Small Business Owners",
            "Startup Founders", 
            "Enterprise Companies",
            "Digital Agencies",
            "E-commerce Businesses"
          ],
          sales_channels: [
            "Direct Sales",
            "Online Platform",
            "Partner Network",
            "Resellers",
            "Marketplaces"
          ],
          pricing_model: [
            "Subscription",
            "Usage-based",
            "Freemium",
            "Enterprise",
            "Marketplace Fee"
          ],
          customer_type: [
            "B2B",
            "Enterprise",
            "SMB",
            "Startups",
            "Agencies"
          ],
          integration_needs: [
            "CRM Systems",
            "Payment Processors",
            "Communication Tools",
            "Analytics Platforms",
            "Project Management"
          ]
        };
        
        setSuggestions(mockSuggestions);
        
        // Save the suggestions to the context
        setIdeaData(prev => ({
          ...prev,
          business_suggestions: mockSuggestions
        }));
      }
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSuggestion = (category: string, item: string) => {
    const updatedSelections = { ...selectedSuggestions };
    const current = updatedSelections[category] || [];
    
    if (current.includes(item)) {
      updatedSelections[category] = current.filter(i => i !== item);
    } else {
      updatedSelections[category] = [...current, item];
    }
    
    setSelectedSuggestions(updatedSelections);
    
    // Update the context with the selected suggestions
    setIdeaData(prev => ({
      ...prev,
      selected_suggestions: updatedSelections
    }));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleGenerateSuggestions}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Regenerate Suggestions
            </>
          )}
        </button>
      </div>

      {suggestions && (
        <div className="space-y-8">
          {/* Target Audience */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Target Audience Segments</h4>
            <div className="space-y-2">
              {suggestions.target_audience.map((segment, index) => (
                <button
                  key={index}
                  onClick={() => toggleSuggestion('target_audience', segment)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mr-2 ${
                    selectedSuggestions.target_audience.includes(segment)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedSuggestions.target_audience.includes(segment) ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {segment}
                </button>
              ))}
            </div>
          </div>

          {/* Sales Channels */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Sales Channels</h4>
            <div className="space-y-2">
              {suggestions.sales_channels.map((channel, index) => (
                <button
                  key={index}
                  onClick={() => toggleSuggestion('sales_channels', channel)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mr-2 ${
                    selectedSuggestions.sales_channels.includes(channel)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedSuggestions.sales_channels.includes(channel) ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {channel}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Models */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Pricing Models</h4>
            <div className="space-y-2">
              {suggestions.pricing_model.map((model, index) => (
                <button
                  key={index}
                  onClick={() => toggleSuggestion('pricing_model', model)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mr-2 ${
                    selectedSuggestions.pricing_model.includes(model)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedSuggestions.pricing_model.includes(model) ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Customer Types</h4>
            <div className="space-y-2">
              {suggestions.customer_type.map((type, index) => (
                <button
                  key={index}
                  onClick={() => toggleSuggestion('customer_type', type)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mr-2 ${
                    selectedSuggestions.customer_type.includes(type)
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedSuggestions.customer_type.includes(type) ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Integration Needs */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Integration Requirements</h4>
            <div className="space-y-2">
              {suggestions.integration_needs.map((need, index) => (
                <button
                  key={index}
                  onClick={() => toggleSuggestion('integration_needs', need)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mr-2 ${
                    selectedSuggestions.integration_needs.includes(need)
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedSuggestions.integration_needs.includes(need) ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {need}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessModelGenerator;
