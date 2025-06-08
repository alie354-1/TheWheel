import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { expertService } from '../../lib/services/expert.service';
import { ExpertProfile, PaginationParams } from '../../lib/types/community.types';
import JoinAsExpertCTA from '../../components/community/JoinAsExpertCTA';
import EditExpertProfileButton from '../../components/community/EditExpertProfileButton';
import ViewExpertProfileButton from '../../components/community/ViewExpertProfileButton';
import ConnectWithExpertButton from '../../components/community/ConnectWithExpertButton';
import CreateSampleExpertProfileButton from '../../components/community/CreateSampleExpertProfileButton';
import { useAuth } from '../../lib/hooks/useAuth';

// Define expert filters interface since it's not in community.types.ts
interface ExpertFilters {
  expertise_area?: string;
  industry?: string;
  search_term?: string;
  sort_by?: 'rating' | 'review_count' | 'name';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Community Experts Page
 * 
 * Displays a list of community experts with filtering and pagination.
 * Also handles single expert view when an expertId is provided.
 */
const CommunityExpertsPage: React.FC = () => {
  const { expertId } = useParams<{ expertId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [currentExpert, setCurrentExpert] = useState<ExpertProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpert, setIsExpert] = useState(false);
  const [filters, setFilters] = useState<ExpertFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    page_size: 12
  });
  const [totalPages, setTotalPages] = useState(1);

  // Check if current user is already an expert
  useEffect(() => {
    const checkExpertStatus = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const expertProfile = await expertService.getExpertProfile(user.id);
          setIsExpert(!!expertProfile);
        } catch (err) {
          console.error('Error checking expert status:', err);
          setIsExpert(false);
        }
      }
    };
    
    checkExpertStatus();
  }, [isAuthenticated, user]);

  // Fetch single expert or list of experts based on presence of expertId
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (expertId) {
          // Fetch single expert - FIXED: Use getExpertProfileById instead of getExpertProfile
          const expert = await expertService.getExpertProfileById(expertId);
          setCurrentExpert(expert);
          setExperts([]);
        } else {
          // Fetch list of experts
          const experts = await expertService.getTopExperts(pagination.page_size);
          // In a real implementation, we would apply filters and pagination here
          // For now, we'll just use the top experts
          setExperts(experts);
          setTotalPages(Math.ceil(experts.length / pagination.page_size));
          setCurrentExpert(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching experts:', err);
        setError('Failed to load experts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [expertId, filters, pagination]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ExpertFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    
    // In a real implementation, this would trigger a new API call with the updated filters
    // For now, we'll just log the filters
    console.log('Filters updated:', { ...filters, ...newFilters });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Single expert view
  if (currentExpert) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/community/experts" className="text-blue-600 hover:text-blue-800">
            ← Back to all experts
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 overflow-hidden">
                {currentExpert.user_avatar_url && (
                  <img 
                    src={currentExpert.user_avatar_url} 
                    alt={currentExpert.user_name || 'Expert'} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">{currentExpert.user_name || 'Expert'}</h1>
              <div className="text-blue-600 font-medium text-center mb-4">
                {currentExpert.primary_expertise_areas?.length > 0 ? 
                  `Expert in ${currentExpert.primary_expertise_areas[0]}` : 
                  'Community Expert'}
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-gray-600">{currentExpert.endorsement_count || 0} endorsements</span>
              </div>
              
              <div className="w-full">
                <ConnectWithExpertButton 
                  expertId={currentExpert.id}
                  expertName={currentExpert.user_name || 'Expert'}
                  fullWidth
                  className="mb-2"
                />
                <button className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded">
                  Send Message
                </button>
              </div>
            </div>
            
            <div className="md:w-2/3 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">About</h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {currentExpert.success_stories && currentExpert.success_stories.length > 0 
                    ? currentExpert.success_stories.join('\n\n')
                    : `Expert in ${currentExpert.primary_expertise_areas?.join(', ')}`}
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {currentExpert.primary_expertise_areas?.map((area: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                  {currentExpert.secondary_expertise_areas?.map((area: string, index: number) => (
                    <span key={`secondary-${index}`} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              
              {currentExpert.industry_experience && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Industry Experience</h2>
                  <div className="space-y-4">
                    {Object.entries(currentExpert.industry_experience).map(([industry, details], index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <div className="font-medium">{industry}</div>
                        <div className="text-gray-600">{JSON.stringify(details)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentExpert.functional_experience && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Functional Experience</h2>
                  <div className="space-y-4">
                    {Object.entries(currentExpert.functional_experience).map(([function_area, details], index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <div className="font-medium">{function_area}</div>
                        <div className="text-gray-600">{JSON.stringify(details)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentExpert.success_stories && currentExpert.success_stories.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Success Stories</h2>
                  <div className="space-y-2">
                    {currentExpert.success_stories.map((story: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{story}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Mentorship Capacity</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600">
                    {currentExpert.mentorship_capacity > 0 
                      ? `Available for mentorship (Capacity: ${currentExpert.mentorship_capacity})` 
                      : 'Not currently available for mentorship'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews section could be added here */}
      </div>
    );
  }

  // Experts list view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Experts</h1>
        <p className="text-gray-600">Connect with industry experts for guidance and mentorship.</p>
      </div>
      
      {/* Join as Expert CTA or Edit Profile Button */}
      <div className="mb-8">
        {!isExpert ? (
          <div>
            <JoinAsExpertCTA variant="banner" />
            <div className="mt-4 flex justify-end">
              <CreateSampleExpertProfileButton />
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-1">You're an Expert!</h3>
                <p className="text-blue-700">
                  Thank you for sharing your expertise with the community. You can view or edit your profile anytime.
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <ViewExpertProfileButton variant="button" />
              <EditExpertProfileButton variant="button" />
            </div>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="expertise-area" className="block text-sm font-medium text-gray-700 mb-1">Expertise Area</label>
            <select
              id="expertise-area"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.expertise_area || ''}
              onChange={(e) => handleFilterChange({ 
                expertise_area: e.target.value ? e.target.value : undefined 
              })}
            >
              <option value="">All Areas</option>
              <option value="product_strategy">Product Strategy</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="technology">Technology</option>
              <option value="leadership">Leadership</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              id="industry"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.industry || ''}
              onChange={(e) => handleFilterChange({ 
                industry: e.target.value ? e.target.value : undefined 
              })}
            >
              <option value="">All Industries</option>
              <option value="saas">SaaS</option>
              <option value="fintech">Fintech</option>
              <option value="healthcare">Healthcare</option>
              <option value="ecommerce">E-commerce</option>
              <option value="education">Education</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sort-by"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.sort_by || 'rating'}
              onChange={(e) => handleFilterChange({ 
                sort_by: e.target.value as any, 
                sort_direction: 'desc'
              })}
            >
              <option value="rating">Highest Rated</option>
              <option value="review_count">Most Reviews</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
          
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search experts..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              value={filters.search_term || ''}
              onChange={(e) => handleFilterChange({ search_term: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>
      
      {/* Experts Grid */}
      {experts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {experts.map((expert) => (
            <div key={expert.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 mr-4 overflow-hidden">
                    {expert.user_avatar_url && (
                      <img 
                        src={expert.user_avatar_url} 
                        alt={expert.user_name || 'Expert'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      <Link to={`/community/experts/${expert.id}`} className="hover:text-blue-600">
                        {expert.user_name || 'Expert'}
                      </Link>
                    </h2>
                    <div className="text-sm text-blue-600">
                      {expert.primary_expertise_areas?.length > 0 ? 
                        `Expert in ${expert.primary_expertise_areas[0]}` : 
                        'Community Expert'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-600">{expert.endorsement_count || 0} endorsements</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {expert.success_stories && expert.success_stories.length > 0 
                    ? expert.success_stories[0] 
                    : 'Expert in ' + expert.primary_expertise_areas?.join(', ')}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {expert.primary_expertise_areas?.slice(0, 3).map((area: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {area}
                    </span>
                  ))}
                  {(expert.primary_expertise_areas?.length || 0) > 3 && (
                    <span className="text-xs text-gray-500">+{(expert.primary_expertise_areas?.length || 0) - 3} more</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <Link 
                    to={`/community/experts/${expert.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Profile →
                  </Link>
                  <ConnectWithExpertButton 
                    expertId={expert.id}
                    expertName={expert.user_name || 'Expert'}
                    size="sm"
                    variant="outline"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No experts found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or check back later.</p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  pagination.page === i + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
              disabled={pagination.page === totalPages}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CommunityExpertsPage;
