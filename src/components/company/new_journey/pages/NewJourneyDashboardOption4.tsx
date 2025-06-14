import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Using Helmet for document head
let Helmet: any;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // If react-helmet is not installed, create a placeholder component
  Helmet = ({ children }: { children: React.ReactNode }) => <>{children}</>;
}

// Import layout components
import Option2Layout from '../layouts/Option2Layout';

// Import sidebar components
import StepsSidebar from '../components/sidebar/StepsSidebar';
import JourneyStatsBar from '../components/sidebar/JourneyStatsBar';
import SearchBar from '../components/sidebar/SearchBar';

// Import step components
import ActiveStepCard from '../components/steps/ActiveStepCard';
import RecommendationCard from '../components/steps/RecommendationCard';
import StepsList from '../components/steps/StepsList';

// Import business components
import DomainProgressCard from '../components/business/DomainProgressCard';

// Define the DomainProgress interface based on what DomainProgressCard expects
interface DomainProgress {
  id: string;
  name: string;
  description?: string;
  totalSteps: number;
  completedSteps: number;
  activeSteps: number;
  maturityScore?: number;
  color?: string;
  icon?: string;
}

// Import community components
import PeerInsightCard, { PeerInsight } from '../components/community/PeerInsightCard';

// Import UI components
import TabNavigation from '../components/ui/TabNavigation';
import FiltersModal from '../components/filters/FiltersModal';

// Import hooks
import { useCompanySteps } from '../hooks/useCompanySteps';
import { useCompanyProgress } from '../hooks/useCompanyProgress';
import { useAIDashboard } from '../hooks/useAIDashboard';

/**
 * NewJourneyDashboardOption4: Tabbed dashboard layout (Option 2 in new naming)
 * Shows a dashboard with tabs for Current Work, Recommended Steps, and Business Health
 */
