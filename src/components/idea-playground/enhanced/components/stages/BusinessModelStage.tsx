import React, { useState } from 'react';
import { useIdeaPlayground } from '../../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea } from '../../../../../lib/types/idea-playground.types';
import { AIServiceContext } from '../../services/ai-service.interface';

interface BusinessModelStageProps {
  onSave?: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
}

const BusinessModelStage: React.FC<BusinessModelStageProps> = ({ onSave }) => {
  const { state, goToNextStage, goToPreviousStage, completeCurrentStage, aiService } = useIdeaPlayground();
  const { idea } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Business model data
  const [businessModelData, setBusinessModelData] = useState({
    revenueStreams: [] as string[],
    costStructure: [] as string[],
    keyResources: [] as string[],
    keyActivities: [] as string[],
    keyPartners: [] as string[],
    channels: [] as string[],
    customerRelationships: [] as string[],
    pricingStrategy: '',
    unitEconomics: {
      cac: 0,
      ltv: 0,
      margin: 0,
      paybackPeriod: 0,
    },
  });
  
  // New item inputs
  const [newRevenueStream, setNewRevenueStream] = useState('');
  const [newCostItem, setNewCostItem] = useState('');
  const [newResource, setNewResource] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newPartner, setNewPartner] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessModelData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle unit economics changes
  const handleUnitEconomicsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setBusinessModelData(prev => ({
      ...prev,
      unitEconomics: {
        ...prev.unitEconomics,
        [name]: numValue
      }
    }));
  };
  
  // Add new revenue stream
  const handleAddRevenueStream = () => {
    if (!newRevenueStream.trim()) return;
    setBusinessModelData(prev => ({
      ...prev,
      revenueStreams: [...prev.revenueStreams, newRevenueStream.trim()]
    }));
    setNewRevenueStream('');
  };
  
  // Remove revenue stream
  const handleRemoveRevenueStream = (index: number) => {
    setBusinessModelData(prev => ({
      ...prev,
      revenueStreams: prev.revenueStreams.filter((_, i) => i !== index)
    }));
  };
  
  // Add new cost item
  const handleAddCostItem = () => {
    if (!newCostItem.trim()) return;
    setBusinessModelData(prev => ({
      ...prev,
      costStructure: [...prev.costStructure, newCostItem.trim()]
    }));
    setNewCostItem('');
  };
  
  // Remove cost item
  const handleRemoveCostItem = (index: number) => {
    setBusinessModelData(prev => ({
      ...prev,
      costStructure: prev.costStructure.filter((_, i) => i !== index)
    }));
  };
  
  // Add new resource
  const handleAddResource = () => {
    if (!newResource.trim()) return;
    setBusinessModelData(prev => ({
      ...prev,
      keyResources: [...prev.keyResources, newResource.trim()]
    }));
    setNewResource('');
  };
  
  // Remove resource
  const handleRemoveResource = (index: number) => {
    setBusinessModelData(prev => ({
      ...prev,
      keyResources: prev.keyResources.filter((_, i) => i !== index)
    }));
  };
  
  // Add new activity
  const handleAddActivity = () => {
    if (!newActivity.trim()) return;
    setBusinessModelData(prev => ({
      ...prev,
      keyActivities: [...prev.keyActivities, newActivity.trim()]
    }));
    setNewActivity('');
  };
  
  // Remove activity
  const handleRemoveActivity = (index: number) => {
    setBusinessModelData(prev => ({
      ...prev,
      keyActivities: prev.keyActivities.filter((_, i) => i !== index)
    }));
  };
  
  // Add new partner
  const handleAddPartner = () => {
    if (!newPartner.trim()) return;
    setBusinessModelData(prev => ({
      ...prev,
      keyPartners: [...prev.keyPartners, newPartner.trim()]
    }));
    setNewPartner('');
  };
  
  // Remove partner
  const handleRemovePartner = (index: number) => {
    setBusinessModelData(prev => ({
      ...prev,
      keyPartners: prev.keyPartners.filter((_, i) => i !== index)
    }));
  };
  
  // Add new channel
  const handleAddChannel = () => {
    if (!newChannel.trim()) return;
    setBusinessModelData(prev => ({
      ...prev,
      channels: [...prev.channels, newChannel.trim()]
    }));
    setNewChannel('');
  };
  
  // Remove channel
  const handleRemoveChannel = (index: number) => {
    setBusinessModelData(prev => ({
      ...prev,
      channels: prev.channels.filter((_, i) => i !== index)
    }));
  };
  
  // Add new relationship
  const handleAddRelationship = () => {
    if (!newRelationship.trim()) return;
    setBusinessModelData(prev => ({
      ...prev,
      customerRelationships: [...prev.customerRelationships, newRelationship.trim()]
    }));
    setNewRelationship('');
  };
  
  // Remove relationship
  const handleRemoveRelationship = (index: number) => {
    setBusinessModelData(prev => ({
      ...prev,
      customerRelationships: prev.customerRelationships.filter((_, i) => i !== index)
    }));
  };
  
  // Generate business model with AI
  const handleGenerateBusinessModel = async () => {
    if (!idea || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const aiContext: AIServiceContext = {
        userId: 'current-user',
        tier: 'standard',
      };
      
      // Create business model params
      const businessModelParams = {
        idea_id: idea.id,
        industry_focus: idea.title,
        revenue_preference: 'balanced',
        resource_constraints: [],
        target_segments: [idea.target_audience],
        value_proposition: idea.unique_value,
      };
      
      const result = await aiService.generateBusinessModel(idea, businessModelParams, aiContext);
      
      setBusinessModelData({
        revenueStreams: result.revenue_streams || [],
        costStructure: result.cost_structure || [],
        keyResources: result.key_resources || [],
        keyActivities: result.key_activities || [],
        keyPartners: result.key_partners || [],
        channels: result.channels || [],
        customerRelationships: result.customer_relationships || [],
        pricingStrategy: result.pricing_strategy || '',
        unitEconomics: {
          cac: result.unit_economics?.cac || 0,
          ltv: result.unit_economics?.ltv || 0,
          margin: result.unit_economics?.margin || 0,
          paybackPeriod: result.unit_economics?.payback_period || 0,
        },
      });
    } catch (error) {
      console.error('Error generating business model:', error);
      alert('Failed to generate business model. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || !idea) return;
    
    setIsLoading(true);
    try {
      // Save business model data
      await onSave({
        business_model: JSON.stringify(businessModelData),
        revenue_model: businessModelData.revenueStreams.join(', '),
      });
      
      // Complete this stage
      await completeCurrentStage({
        completed_at: new Date().toISOString(),
        business_model_data: businessModelData,
      });
      
      // Go to next stage
      goToNextStage();
    } catch (error) {
      console.error('Error saving business model:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // List item component with delete button
  const ListItem = ({ 
    item, 
    onRemove 
  }: { 
    item: string, 
    onRemove: () => void 
  }) => (
    <li className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2">
      <span>{item}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700"
      >
        <span className="material-icons">delete</span>
      </button>
    </li>
  );
  
  // Add item input component
  const AddItemInput = ({ 
    value, 
    onChange, 
    onAdd, 
    placeholder 
  }: { 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onAdd: () => void, 
    placeholder: string 
  }) => (
    <div className="flex mb-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!value.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Business Model Development</h1>
      
      <p className="text-gray-600 mb-6">
        Define your business model by identifying revenue streams, cost structure, key resources,
        and other essential elements that will drive your business forward.
      </p>
      
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleGenerateBusinessModel}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <span className="material-icons animate-spin mr-2">refresh</span>
              Generating...
            </>
          ) : (
            <>
              <span className="material-icons mr-2">auto_awesome</span>
              Generate Business Model with AI
            </>
          )}
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Revenue Streams */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Revenue Streams</h2>
            <p className="text-gray-600 mb-4">
              How will your business generate income? List all potential revenue sources.
            </p>
            
            <AddItemInput
              value={newRevenueStream}
              onChange={(e) => setNewRevenueStream(e.target.value)}
              onAdd={handleAddRevenueStream}
              placeholder="Add a revenue stream"
            />
            
            {businessModelData.revenueStreams.length > 0 ? (
              <ul className="space-y-2">
                {businessModelData.revenueStreams.map((stream, index) => (
                  <ListItem
                    key={index}
                    item={stream}
                    onRemove={() => handleRemoveRevenueStream(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No revenue streams added yet.</p>
            )}
          </div>
          
          {/* Cost Structure */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Cost Structure</h2>
            <p className="text-gray-600 mb-4">
              What are the main costs your business will incur?
            </p>
            
            <AddItemInput
              value={newCostItem}
              onChange={(e) => setNewCostItem(e.target.value)}
              onAdd={handleAddCostItem}
              placeholder="Add a cost item"
            />
            
            {businessModelData.costStructure.length > 0 ? (
              <ul className="space-y-2">
                {businessModelData.costStructure.map((cost, index) => (
                  <ListItem
                    key={index}
                    item={cost}
                    onRemove={() => handleRemoveCostItem(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No cost items added yet.</p>
            )}
          </div>
          
          {/* Key Resources */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Key Resources</h2>
            <p className="text-gray-600 mb-4">
              What resources are essential to create value for your customers?
            </p>
            
            <AddItemInput
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              onAdd={handleAddResource}
              placeholder="Add a key resource"
            />
            
            {businessModelData.keyResources.length > 0 ? (
              <ul className="space-y-2">
                {businessModelData.keyResources.map((resource, index) => (
                  <ListItem
                    key={index}
                    item={resource}
                    onRemove={() => handleRemoveResource(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No key resources added yet.</p>
            )}
          </div>
          
          {/* Key Activities */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Key Activities</h2>
            <p className="text-gray-600 mb-4">
              What activities must your business perform to deliver its value proposition?
            </p>
            
            <AddItemInput
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onAdd={handleAddActivity}
              placeholder="Add a key activity"
            />
            
            {businessModelData.keyActivities.length > 0 ? (
              <ul className="space-y-2">
                {businessModelData.keyActivities.map((activity, index) => (
                  <ListItem
                    key={index}
                    item={activity}
                    onRemove={() => handleRemoveActivity(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No key activities added yet.</p>
            )}
          </div>
          
          {/* Additional Business Model Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Partners */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Key Partners</h2>
              
              <AddItemInput
                value={newPartner}
                onChange={(e) => setNewPartner(e.target.value)}
                onAdd={handleAddPartner}
                placeholder="Add a key partner"
              />
              
              {businessModelData.keyPartners.length > 0 ? (
                <ul className="space-y-2">
                  {businessModelData.keyPartners.map((partner, index) => (
                    <ListItem
                      key={index}
                      item={partner}
                      onRemove={() => handleRemovePartner(index)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No key partners added yet.</p>
              )}
            </div>
            
            {/* Channels */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Channels</h2>
              
              <AddItemInput
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                onAdd={handleAddChannel}
                placeholder="Add a channel"
              />
              
              {businessModelData.channels.length > 0 ? (
                <ul className="space-y-2">
                  {businessModelData.channels.map((channel, index) => (
                    <ListItem
                      key={index}
                      item={channel}
                      onRemove={() => handleRemoveChannel(index)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No channels added yet.</p>
              )}
            </div>
            
            {/* Customer Relationships */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Customer Relationships</h2>
              
              <AddItemInput
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
                onAdd={handleAddRelationship}
                placeholder="Add a customer relationship"
              />
              
              {businessModelData.customerRelationships.length > 0 ? (
                <ul className="space-y-2">
                  {businessModelData.customerRelationships.map((relationship, index) => (
                    <ListItem
                      key={index}
                      item={relationship}
                      onRemove={() => handleRemoveRelationship(index)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No customer relationships added yet.</p>
              )}
            </div>
            
            {/* Pricing Strategy */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Pricing Strategy</h2>
              
              <textarea
                id="pricingStrategy"
                name="pricingStrategy"
                value={businessModelData.pricingStrategy}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your pricing strategy"
              />
            </div>
          </div>
          
          {/* Unit Economics */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Unit Economics</h2>
            <p className="text-gray-600 mb-4">
              Define the key financial metrics for your business model.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="cac">
                  Customer Acquisition Cost (CAC)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input
                    type="number"
                    id="cac"
                    name="cac"
                    value={businessModelData.unitEconomics.cac || ''}
                    onChange={handleUnitEconomicsChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="ltv">
                  Lifetime Value (LTV)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input
                    type="number"
                    id="ltv"
                    name="ltv"
                    value={businessModelData.unitEconomics.ltv || ''}
                    onChange={handleUnitEconomicsChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="margin">
                  Profit Margin
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">%</span>
                  <input
                    type="number"
                    id="margin"
                    name="margin"
                    value={businessModelData.unitEconomics.margin || ''}
                    onChange={handleUnitEconomicsChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="paybackPeriod">
                  Payback Period (months)
                </label>
                <input
                  type="number"
                  id="paybackPeriod"
                  name="paybackPeriod"
                  value={businessModelData.unitEconomics.paybackPeriod || ''}
                  onChange={handleUnitEconomicsChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
                />
              </div>
            </div>
            
            {/* LTV:CAC Ratio */}
            {businessModelData.unitEconomics.cac > 0 && businessModelData.unitEconomics.ltv > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800">LTV:CAC Ratio</h3>
                <p className="text-blue-700">
                  {(businessModelData.unitEconomics.ltv / businessModelData.unitEconomics.cac).toFixed(2)}
                  <span className="text-sm ml-2 text-blue-600">
                    (A ratio of 3:1 or higher is generally considered good)
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStage}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md flex items-center"
          >
            <span className="material-icons mr-2">arrow_back</span>
            Back
          </button>
          
          <button
            type="submit"
            disabled={isLoading || businessModelData.revenueStreams.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">arrow_forward</span>
                Continue to Go-to-Market
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessModelStage;
