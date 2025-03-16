import React, { useState } from 'react';

interface NotificationPreferencesStepProps {
  onSelect: (preferences: Record<string, boolean>) => void;
  onSkip?: () => void;
}

const NotificationPreferencesStep: React.FC<NotificationPreferencesStepProps> = ({ onSelect, onSkip }) => {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    product_updates: true,
    community_events: true,
    new_features: true,
    task_reminders: true,
    team_activity: true,
    funding_opportunities: false,
    learning_resources: false,
    market_reports: false
  });

  const togglePreference = (key: string) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const handleContinue = () => {
    onSelect(preferences);
  };

  const notificationTypes = [
    {
      id: 'product_updates',
      title: 'Product Updates',
      description: 'Updates about new features and improvements'
    },
    {
      id: 'community_events',
      title: 'Community Events',
      description: 'Information about upcoming events and webinars'
    },
    {
      id: 'new_features',
      title: 'New Features',
      description: 'Be the first to know when new features are released'
    },
    {
      id: 'task_reminders',
      title: 'Task Reminders',
      description: 'Reminders about upcoming tasks and deadlines'
    },
    {
      id: 'team_activity',
      title: 'Team Activity',
      description: 'Updates about your team members\' activity'
    },
    {
      id: 'funding_opportunities',
      title: 'Funding Opportunities',
      description: 'Information about potential funding sources'
    },
    {
      id: 'learning_resources',
      title: 'Learning Resources',
      description: 'New educational content and resources'
    },
    {
      id: 'market_reports',
      title: 'Market Reports',
      description: 'Reports and insights about market trends'
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
      <p className="mb-6 text-gray-600">
        Choose which notifications you'd like to receive. You can change these settings anytime.
      </p>

      <div className="space-y-4 mb-8">
        {notificationTypes.map(notification => (
          <div
            key={notification.id}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{notification.title}</div>
                <div className="text-sm text-gray-600">{notification.description}</div>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  id={`toggle-${notification.id}`}
                  checked={preferences[notification.id]}
                  onChange={() => togglePreference(notification.id)}
                  className="sr-only"
                />
                <label
                  htmlFor={`toggle-${notification.id}`}
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    preferences[notification.id] ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full transform transition-transform duration-200 ease-in-out ${
                      preferences[notification.id] ? 'translate-x-6 bg-white' : 'translate-x-0 bg-white'
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        {onSkip && (
          <button 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={handleContinue}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition ml-auto"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferencesStep;
