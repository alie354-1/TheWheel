import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Target,
  AlertCircle,
  Clock
} from 'lucide-react';

interface StandupEntry {
  id: string;
  date: string;
  accomplished: string;
  working_on: string;
  blockers: string;
  goals: string;
  feedback: string;
  answers: Record<string, string>;
}

interface StandupHistoryProps {
  entries: StandupEntry[];
}

const StandupHistory: React.FC<StandupHistoryProps> = ({ entries }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'accomplished' | 'working_on' | 'goals'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    hasBlockers: false,
    dateRange: 'all' as 'all' | 'week' | 'month' | 'quarter'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<StandupEntry[]>(entries);

  useEffect(() => {
    applyFiltersAndSort();
  }, [entries, searchQuery, sortField, sortDirection, filters]);

  const toggleEntry = (entryId: string) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...entries];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.accomplished.toLowerCase().includes(query) ||
        entry.working_on.toLowerCase().includes(query) ||
        entry.blockers?.toLowerCase().includes(query) ||
        entry.goals.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.hasBlockers) {
      filtered = filtered.filter(entry => entry.blockers && entry.blockers.trim().length > 0);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (filters.dateRange) {
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoff.setMonth(now.getMonth() - 3);
          break;
      }
      filtered = filtered.filter(entry => new Date(entry.date) >= cutoff);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        default:
          comparison = b[sortField].localeCompare(a[sortField]);
      }
      return sortDirection === 'asc' ? -comparison : comparison;
    });

    setFilteredEntries(filtered);
  };

  if (!entries.length) {
    return (
      <div className="bg-base-100 shadow-md rounded-lg p-4">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-base-content/50" />
          <h3 className="mt-2 text-sm font-medium text-base-content">No standup history</h3>
          <p className="mt-1 text-sm text-base-content/70">
            Start your day by sharing your progress and goals.
          </p>
          <div className="mt-6">
            <Link
              to="/idea-hub/cofounder-bot"
              className="btn btn-primary btn-sm"
            >
              Start Daily Standup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-md rounded-lg">
      <div className="px-4 py-3 border-b border-base-300">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-lg font-medium text-base-content"
          >
            <Calendar className="h-5 w-5 mr-2 text-base-content/60" />
            Recent Standups
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 ml-2 text-base-content/60" />
            ) : (
              <ChevronRight className="h-5 w-5 ml-2 text-base-content/60" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          {/* Search and Filters */}
          <div className="px-4 py-3 border-b border-base-300 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-base-content/50" />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search standups..."
                    className="block w-full pl-10 pr-3 py-2 border border-base-300 rounded-md leading-5 bg-base-100 placeholder-base-content/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-sm btn-outline"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasBlockers}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasBlockers: e.target.checked }))}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                  <span className="ml-2 text-sm text-base-content">Has Blockers</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-base-content">Date Range:</span>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as typeof filters.dateRange }))}
                    className="select select-sm select-bordered text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="quarter">Past Quarter</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-base-content">Sort By:</span>
                  <select
                    value={sortField}
                    onChange={(e) => toggleSort(e.target.value as typeof sortField)}
                    className="select select-sm select-bordered text-sm"
                  >
                    <option value="date">Date</option>
                    <option value="accomplished">Accomplishments</option>
                    <option value="working_on">Current Work</option>
                    <option value="goals">Goals</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 rounded-md hover:bg-base-200"
                  >
                    {sortDirection === 'asc' ? (
                      <SortAsc className="h-4 w-4 text-base-content/60" />
                    ) : (
                      <SortDesc className="h-4 w-4 text-base-content/60" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Standup Entries */}
          <div className="divide-y divide-base-300">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="p-4">
                <button
                  onClick={() => toggleEntry(entry.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <h4 className="text-sm font-medium text-base-content">
                      {new Date(entry.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    {!expandedEntries[entry.id] && (
                      <p className="mt-1 text-sm text-base-content/70 line-clamp-2">
                        {entry.working_on}
                      </p>
                    )}
                  </div>
                  {expandedEntries[entry.id] ? (
                    <ChevronDown className="h-5 w-5 text-base-content/60" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-base-content/60" />
                  )}
                </button>

                {expandedEntries[entry.id] && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-base-content flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2 text-base-content/60" />
                        Accomplished
                      </h5>
                      <p className="mt-1 text-sm text-base-content/70">{entry.accomplished}</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-base-content flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-base-content/60" />
                        Working On
                      </h5>
                      <p className="mt-1 text-sm text-base-content/70">{entry.working_on}</p>
                    </div>

                    {entry.blockers && (
                      <div>
                        <h5 className="text-sm font-medium text-base-content flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-base-content/60" />
                          Blockers
                        </h5>
                        <p className="mt-1 text-sm text-base-content/70">{entry.blockers}</p>
                      </div>
                    )}

                    <div>
                      <h5 className="text-sm font-medium text-base-content flex items-center">
                        <Target className="h-4 w-4 mr-2 text-base-content/60" />
                        Goals
                      </h5>
                      <p className="mt-1 text-sm text-base-content/70">{entry.goals}</p>
                    </div>

                    {entry.feedback && (
                      <div>
                        <h5 className="text-sm font-medium text-base-content">AI Analysis</h5>
                        <div className="mt-1 text-sm text-base-content/70 whitespace-pre-wrap rounded-lg bg-base-200 p-4">
                          {(() => {
                            try {
                              console.log("[StandupHistory] Parsing feedback for entry", entry.id);
                              
                              // First check if feedback is valid JSON
                              let feedbackObj;
                              try {
                                feedbackObj = JSON.parse(entry.feedback);
                              } catch (parseError) {
                                console.error("[StandupHistory] JSON parse error:", parseError);
                                // Return raw feedback if parsing fails
                                return entry.feedback || "No analysis available";
                              }
                              
                              // Make sure we have insights object and it's properly formed
                              if (!feedbackObj || !feedbackObj.insights) {
                                console.warn("[StandupHistory] Missing insights in feedback", feedbackObj);
                                return "Analysis data format error. Raw feedback: " + entry.feedback;
                              }
                              
                              const insights = feedbackObj.insights;
                              
                              // Ensure all expected arrays exist
                              const strengths = Array.isArray(insights.strengths) ? insights.strengths : [];
                              const areas = Array.isArray(insights.areas_for_improvement) ? insights.areas_for_improvement : [];
                              const opportunities = Array.isArray(insights.opportunities) ? insights.opportunities : [];
                              const risks = Array.isArray(insights.risks) ? insights.risks : [];
                              const recommendations = Array.isArray(insights.strategic_recommendations) ? 
                                insights.strategic_recommendations : [];
                              
                              return `🎯 Key Insights

${strengths.length > 0 ? `Strengths:
${strengths.map((s: string) => `• ${s}`).join('\n')}

` : ''}${areas.length > 0 ? `Areas for Improvement:
${areas.map((a: string) => `• ${a}`).join('\n')}

` : ''}${opportunities.length > 0 ? `Opportunities:
${opportunities.map((o: string) => `• ${o}`).join('\n')}

` : ''}${risks.length > 0 ? `Risks:
${risks.map((r: string) => `• ${r}`).join('\n')}

` : ''}${recommendations.length > 0 ? `Strategic Recommendations:
${recommendations.map((r: string) => `• ${r}`).join('\n')}` : ''}`;
                            } catch (e) {
                              console.error("[StandupHistory] Error rendering feedback:", e);
                              return 'Error displaying analysis.';
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StandupHistory;
