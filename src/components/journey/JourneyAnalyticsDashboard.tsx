import React from 'react';

const JourneyAnalyticsDashboard: React.FC = () => {
  // Mock data for now
  const overallProgress = 65;
  const timePerPhase = [
    { phase: 'Validate', time: '2 weeks', benchmark: '3 weeks' },
    { phase: 'Build', time: '4 weeks', benchmark: '5 weeks' },
    { phase: 'Launch', time: '3 weeks', benchmark: '3 weeks' },
  ];
  const topBottlenecks = [
    'Customer Interviews',
    'Financial Modeling',
    'Beta Testing',
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Journey Analytics Dashboard</h2>
      
      <div>
        <h3 className="text-lg font-semibold">Overall Progress: {overallProgress}%</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${overallProgress}%` }}></div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Time per Phase (vs. Benchmark)</h3>
        <ul className="mt-2 space-y-2">
          {timePerPhase.map(item => (
            <li key={item.phase} className="flex justify-between">
              <span>{item.phase}:</span>
              <span>{item.time} (vs. {item.benchmark})</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Top 3 Bottlenecks</h3>
        <ul className="mt-2 space-y-2">
          {topBottlenecks.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JourneyAnalyticsDashboard;
