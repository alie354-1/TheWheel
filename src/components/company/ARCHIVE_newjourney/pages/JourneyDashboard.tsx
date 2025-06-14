import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompany } from '../../../../lib/hooks/useCompany';
import { newCompanyJourneyService } from '../../../../lib/services/newCompanyJourney.service';
import { newJourneyFeaturesService } from '../../../../lib/services/newJourneyFeatures.service';
// Removing the import that's causing an error since we're not using these types
import { Typography, Button, Paper, Checkbox, FormControlLabel, TextField } from '@mui/material';

// Placeholder for the real stats type
interface JourneyStats {
  total: number;
  active: number;
  complete: number;
  urgent: number;
}

const DashboardSidebar: React.FC<{ stats: JourneyStats }> = ({ stats }) => (
  <aside className="w-1/4 p-4 bg-gray-50 rounded">
    <div className="mb-6">
      <h3 className="font-bold text-lg mb-2">Stats</h3>
      <p>Total: {stats.total}</p>
      <p>Active: {stats.active}</p>
      <p>Complete: {stats.complete}</p>
      <p>Urgent: {stats.urgent}</p>
    </div>
    <div>
      <h3 className="font-bold text-lg mb-2">Filters</h3>
      <TextField fullWidth label="Search..." variant="outlined" size="small" className="mb-4" />
      <FormControlLabel control={<Checkbox />} label="Urgent" />
      <FormControlLabel control={<Checkbox />} label="Started" />
      <FormControlLabel control={<Checkbox />} label="Blocked" />
    </div>
    <Button variant="contained" component={Link} to="/company/journey/browse" className="w-full mt-6">
      Browse All Steps
    </Button>
  </aside>
);

const RecommendedNextStep: React.FC<{ recommendation?: any }> = ({ recommendation }) => (
  <Paper className="p-4 mb-6">
    <h3 className="font-bold text-lg mb-2">Recommended Next Step</h3>
    {recommendation ? (
      <div>
        <p className="font-semibold">{recommendation.title}</p>
        <p>{recommendation.description}</p>
        <Button variant="contained" size="small" className="mt-2">Start Step</Button>
      </div>
    ) : (
      <p>No recommendations available right now.</p>
    )}
  </Paper>
);

const PeerInsights: React.FC<{ insights?: any }> = ({ insights }) => (
  <Paper className="p-4 mb-6">
    <h3 className="font-bold text-lg mb-2">Peer Insights</h3>
    {insights ? (
      <div>
        <p>{insights.peerPercentage}% of peers spent {insights.weeks} weeks on interviews</p>
        <p>Top tool: {insights.topTool} ({insights.usage}%)</p>
      </div>
    ) : (
      <p>No peer insights available for this step yet.</p>
    )}
  </Paper>
);

// Updated YourProgress component that uses maturity levels instead of percentages
const YourProgress: React.FC<{ progress?: any }> = ({ progress }) => (
  <Paper className="p-4">
    <h3 className="font-bold text-lg mb-2">Your Journey</h3>
    <p className="mb-4 text-sm text-gray-600">
      Your startup journey is never complete. Continue to evolve and grow across all domains.
    </p>
    {progress ? (
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Strategy</span>
          <span className="font-medium text-blue-600">Refining</span>
        </div>
        <div className="flex justify-between">
          <span>Product</span>
          <span className="font-medium text-green-600">Practicing</span>
        </div>
        <div className="flex justify-between">
          <span>Marketing</span>
          <span className="font-medium text-purple-600">Learning</span>
        </div>
        <div className="flex justify-between">
          <span>Operations</span>
          <span className="font-medium text-gray-500">Exploring</span>
        </div>
      </div>
    ) : (
      <p>No progress to show yet.</p>
    )}
  </Paper>
);

const JourneyDashboard: React.FC = () => {
  const { currentCompany } = useCompany();
  const [stats, setStats] = useState<JourneyStats>({ total: 0, active: 0, complete: 0, urgent: 0 });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = currentCompany?.id;
    if (!companyId) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // This is where we will fetch the real data from the services
        // For now, we'll use mock data that matches the wireframe
        setStats({ total: 24, active: 5, complete: 12, urgent: 2 });
        setRecommendation({
          title: 'Run Customer Interviews',
          description: 'based on completion of market research'
        });
        setInsights({
          peerPercentage: 68,
          weeks: 2,
          topTool: 'Zoom',
          usage: 83
        });
        // This now represents maturity levels rather than percentages
        setProgress({
          domains: [
            { name: 'Strategy', level: 'Refining', state: 'maintaining' },
            { name: 'Product', level: 'Practicing', state: 'active_focus' },
            { name: 'Marketing', level: 'Learning', state: 'active_focus' },
            { name: 'Operations', level: 'Exploring', state: 'future_focus' }
          ]
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentCompany]);

  if (loading) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  if (!currentCompany) {
    return (
      <div className="p-6">
        <Typography variant="h5">Welcome to the Journey System!</Typography>
        <Typography>It looks like you haven't been assigned to a company yet. Please contact an administrator to get set up.</Typography>
      </div>
    );
  }

  return (
    <div className="flex p-6 gap-6">
      <DashboardSidebar stats={stats} />
      <main className="flex-1">
        <Typography variant="h4" className="mb-6">Journey Dashboard</Typography>
        <RecommendedNextStep recommendation={recommendation} />
        <PeerInsights insights={insights} />
        <YourProgress progress={progress} />
      </main>
    </div>
  );
};

export default JourneyDashboard;
