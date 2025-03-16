import React, { useState } from 'react';
import { useIdeaPlayground } from '../../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea } from '../../../../../lib/types/idea-playground.types';
import { AIServiceContext } from '../../services/ai-service.interface';

interface GoToMarketStageProps {
  onSave?: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
}

const GoToMarketStage: React.FC<GoToMarketStageProps> = ({ onSave }) => {
  const { state, goToNextStage, goToPreviousStage, completeCurrentStage, aiService } = useIdeaPlayground();
  const { idea } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Go-to-market data
  const [gtmData, setGtmData] = useState({
    launchStrategy: '',
    marketingChannels: [] as {
      channel: string;
      approach: string;
      expectedRoi: string;
      timeline: string;
    }[],
    salesStrategy: '',
    partnerships: [] as string[],
    milestones: [] as {
      name: string;
      description: string;
      timeline: string;
      successCriteria: string;
    }[],
    kpis: [] as string[],
    budgetAllocation: {} as Record<string, string>,
  });
  
  // New item inputs
  const [newPartnership, setNewPartnership] = useState('');
  const [newKpi, setNewKpi] = useState('');
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  
  // New marketing channel form
  const [newChannel, setNewChannel] = useState({
    channel: '',
    approach: '',
    expectedRoi: '',
    timeline: '',
  });
  
  // New milestone form
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    timeline: '',
    successCriteria: '',
  });
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGtmData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle marketing channel form changes
  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewChannel(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new marketing channel
  const handleAddChannel = () => {
    if (!newChannel.channel.trim() || !newChannel.approach.trim()) return;
    
    setGtmData(prev => ({
      ...prev,
      marketingChannels: [...prev.marketingChannels, { ...newChannel }]
    }));
    
    setNewChannel({
      channel: '',
      approach: '',
      expectedRoi: '',
      timeline: '',
    });
  };
  
  // Remove marketing channel
  const handleRemoveChannel = (index: number) => {
    setGtmData(prev => ({
      ...prev,
      marketingChannels: prev.marketingChannels.filter((_, i) => i !== index)
    }));
  };
  
  // Handle milestone form changes
  const handleMilestoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMilestone(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new milestone
  const handleAddMilestone = () => {
    if (!newMilestone.name.trim() || !newMilestone.timeline.trim()) return;
    
    setGtmData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { ...newMilestone }]
    }));
    
    setNewMilestone({
      name: '',
      description: '',
      timeline: '',
      successCriteria: '',
    });
  };
  
  // Remove milestone
  const handleRemoveMilestone = (index: number) => {
    setGtmData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };
  
  // Add new partnership
  const handleAddPartnership = () => {
    if (!newPartnership.trim()) return;
    
    setGtmData(prev => ({
      ...prev,
      partnerships: [...prev.partnerships, newPartnership.trim()]
    }));
    
    setNewPartnership('');
  };
  
  // Remove partnership
  const handleRemovePartnership = (index: number) => {
    setGtmData(prev => ({
      ...prev,
      partnerships: prev.partnerships.filter((_, i) => i !== index)
    }));
  };
  
  // Add new KPI
  const handleAddKpi = () => {
    if (!newKpi.trim()) return;
    
    setGtmData(prev => ({
      ...prev,
      kpis: [...prev.kpis, newKpi.trim()]
    }));
    
    setNewKpi('');
  };
  
  // Remove KPI
  const handleRemoveKpi = (index: number) => {
    setGtmData(prev => ({
      ...prev,
      kpis: prev.kpis.filter((_, i) => i !== index)
    }));
  };
  
  // Add new budget allocation
  const handleAddBudget = () => {
    if (!newBudgetCategory.trim() || !newBudgetAmount.trim()) return;
    
    setGtmData(prev => ({
      ...prev,
      budgetAllocation: {
        ...prev.budgetAllocation,
        [newBudgetCategory.trim()]: newBudgetAmount.trim()
      }
    }));
    
    setNewBudgetCategory('');
    setNewBudgetAmount('');
  };
  
  // Remove budget allocation
  const handleRemoveBudget = (category: string) => {
    const newBudget = { ...gtmData.budgetAllocation };
    delete newBudget[category];
    
    setGtmData(prev => ({
      ...prev,
      budgetAllocation: newBudget
    }));
  };
  
  // Generate go-to-market plan with AI
  const handleGenerateGtmPlan = async () => {
    if (!idea || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const aiContext: AIServiceContext = {
        userId: 'current-user',
        tier: 'standard',
      };
      
      // Create go-to-market params
      const gtmParams = {
        idea_id: idea.id,
        target_market: idea.target_audience,
        budget_constraint: 'moderate',
        timeline: '6 months',
        target_segments: [idea.target_audience],
        value_proposition: idea.unique_value,
        business_model: idea.business_model,
      };
      
      const result = await aiService.createGoToMarketPlan(idea, gtmParams, aiContext);
      
      // Map API response to our component state
      setGtmData({
        launchStrategy: result.launch_strategy || '',
        marketingChannels: (result.marketing_channels || []).map(channel => ({
          channel: channel.channel,
          approach: channel.approach,
          expectedRoi: channel.expected_roi || '',
          timeline: channel.timeline || '',
        })),
        salesStrategy: result.sales_strategy || '',
        partnerships: result.partnerships || [],
        milestones: (result.milestones || []).map(milestone => ({
          name: milestone.name,
          description: milestone.description || '',
          timeline: milestone.timeline || '',
          successCriteria: milestone.success_criteria || '',
        })),
        kpis: result.kpis || [],
        budgetAllocation: result.budget_allocation || {},
      });
    } catch (error) {
      console.error('Error generating go-to-market plan:', error);
      alert('Failed to generate go-to-market plan. Please try again.');
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
      // Save go-to-market data
      await onSave({
        go_to_market: JSON.stringify(gtmData),
        marketing_strategy: gtmData.marketingChannels.map(c => c.channel).join(', '),
      });
      
      // Complete this stage
      await completeCurrentStage({
        completed_at: new Date().toISOString(),
        gtm_data: gtmData,
      });
      
      // Go to next stage
      goToNextStage();
    } catch (error) {
      console.error('Error saving go-to-market plan:', error);
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
      <h1 className="text-2xl font-bold mb-6">Go-to-Market Planning</h1>
      
      <p className="text-gray-600 mb-6">
        Develop a comprehensive plan for launching your product or service to the market,
        including marketing channels, sales strategy, partnerships, and key milestones.
      </p>
      
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleGenerateGtmPlan}
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
              Generate Go-to-Market Plan with AI
            </>
          )}
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Launch Strategy */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Launch Strategy</h2>
            <p className="text-gray-600 mb-4">
              Describe your overall approach to launching your product or service.
            </p>
            
            <textarea
              id="launchStrategy"
              name="launchStrategy"
              value={gtmData.launchStrategy}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your launch strategy"
              required
            />
          </div>
          
          {/* Marketing Channels */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Marketing Channels</h2>
            <p className="text-gray-600 mb-4">
              Define the channels you'll use to reach your target audience.
            </p>
            
            <div className="bg-white p-4 rounded-md mb-4 border border-gray-200">
              <h3 className="font-medium mb-3">Add New Marketing Channel</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="channel">
                    Channel
                  </label>
                  <input
                    type="text"
                    id="channel"
                    name="channel"
                    value={newChannel.channel}
                    onChange={handleChannelChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Social Media, Content Marketing"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="approach">
                    Approach
                  </label>
                  <input
                    type="text"
                    id="approach"
                    name="approach"
                    value={newChannel.approach}
                    onChange={handleChannelChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Targeted ads on LinkedIn"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="expectedRoi">
                    Expected ROI
                  </label>
                  <input
                    type="text"
                    id="expectedRoi"
                    name="expectedRoi"
                    value={newChannel.expectedRoi}
                    onChange={handleChannelChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2x, High, Medium"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="timeline">
                    Timeline
                  </label>
                  <input
                    type="text"
                    id="timeline"
                    name="timeline"
                    value={newChannel.timeline}
                    onChange={handleChannelChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Month 1-3, Q1 2025"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddChannel}
                disabled={!newChannel.channel.trim() || !newChannel.approach.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Add Channel
              </button>
            </div>
            
            {gtmData.marketingChannels.length > 0 ? (
              <div className="space-y-3">
                {gtmData.marketingChannels.map((channel, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{channel.channel}</h4>
                        <span className="text-sm text-gray-500">{channel.timeline}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{channel.approach}</p>
                      {channel.expectedRoi && (
                        <p className="text-sm text-gray-600 mt-1">Expected ROI: {channel.expectedRoi}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChannel(index)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No marketing channels added yet.</p>
            )}
          </div>
          
          {/* Sales Strategy */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Sales Strategy</h2>
            <p className="text-gray-600 mb-4">
              Describe how you'll convert prospects into customers.
            </p>
            
            <textarea
              id="salesStrategy"
              name="salesStrategy"
              value={gtmData.salesStrategy}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your sales strategy"
              required
            />
          </div>
          
          {/* Partnerships */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Strategic Partnerships</h2>
            <p className="text-gray-600 mb-4">
              Identify key partnerships that will help you reach your market.
            </p>
            
            <AddItemInput
              value={newPartnership}
              onChange={(e) => setNewPartnership(e.target.value)}
              onAdd={handleAddPartnership}
              placeholder="Add a strategic partnership"
            />
            
            {gtmData.partnerships.length > 0 ? (
              <ul className="space-y-2">
                {gtmData.partnerships.map((partnership, index) => (
                  <ListItem
                    key={index}
                    item={partnership}
                    onRemove={() => handleRemovePartnership(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No partnerships added yet.</p>
            )}
          </div>
          
          {/* Milestones */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Launch Milestones</h2>
            <p className="text-gray-600 mb-4">
              Define key milestones for your go-to-market plan.
            </p>
            
            <div className="bg-white p-4 rounded-md mb-4 border border-gray-200">
              <h3 className="font-medium mb-3">Add New Milestone</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newMilestone.name}
                    onChange={handleMilestoneChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Beta Launch, First 100 Customers"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="timeline">
                    Timeline
                  </label>
                  <input
                    type="text"
                    id="timeline"
                    name="timeline"
                    value={newMilestone.timeline}
                    onChange={handleMilestoneChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Month 2, Q3 2025"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newMilestone.description}
                    onChange={handleMilestoneChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this milestone"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="successCriteria">
                    Success Criteria
                  </label>
                  <textarea
                    id="successCriteria"
                    name="successCriteria"
                    value={newMilestone.successCriteria}
                    onChange={handleMilestoneChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How will you measure success?"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddMilestone}
                disabled={!newMilestone.name.trim() || !newMilestone.timeline.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Add Milestone
              </button>
            </div>
            
            {gtmData.milestones.length > 0 ? (
              <div className="space-y-3">
                {gtmData.milestones.map((milestone, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{milestone.name}</h4>
                        <span className="text-sm text-gray-500">{milestone.timeline}</span>
                      </div>
                      {milestone.description && (
                        <p className="text-gray-700 mt-1">{milestone.description}</p>
                      )}
                      {milestone.successCriteria && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Success Criteria:</span> {milestone.successCriteria}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No milestones added yet.</p>
            )}
          </div>
          
          {/* KPIs */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Key Performance Indicators (KPIs)</h2>
            <p className="text-gray-600 mb-4">
              Define the metrics you'll use to measure success.
            </p>
            
            <AddItemInput
              value={newKpi}
              onChange={(e) => setNewKpi(e.target.value)}
              onAdd={handleAddKpi}
              placeholder="Add a KPI"
            />
            
            {gtmData.kpis.length > 0 ? (
              <ul className="space-y-2">
                {gtmData.kpis.map((kpi, index) => (
                  <ListItem
                    key={index}
                    item={kpi}
                    onRemove={() => handleRemoveKpi(index)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No KPIs added yet.</p>
            )}
          </div>
          
          {/* Budget Allocation */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Budget Allocation</h2>
            <p className="text-gray-600 mb-4">
              Define how you'll allocate your marketing and sales budget.
            </p>
            
            <div className="flex mb-4">
              <input
                type="text"
                value={newBudgetCategory}
                onChange={(e) => setNewBudgetCategory(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category (e.g., Social Media, Content)"
              />
              <input
                type="text"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                className="w-32 px-4 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amount/Percentage"
              />
              <button
                type="button"
                onClick={handleAddBudget}
                disabled={!newBudgetCategory.trim() || !newBudgetAmount.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
              >
                Add
              </button>
            </div>
            
            {Object.keys(gtmData.budgetAllocation).length > 0 ? (
              <div className="overflow-hidden bg-white rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allocation
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(gtmData.budgetAllocation).map(([category, amount], index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveBudget(category)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No budget allocations added yet.</p>
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
            disabled={isLoading || !gtmData.launchStrategy || gtmData.marketingChannels.length === 0 || !gtmData.salesStrategy}
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
                Continue to Company Formation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoToMarketStage;
