import React, { useState } from 'react';
import { IdeaGenerationParams } from '../../lib/types/idea-playground.types';

interface IdeaGenerationFormProps {
  onSubmit: (params: IdeaGenerationParams) => void;
  hasCompany?: boolean;
  useMarketContext?: boolean;
  isLoading?: boolean;
}

const IdeaGenerationForm: React.FC<IdeaGenerationFormProps> = ({ 
  onSubmit, 
  hasCompany = false, 
  useMarketContext = false,
  isLoading = false
}) => {
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [problemArea, setProblemArea] = useState('');
  const [useCompanyContext, setUseCompanyContext] = useState(useMarketContext && hasCompany);
  const [count, setCount] = useState(3);
  const [marketFocus, setMarketFocus] = useState<'existing' | 'adjacent' | 'new'>('existing');
  
  // Force useCompanyContext to true if useMarketContext is true
  React.useEffect(() => {
    if (useMarketContext && hasCompany) {
      setUseCompanyContext(true);
    }
  }, [useMarketContext, hasCompany]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params: IdeaGenerationParams = {
      topic: topic.trim() || undefined,
      industry: industry.trim() || undefined,
      problem_area: problemArea.trim() || undefined,
      count,
      useCompanyContext: hasCompany && useCompanyContext
    };
    
    // Add market focus if using market context
    if (useMarketContext) {
      params.market_focus = marketFocus;
    }
    
    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic (optional)
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., AI-powered customer service"
          />
        </div>
        
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry (optional)
          </label>
          <input
            type="text"
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Healthcare, Technology, Finance"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="problem-area" className="block text-sm font-medium text-gray-700 mb-1">
          Problem Area (optional)
        </label>
        <input
          type="text"
          id="problem-area"
          value={problemArea}
          onChange={(e) => setProblemArea(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Remote work challenges, Supply chain inefficiencies"
        />
      </div>
      
      {useMarketContext && (
        <div>
          <label htmlFor="market-focus" className="block text-sm font-medium text-gray-700 mb-1">
            Market Focus
          </label>
          <select
            id="market-focus"
            value={marketFocus}
            onChange={(e) => setMarketFocus(e.target.value as 'existing' | 'adjacent' | 'new')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="existing">Existing Markets</option>
            <option value="adjacent">Adjacent Markets</option>
            <option value="new">New Markets</option>
          </select>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Ideas
          </label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>
        
        {hasCompany && (
          <div className="flex items-center">
            <input
              id="use-company-context"
              type="checkbox"
              checked={useCompanyContext}
              onChange={(e) => setUseCompanyContext(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="use-company-context" className="ml-2 block text-sm text-gray-700">
              Generate ideas for my company
            </label>
          </div>
        )}
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Generate Ideas
        </button>
      </div>
    </form>
  );
};

export default IdeaGenerationForm;