const NewJourneyDashboardOption4: React.FC = () => {
  const navigate = useNavigate();
  const companyJourneyId = 'company1'; // This would come from authentication context in a real implementation
  
  // State
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  // Filter states
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [filterBlocked, setFilterBlocked] = useState(false);
  const [filterCompleted, setFilterCompleted] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  
  // Hooks for data - replaced with mock data to avoid TS errors
  // const { activeSteps, urgentSteps, completedSteps } = useCompanySteps(companyJourneyId);
  // const { domainProgress } = useCompanyProgress(companyJourneyId);
  // const { recommendations, peerInsights } = useAIDashboard(companyJourneyId);
  
  // Mock data for the UI
  const mockActiveSteps = [
    {
      id: 'step1',
      title: 'Run Customer Interviews',
      description: 'Validate your assumptions by interviewing potential customers to gain insights into their pain points and needs.',
      domain: 'Product',
      tags: ['Research', 'Validation'],
      priority: 'normal' as const,
      progress: 35,
      lastWorkedOn: 'Today at 8:45 AM',
      startDate: 'June 5, 2025',
      dueDate: 'June 19, 2025',
      timeSpent: '4.5 hours',
      nextTasks: [
        {id: 'task1', text: 'Complete 5 more customer interviews (5/10 done)', done: false},
        {id: 'task2', text: 'Analyze interview responses for patterns', done: false}
      ],
      tools: ['Zoom', 'Google Forms']
    },
    {
      id: 'step2',
      title: 'Define MVP Features',
      description: 'Define the core features for your minimum viable product that will solve your target users\' most critical problems.',
      domain: 'Product',
      tags: ['Product'],
      priority: 'normal' as const,
      progress: 60,
      lastWorkedOn: 'Yesterday at 3:15 PM',
      startDate: 'June 8, 2025',
      dueDate: 'June 15, 2025',
      timeSpent: '3.2 hours',
      nextTasks: [
        {id: 'task1', text: 'Prioritize features using MoSCoW method', done: false},
        {id: 'task2', text: 'Create feature specification documents', done: false},
        {id: 'task3', text: 'Review with development team', done: false}
      ],
      tools: ['Notion', 'Miro']
    }
  ];
  
  const mockUrgentSteps = [
    {
      id: 'step3',
      title: 'Submit Application to Y Combinator',
      description: 'Complete and submit YC application before the deadline.',
      domain: 'Funding',
      tags: ['Fundraising'],
      priority: 'high' as const,
      progress: 75,
      lastWorkedOn: 'Today at 11:20 AM',
      startDate: 'June 1, 2025',
      dueDate: 'June 15, 2025',
      timeSpent: '5.5 hours'
    },
    {
      id: 'step4',
      title: 'Finalize Pitch Deck',
      description: 'Complete your investor pitch deck with latest traction metrics.',
      domain: 'Funding',
      tags: ['Fundraising', 'Pitch'],
      priority: 'high' as const,
      progress: 40,
      lastWorkedOn: 'Yesterday at 2:10 PM',
      startDate: 'June 5, 2025',
      dueDate: 'June 14, 2025',
      timeSpent: '3.0 hours'
    }
  ];
  
  const mockCompletedSteps = [
    {
      id: 'step5',
      title: 'Complete Market Research',
      description: 'Analyze market size, competitors, and potential growth opportunities.',
      domain: 'Market',
      tags: ['Research'],
      priority: 'normal' as const,
      completedDate: 'June 1, 2025'
    },
    {
      id: 'step6',
      title: 'Create Business Plan',
      description: 'Document your business model, go-to-market strategy, and financial projections.',
      domain: 'Strategy',
      tags: ['Planning'],
      priority: 'normal' as const,
      completedDate: 'May 22, 2025'
    }
  ];
  
  const mockRecommendations = [
    {
      id: 'rec1',
      title: 'Create User Personas',
      domain: 'Product',
      description: 'Natural next step from your customer interviews',
      peerPercentage: 86,
      estimatedTime: '3-5 days',
      difficulty: 'Medium' as const,
      whyItMatters: 'User personas provide a shared reference point for design decisions and help prioritize features based on user needs.',
      recommendedTools: ['Miro', 'Figma', 'UXPressia'],
      iconColor: 'blue'
    },
    {
      id: 'rec2',
      title: 'Build MVP Prototype',
      domain: 'Development',
      description: 'Start validating your MVP feature ideas',
      peerPercentage: 64,
      estimatedTime: '1-3 weeks',
      difficulty: 'High' as const,
      whyItMatters: 'Prototyping helps identify problems early, validate assumptions, and potentially attract early investors with a tangible product demo.',
      recommendedTools: ['Figma', 'InVision', 'Adobe XD'],
      iconColor: 'purple'
    },
    {
      id: 'rec3',
      title: 'Create Financial Model',
      domain: 'Finance',
      description: 'Build on your pricing strategy work',
      peerPercentage: 53,
      estimatedTime: '1-2 weeks',
      difficulty: 'Medium' as const,
      whyItMatters: 'A solid financial model is essential for fundraising, strategic planning, and setting realistic business milestones.',
      recommendedTools: ['Excel', 'Google Sheets', 'Causal'],
      iconColor: 'green'
    }
  ];
  
  const mockDomainProgress = [
    {
      id: 'domain1',
      name: 'Product Development',
      status: 'Active Focus' as const,
      level: 3,
      maxLevel: 5,
      stepsEngaged: 5,
      daysInvested: 14,
      strengths: ['Strong product-market fit indicators', 'Clear user problem definition'],
      focusAreas: ['Customer validation needs more data', 'Feature prioritization not finalized'],
      color: 'blue',
      activeSteps: ['Customer Interviews', 'Define MVP Features']
    },
    {
      id: 'domain2',
      name: 'Market Research',
      status: 'Maintaining' as const,
      level: 4,
      maxLevel: 5,
      stepsEngaged: 7,
      daysInvested: 21,
      strengths: ['Clear value proposition articulated'],
      focusAreas: [],
      color: 'green',
      activeSteps: []
    },
    {
      id: 'domain3',
      name: 'Funding Strategy',
      status: 'Future Focus' as const,
      level: 2,
      maxLevel: 5,
      stepsEngaged: 3,
      daysInvested: 8,
      strengths: [],
      focusAreas: ['Financial projections are incomplete'],
      color: 'amber',
      activeSteps: []
    }
  ];
  
  const mockPeerInsights: PeerInsight[] = [
    {
      id: 'insight1',
      content: 'We found that focusing on customer interviews early saved us months of product development in the wrong direction.',
      author: {
        name: 'Sarah K.',
        role: 'Fintech Founder',
        initials: 'SK'
      },
      timestamp: '1 week ago',
      domain: 'Product',
      likes: 24
    }
  ];
  
  // Stats for the sidebar
  const statsData = {
    total: 24,
    active: 5,
    completed: 12,
    urgent: 2
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearch(query);
    console.log(`Searching for: ${query}`);
    // In a real implementation, this would filter the steps
  };
  
  // Handle opening filter modal
  const openFiltersModal = () => {
    setShowFiltersModal(true);
  };
  
  // Handle continuing a step
  const handleContinueStep = (stepId: string) => {
    console.log(`Continuing step: ${stepId}`);
    // In a real implementation, this would navigate to the step detail page
    navigate(`/company/new-journey/step/${stepId}`);
  };
  
  // Handle starting a recommended step
  const handleStartRecommendation = (recId: string) => {
    console.log(`Starting recommendation: ${recId}`);
    // In a real implementation, this would start the recommended step
  };
  
  // Handle viewing a domain in detail
  const handleViewDomainDetails = (domainId: string) => {
    console.log(`Viewing domain details: ${domainId}`);
    // In a real implementation, this would navigate to the domain detail page
    navigate(`/company/new-journey/domain/${domainId}`);
  };
  
  // Handle step click
  const handleStepClick = (stepId: string) => {
    console.log(`Viewing step: ${stepId}`);
    // In a real implementation, this would navigate to the step detail page
    navigate(`/company/new-journey/step/${stepId}`);
  };
  
  // Create tab definitions
  const tabDefinitions = [
    {
      id: 'current',
      label: 'Current Work',
      content: (
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Pick Up Where You Left Off</h2>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">View all active steps</a>
            </div>
            
            {/* Active Step Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {mockActiveSteps.map(step => (
                <ActiveStepCard
                  key={step.id}
                  step={step}
                  progress={step.progress}
                  lastWorkedOn={step.lastWorkedOn}
                  startDate={step.startDate}
                  dueDate={step.dueDate}
                  nextTasks={step.nextTasks}
                  timeSpent={step.timeSpent}
                  tools={step.tools}
                  expandable={true}
                  expanded={false}
                  onToggleExpand={() => {}}
                  onContinue={() => handleContinueStep(step.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Domain Progress & Peer Insights Section */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Domain Progress */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Domain Progress</h2>
              
              {/* Domain Progress Cards */}
              <div className="space-y-4">
                {mockDomainProgress.map(domain => {
                  // Convert our domain data to match DomainProgressCard expected interface
                  const domainProgress: DomainProgress = {
                    id: domain.id,
                    name: domain.name,
                    totalSteps: domain.stepsEngaged + 3, // Just a mock calculation for the example
                    completedSteps: Math.round((domain.level / domain.maxLevel) * (domain.stepsEngaged + 3)),
                    activeSteps: domain.activeSteps ? domain.activeSteps.length : 0,
                    maturityScore: domain.level,
                    color: domain.color,
                    icon: domain.id === 'domain1' ? 'fas fa-cogs' : 
                          domain.id === 'domain2' ? 'fas fa-chart-line' : 'fas fa-dollar-sign'
                  };
                  
                  return (
                    <DomainProgressCard
                      key={domain.id}
                      domain={domainProgress}
                      onClick={() => handleViewDomainDetails(domain.id)}
                      compact={domain.id !== 'domain1'}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Peer Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Peer Insights</h2>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">View all</a>
              </div>
              
              <div className="space-y-4">
                {mockPeerInsights.map(insight => (
                  <PeerInsightCard 
                    key={insight.id}
                    insightObj={insight}
                    onClick={() => console.log(`Viewing insight: ${insight.id}`)}
                  />
                ))}
              </div>
              
              <div className="mt-4">
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center">
                  <i className="fas fa-users mr-1"></i>
                  Connect with more founders
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'recommended',
      label: 'Recommended Next Steps',
      content: (
        <div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {/* Recommendation Cards */}
            {mockRecommendations.map(rec => (
              <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <RecommendationCard
                  title={rec.title}
                  domain={rec.domain}
                  description={rec.description}
                  peerPercentage={rec.peerPercentage}
                  estimatedTime={rec.estimatedTime}
                  difficulty={rec.difficulty}
                  expandable={true}
                  expanded={false}
                  onToggleExpand={() => {}}
                  onStart={() => handleStartRecommendation(rec.id)}
                  whyItMatters={rec.whyItMatters}
                  recommendedTools={rec.recommendedTools}
                  iconColor={rec.iconColor}
                />
              </div>
            ))}
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
              <i className="fas fa-search mr-2"></i>
              Browse All Steps
            </a>
            <a href="#" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none">
              <i className="fas fa-plus mr-2"></i>
              Add Custom Step
            </a>
          </div>
        </div>
      )
    },
    {
      id: 'business',
      label: 'Business Health',
      content: (
        <div className="space-y-6">
          {/* Domain Progress Cards - Full versions with more details */}
          {mockDomainProgress.map(domain => (
            <div key={domain.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-start">
                <div className={`p-3 bg-${domain.color}-100 rounded-full mr-4`}>
                  <i className={`fas fa-${domain.id === 'domain1' ? 'cogs' : domain.id === 'domain2' ? 'chart-line' : 'dollar-sign'} text-${domain.color}-600 text-xl`}></i>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
                      <p className={`text-sm text-${domain.color}-700`}>{domain.status}</p>
                    </div>
                    <span className={`text-sm font-medium bg-${domain.color}-50 text-${domain.color}-800 px-2 py-1 rounded`}>Level {domain.level}/{domain.maxLevel}</span>
                  </div>
                  
                  {/* Maturity level indicator */}
                  <div className="w-full flex my-3 gap-1">
                    {Array.from({ length: domain.maxLevel }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 flex-1 rounded-sm ${i < domain.level ? `bg-${domain.color}-500` : 'bg-gray-200'}`}
                      ></div>
                    ))}
                  </div>
                  
                  {domain.id === 'domain1' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Active Steps</h4>
                        <div className="space-y-2">
                          {domain.activeSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <span className={`h-2 w-2 bg-${domain.color}-500 rounded-full mr-2`}></span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
                        <div className="space-y-2">
                          {domain.strengths.map((strength, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                              <span>{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas</h4>
                        <div className="space-y-2">
                          {domain.focusAreas.map((focus, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <span className="h-2 w-2 bg-amber-500 rounded-full mr-2"></span>
                              <span>{focus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mt-2 mb-4">
                      {domain.id === 'domain2' 
                        ? 'Your market research is well-developed. You have a clear value proposition and understanding of your target market.'
                        : 'Your funding strategy needs attention. Focus on completing your financial projections and developing a clear fundraising plan.'}
                    </p>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handleViewDomainDetails(domain.id)}
                      className={`inline-flex items-center px-3 py-2 border ${domain.id === 'domain1' ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm' : 'border-gray-300 text-indigo-600 bg-white hover:bg-indigo-50'} text-sm font-medium rounded-md`}
                    >
                      View Domain Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];
  
  // Sidebar content
  const sidebarContent = (
    <StepsSidebar width="260px">
      <JourneyStatsBar 
        stats={statsData}
        activeFilter="all"
        onFilterChange={() => {}}
        showDetails={false}
      />
      
      <SearchBar 
        onSearch={handleSearch}
        initialValue={search}
        placeholder="Search steps..."
      />
      
      <StepsList
        steps={[...mockUrgentSteps, ...mockActiveSteps]}
        activeSteps={mockActiveSteps}
        completedSteps={mockCompletedSteps}
        onStepClick={handleStepClick}
        onContinueStep={handleContinueStep}
      />
    </StepsSidebar>
  );
  
  return (
    <>
      <Helmet>
        <title>Journey Dashboard - Option 2</title>
      </Helmet>
      
      <Option2Layout
        sidebar={sidebarContent}
        tabs={tabDefinitions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Your Founder Journey"
        subtitle="Track your progress with personalized guidance and community insights"
      />
      
      {/* Filters Modal */}
      {showFiltersModal && (
        <FiltersModal
          isOpen={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
          filterUrgent={filterUrgent}
          setFilterUrgent={setFilterUrgent}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
          filterBlocked={filterBlocked}
          setFilterBlocked={setFilterBlocked}
          filterCompleted={filterCompleted}
          setFilterCompleted={setFilterCompleted}
          domains={['Product', 'Marketing', 'Finance']}
          selectedDomains={selectedDomains}
          setSelectedDomains={setSelectedDomains}
        />
      )}
    </>
  );
};

export default NewJourneyDashboardOption4;
