import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCompany } from '@/lib/hooks/useCompany';
import { useAuth } from '@/lib/hooks/useAuth'; // Import useAuth
import { CoreRecommendationService } from '@/lib/services/recommendation'; // Updated import
import { fetchAnalyticsAggregates } from '@/lib/services/analytics.service';
import { getUserLearningProfile } from '@/lib/services/learningProfile.service'; // Import learning profile service
import type { UserLearningProfile } from '@/lib/types/profile.types'; // Import type
import type { StepRecommendation } from '@/lib/types/journey-steps.types';
import { calculateTimeEstimate } from '@/lib/utils/time-utils';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import useRecommendationAnalytics from '@/lib/hooks/useRecommendationAnalytics';
import { toast } from 'sonner'; // Import toast

// Export the props interface
export interface NextBestStepsProps {
  companyId: string;
  currentStepId?: string;
  limit?: number;
  onStepSelect?: (stepId: string) => void;
  showFilters?: boolean;
  className?: string;
}

/**
 * NextBestSteps component displays personalized step recommendations for the company
 * Enhanced in Sprint 3 with interactive features and improved UX
 */
export const NextBestSteps: React.FC<NextBestStepsProps> = ({
  companyId,
  currentStepId, // Destructure currentStepId (optional)
  limit = 3,
  onStepSelect,
  showFilters = true,
  className = '',
}) => {
  const { currentCompany } = useCompany(); // Keep for fallback if companyId prop isn't passed? Or remove? Let's keep for now.
  const [recommendations, setRecommendations] = useState<StepRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<StepRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [timeConstraint, setTimeConstraint] = useState<number | undefined>(undefined);
  const [focusAreas, setFocusAreas] = useState<string[]>([]); // Keep for potential future use
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // Get user from auth hook
  const [learningProfile, setLearningProfile] = useState<UserLearningProfile | null>(null);
  const { trackRecommendationView, trackRecommendationSelect } = useRecommendationAnalytics();
  const controls = useAnimation();

  // Analytics context
  const [analyticsContext, setAnalyticsContext] = useState<Record<string, any>>({});

  // Filter options
  const filterOptions = [
    { id: 'quick-wins', label: 'Quick Wins', icon: '⚡' },
    { id: 'high-impact', label: 'High Impact', icon: '🎯' },
    { id: 'prerequisites', label: 'Has Prerequisites Complete', icon: '✓' }
  ];

  // Time constraint options
  const timeOptions = [
    { value: undefined, label: 'Any Time' },
    { value: 1, label: '1 Day' },
    { value: 7, label: '1 Week' },
    { value: 30, label: '1 Month' }
  ];

  // Fetch learning profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      const profile = await getUserLearningProfile(user.id);
      setLearningProfile(profile);
    };
    fetchProfile();
  }, [user?.id]);

  // Fetch analytics aggregates for context
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!companyId) return;
      try {
        const aggs = await fetchAnalyticsAggregates(companyId);
        // Extract relevant metrics for context
        const context: Record<string, any> = {};
        for (const metric of ["bottleneck_prediction", "tool_adoption_projection", "team_velocity"]) {
          const agg = aggs.find(a => a.metric_name === metric);
          if (agg) context[metric] = agg.value?.value || agg.value;
        }
        setAnalyticsContext(context);
      } catch (err) {
        setAnalyticsContext({});
      }
    };
    fetchAnalytics();
  }, [companyId]);

  // Load recommendations with filters
  const loadRecommendations = useCallback(async () => {
    const targetCompanyId = companyId || currentCompany?.id; // Use passed prop first
    if (!targetCompanyId || !user?.id) return;

    try {
      setLoading(true);
      controls.start({ opacity: 0.7 });

      // Context for personalized recommendations, now including learning profile and analytics
      const context = {
        userId: user.id,
        focusAreas,
        timeConstraint,
        learningStyle: learningProfile?.learning_style_preference,
        pacePreference: learningProfile?.pace_preference,
        ...analyticsContext, // Add analytics metrics to context
      };

      const stepRecommendations = await CoreRecommendationService.getRecommendations(
        targetCompanyId,
        limit + 3, // Request more then filter
        context // Pass the enhanced context
      );

      setRecommendations(stepRecommendations);

      // Track impression
      trackRecommendationView(stepRecommendations.map(r => r.id));

      // Apply filters immediately
      applyFilters(stepRecommendations, activeFilters);
      setError(null);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
      controls.start({ opacity: 1 });
    }
  }, [companyId, currentCompany?.id, user?.id, limit, activeFilters, timeConstraint, focusAreas, learningProfile, controls, trackRecommendationView]); // Add dependencies

  // Apply filters to recommendations
  const applyFilters = useCallback((recs: StepRecommendation[], filters: string[]) => {
    if (filters.length === 0) {
      setFilteredRecommendations(recs.slice(0, limit));
      return;
    }

    let filtered = [...recs];

    // Apply each active filter
    if (filters.includes('quick-wins')) {
      filtered = filtered.filter(rec =>
        (rec.estimated_time_max || 120) < 60 // Less than 1 hour
      );
    }

    if (filters.includes('high-impact')) {
      filtered = filtered.filter(rec =>
        rec.relevance_score >= 7 // High relevance score
      );
    }

    if (filters.includes('prerequisites')) {
      filtered = filtered.filter(rec =>
        rec.reasoning.some(r => r.includes('prerequisites complete'))
      );
    }

    // Limit and sort by relevance
    setFilteredRecommendations(
      filtered
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, limit)
    );
  }, [limit]);

  // Toggle filter
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(f => f !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  // Change time constraint
  const handleTimeChange = (days: number | undefined) => {
    setTimeConstraint(days);
  };

  // Handle step selection with analytics
  const handleStepSelect = (stepId: string) => {
    trackRecommendationSelect(stepId);
    onStepSelect?.(stepId);
  };

  // Toggle card expansion
  const toggleCardExpansion = (id: string) => {
    setExpandedCard(prev => prev === id ? null : id);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigate between recommendations with arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();

        if (filteredRecommendations.length === 0) return;

        const currentIndex = expandedCard
          ? filteredRecommendations.findIndex(r => r.id === expandedCard)
          : -1;

        let newIndex = currentIndex;

        if (e.key === 'ArrowDown') {
          newIndex = currentIndex === filteredRecommendations.length - 1 ? 0 : currentIndex + 1;
        } else {
          newIndex = currentIndex === -1 || currentIndex === 0
            ? filteredRecommendations.length - 1
            : currentIndex - 1;
        }

        setExpandedCard(filteredRecommendations[newIndex].id);
      }

      // Select currently expanded recommendation with Enter
      if (e.key === 'Enter' && expandedCard) {
        handleStepSelect(expandedCard);
      }
    };

    // Add listener if we have recommendations
    if (filteredRecommendations.length > 0) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredRecommendations, expandedCard, handleStepSelect]);

  // Load recommendations on mount and when filters change
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Apply filters when active filters change
  useEffect(() => {
    applyFilters(recommendations, activeFilters);
  }, [recommendations, activeFilters, applyFilters]);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 1 }}
        animate={controls}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-blue-700 px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Recommended Next Steps</h3>
            <p className="text-blue-100 text-sm">
              Personalized steps to move your business forward
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadRecommendations()}
            className="p-2 rounded-full text-white hover:bg-blue-600 focus:outline-none"
            aria-label="Refresh recommendations"
            title="Refresh recommendations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        </div>

        {/* Filters section - NEW in Sprint 3 */}
        {showFilters && (
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-wrap gap-2 mb-2">
              {filterOptions.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1
                    ${activeFilters.includes(filter.id)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Time frame:</span>
              <div className="flex gap-1">
                {timeOptions.map(option => (
                  <button
                    key={option.value?.toString() || 'any'}
                    onClick={() => handleTimeChange(option.value)}
                    className={`px-2 py-1 rounded text-xs
                      ${timeConstraint === option.value
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200" ref={containerRef}>
          <AnimatePresence>
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 flex flex-col items-center justify-center"
              >
                <div className="animate-pulse flex space-x-4 w-full">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-center text-red-500"
              >
                {error}
              </motion.div>
            ) : filteredRecommendations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-center text-gray-500"
              >
                {recommendations.length === 0
                  ? "No recommendations available at this time."
                  : "No matching recommendations with current filters."}
                {recommendations.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            ) : (
              filteredRecommendations.map((rec, index) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  index={index}
                  isExpanded={expandedCard === rec.id}
                  onToggleExpand={() => toggleCardExpansion(rec.id)}
                  onSelect={() => handleStepSelect(rec.id)}
                  // Pass feedback handler (placeholder for now)
                  onFeedback={(stepId, helpful) => {
                    console.log(`Feedback for ${stepId}: ${helpful ? 'Helpful' : 'Not Helpful'}`);
                    // TODO: Call actual feedback service
                    // Example: feedbackService.submitRecommendationFeedback(user.id, stepId, helpful);
                    // Show toast notification
                    toast.info(`Feedback received for ${rec.name}. Thank you!`);
                  }}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: StepRecommendation;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onFeedback: (stepId: string, helpful: boolean) => void; 
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  index,
  isExpanded,
  onToggleExpand,
  onSelect,
  onFeedback, // Destructure the new prop
}) => {
  const timeEstimate = calculateTimeEstimate(
    recommendation.estimated_time_min,
    recommendation.estimated_time_max
  );

  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view when expanded
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded]);

  const getHueForScore = (score: number) => {
    // Map scores from the range [1-10] to hues [0-120] (red to green)
    return Math.min(120, Math.max(0, Math.floor((score / 10) * 120)));
  };

  const difficultyDots = [];
  for (let i = 0; i < 5; i++) {
    difficultyDots.push(
      <span
        key={i}
        className={`inline-block w-2 h-2 rounded-full ${
          i < recommendation.difficulty_level ? 'bg-blue-500' : 'bg-gray-300'
        } mr-1`}
      />
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        height: 'auto',
        backgroundColor: isExpanded ? 'rgba(239, 246, 255, 0.6)' : 'transparent',
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        delay: index * 0.1,
        height: { duration: 0.3 },
        backgroundColor: { duration: 0.2 }
      }}
      className={`p-4 hover:bg-blue-50/60 transition-colors duration-200 cursor-pointer relative ${isExpanded ? 'border-l-4 border-blue-500' : ''}`}
      onClick={onToggleExpand}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggleExpand();
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {recommendation.name}
        </h4>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm"
          style={{
            backgroundColor: `hsl(${getHueForScore(recommendation.relevance_score)}, 70%, 50%)`,
            border: '2px solid white',
          }}
        >
          {Math.round(recommendation.relevance_score)}
        </div>
      </div>

      {recommendation.description && (
        <div className={`text-sm text-gray-600 mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {recommendation.description}
        </div>
      )}

      <div className="flex justify-between items-center text-sm">
        <div>
          <div className="flex items-center mb-1">
            <span className="mr-2 text-gray-600">Difficulty:</span>
            <div className="flex">{difficultyDots}</div>
          </div>
          <div className="text-gray-600">
            <span className="inline-block mr-1">⏱</span>
            {timeEstimate}
          </div>
        </div>
      </div>

      <motion.div
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={{
          expanded: { opacity: 1, height: 'auto', marginTop: 16 },
          collapsed: { opacity: 0, height: 0, marginTop: 0 }
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {recommendation.reasoning.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-3">
            <span className="block text-sm text-blue-700 font-medium mb-2">Why this step?</span>
            <ul className="text-sm text-blue-700 space-y-2">
              {recommendation.reasoning.map((reason, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block mr-2 mt-0.5 text-blue-500">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            {/* Adaptive context summary */}
            <div className="mt-2 text-xs text-blue-600">
              {learningProfile?.learning_style_preference && (
                <div>
                  <strong>Personalized for your learning style:</strong> {learningProfile.learning_style_preference}
                </div>
              )}
              {analyticsContext.bottleneck_prediction && (
                <div>
                  <strong>Current bottleneck:</strong> {analyticsContext.bottleneck_prediction}
                </div>
              )}
              {analyticsContext.tool_adoption_projection && (
                <div>
                  <strong>Tool adoption rate:</strong> {analyticsContext.tool_adoption_projection}
                </div>
              )}
              {analyticsContext.team_velocity && (
                <div>
                  <strong>Team velocity:</strong> {analyticsContext.team_velocity}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-md p-3 mb-3">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Step Details</h5>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Phase:</span>
              <span className="ml-2 text-gray-700 font-medium">{recommendation.phase_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Estimated Time:</span>
              <span className="ml-2 text-gray-700 font-medium">{timeEstimate}</span>
            </div>
            <div>
              <span className="text-gray-500">Difficulty:</span>
              <span className="ml-2 text-gray-700 font-medium">{recommendation.difficulty_level}/5</span>
            </div>
            <div>
              <span className="text-gray-500">Relevance:</span>
              <span className="ml-2 text-gray-700 font-medium">{Math.round(recommendation.relevance_score)}/10</span>
            </div>
          </div>
        </div>

        {/* Feedback Section - Rendered when expanded */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">Was this recommendation helpful?</span>
            <button
              onClick={(e) => { e.stopPropagation(); onFeedback(recommendation.id, true); }}
              className="p-1 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              aria-label="Helpful"
              title="Helpful"
            >
              {/* Thumbs Up Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onFeedback(recommendation.id, false); }}
              className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label="Not Helpful"
              title="Not Helpful"
            >
              {/* Thumbs Down Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.2-1.867a4 4 0 00.8-2.4z" />
              </svg>
            </button>
          </div>
        )}
      </motion.div>

      <div className={`mt-3 flex justify-end ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Start this step
          <svg
            className="ml-1 -mr-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </motion.button>
      </div>

      {/* Keyboard shortcut hint - NEW in Sprint 3 */}
      {isExpanded && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-400">
          Press Enter to select
        </div>
      )}
    </motion.div>
  );
};

// Corrected export: Use named export for the component
// export default NextBestSteps; // Remove default export if not intended
// Keep named export: export const NextBestSteps ... (already done above)
