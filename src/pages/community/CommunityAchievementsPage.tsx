import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { achievementService } from '../../lib/services/community';
import { 
  Achievement, 
  ContributionScore, 
  ScoringPeriodType,
  AchievementTier
} from '../../lib/types/community.types';

/**
 * Community Achievements Page
 * 
 * Displays user achievements and contribution scores.
 * Shows leaderboards for top contributors.
 */
const CommunityAchievementsPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [contributionScores, setContributionScores] = useState<ContributionScore[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ScoringPeriodType>('all_time');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Current user ID (in a real app, this would come from auth context)
  const currentUserId = 'current-user-id';
  const targetUserId = userId || currentUserId;
  const isCurrentUser = targetUserId === currentUserId;

  // Fetch achievements and scores
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch achievements
        const userAchievements = isCurrentUser
          ? await achievementService.getUserAchievements(targetUserId)
          : await achievementService.getPublicAchievements(targetUserId);
        
        setAchievements(userAchievements);
        
        // Fetch contribution scores
        if (isCurrentUser) {
          const scores = await achievementService.getUserContributionScores(targetUserId);
          setContributionScores(scores);
        }
        
        // Fetch top contributors
        const contributors = await achievementService.getTopContributors(selectedPeriod, 10);
        setTopContributors(contributors);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Failed to load achievements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUserId, isCurrentUser, selectedPeriod]);

  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(achievement => achievement.achievement_type === selectedCategory);

  // Get the current period score
  const currentPeriodScore = contributionScores.find(
    score => score.scoring_period === selectedPeriod
  );

  // Get all-time score
  const allTimeScore = contributionScores.find(
    score => score.scoring_period === 'all_time'
  );

  // Helper function to get tier color
  const getTierColor = (tier: AchievementTier) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'knowledge_sharing': return 'bg-blue-100 text-blue-800';
      case 'networking': return 'bg-green-100 text-green-800';
      case 'mentorship': return 'bg-purple-100 text-purple-800';
      case 'innovation': return 'bg-yellow-100 text-yellow-800';
      case 'collaboration': return 'bg-indigo-100 text-indigo-800';
      case 'community_building': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format period name
  const formatPeriodName = (period: ScoringPeriodType) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'quarterly': return 'This Quarter';
      case 'yearly': return 'This Year';
      case 'all_time': return 'All Time';
      default: return period;
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Achievements</h1>
        <p className="text-gray-600">Track your progress and see how you're contributing to the community.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Achievements */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isCurrentUser ? 'Your Achievements' : 'User Achievements'}
              </h2>
              
              <div className="flex space-x-2">
                <select
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="knowledge_sharing">Knowledge Sharing</option>
                  <option value="networking">Networking</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="innovation">Innovation</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="community_building">Community Building</option>
                </select>
              </div>
            </div>
            
            {filteredAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-4 ${getTierColor(achievement.tier)}`}
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4 border-2 border-current">
                        {achievement.badge_image_url ? (
                          <img 
                            src={achievement.badge_image_url} 
                            alt={achievement.achievement_name} 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-xl font-bold">
                            {achievement.tier.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.achievement_name}</h3>
                        <div className="flex items-center mb-1">
                          <span 
                            className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(achievement.achievement_type)}`}
                          >
                            {achievement.achievement_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(achievement.earned_date).toLocaleDateString()}
                          </span>
                        </div>
                        {achievement.achievement_description && (
                          <p className="text-sm">{achievement.achievement_description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                <p className="text-gray-600 mb-4">
                  {isCurrentUser 
                    ? 'Start contributing to the community to earn achievements!' 
                    : 'This user has no public achievements yet.'}
                </p>
                {isCurrentUser && (
                  <Link 
                    to="/community"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-block"
                  >
                    Explore Community
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {/* Contribution Scores - Only visible to the current user */}
          {isCurrentUser && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your Contribution Scores</h2>
                
                <div className="flex space-x-2">
                  <select
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as ScoringPeriodType)}
                  >
                    <option value="all_time">All Time</option>
                    <option value="yearly">This Year</option>
                    <option value="quarterly">This Quarter</option>
                    <option value="monthly">This Month</option>
                    <option value="weekly">This Week</option>
                    <option value="daily">Today</option>
                  </select>
                </div>
              </div>
              
              {currentPeriodScore ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="text-sm text-blue-600 mb-1">Knowledge Sharing</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {currentPeriodScore.knowledge_sharing_points}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="text-sm text-green-600 mb-1">Networking</div>
                      <div className="text-2xl font-bold text-green-800">
                        {currentPeriodScore.introduction_credits}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="text-sm text-purple-600 mb-1">Mentorship</div>
                      <div className="text-2xl font-bold text-purple-800">
                        {currentPeriodScore.mentorship_impact_score}
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <div className="text-sm text-red-600 mb-1">Community Building</div>
                      <div className="text-2xl font-bold text-red-800">
                        {currentPeriodScore.community_building_score}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Score ({formatPeriodName(selectedPeriod)})</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {currentPeriodScore.total_score}
                      </div>
                    </div>
                    
                    {currentPeriodScore.percentile_rank !== null && (
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Percentile Rank</div>
                        <div className="text-xl font-bold text-gray-800">
                          Top {currentPeriodScore.percentile_rank}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scores yet</h3>
                  <p className="text-gray-600">
                    You haven't earned any contribution points for {formatPeriodName(selectedPeriod).toLowerCase()} yet.
                  </p>
                </div>
              )}
              
              {allTimeScore && selectedPeriod !== 'all_time' && (
                <div className="mt-4 text-sm text-gray-600">
                  Your all-time score: <span className="font-semibold">{allTimeScore.total_score}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right Column - Leaderboard */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Top Contributors</h2>
              
              <div className="flex space-x-2">
                <select
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as ScoringPeriodType)}
                >
                  <option value="all_time">All Time</option>
                  <option value="yearly">This Year</option>
                  <option value="quarterly">This Quarter</option>
                  <option value="monthly">This Month</option>
                  <option value="weekly">This Week</option>
                </select>
              </div>
            </div>
            
            {topContributors.length > 0 ? (
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div 
                    key={contributor.id} 
                    className={`flex items-center p-3 rounded-lg ${
                      contributor.user_id === currentUserId 
                        ? 'bg-blue-50 border border-blue-100' 
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 mr-3 font-semibold">
                      {index + 1}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 overflow-hidden">
                      {contributor.user_avatar_url && (
                        <img 
                          src={contributor.user_avatar_url} 
                          alt={contributor.user_name} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="font-medium">
                        {contributor.user_id === currentUserId ? 'You' : contributor.user_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contributor.total_score} points
                      </div>
                    </div>
                    
                    {contributor.percentile_rank !== null && (
                      <div className="text-xs font-medium text-gray-600">
                        Top {contributor.percentile_rank}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">No contributors data available for this period.</p>
              </div>
            )}
          </div>
          
          {/* How to Earn Points */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Earn Points</h2>
            
            <div className="space-y-3">
              <div>
                <div className="font-medium text-blue-600">Knowledge Sharing</div>
                <p className="text-sm text-gray-600">
                  Share insights, answer questions, and contribute to discussions.
                </p>
              </div>
              
              <div>
                <div className="font-medium text-green-600">Networking</div>
                <p className="text-sm text-gray-600">
                  Make introductions and help connect community members.
                </p>
              </div>
              
              <div>
                <div className="font-medium text-purple-600">Mentorship</div>
                <p className="text-sm text-gray-600">
                  Provide guidance and support to other founders and teams.
                </p>
              </div>
              
              <div>
                <div className="font-medium text-red-600">Community Building</div>
                <p className="text-sm text-gray-600">
                  Organize events, create groups, and foster community engagement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAchievementsPage;
