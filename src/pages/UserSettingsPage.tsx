import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Link as LinkIcon, 
  Settings, 
  Shield, 
  Calendar,
  Lock,
  Globe,
  Moon,
  Sun,
  Languages,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

// Import calendar-related components
import ExpertAvailabilityManager from '../components/community/ExpertAvailabilityManager';

const UserSettingsPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  
  // Account & Privacy settings
  const [accountSettings, setAccountSettings] = useState({
    email_notifications: true,
    is_public: profile?.is_public || false,
    allows_messages: profile?.allows_messages || false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    theme: 'light',
  });

  // Handle input changes for account settings
  const handleAccountSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Save account settings
  const handleSaveAccountSettings = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_public: accountSettings.is_public,
          allows_messages: accountSettings.allows_messages,
          email_notifications: accountSettings.email_notifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Save user preferences to a separate table (would need to be created)
      // This is a placeholder for future implementation
      /*
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          timezone: accountSettings.timezone,
          language: accountSettings.language,
          theme: accountSettings.theme
        });
      */
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_new_messages: true,
    email_community_updates: true,
    email_system_updates: true,
    in_app_new_messages: true,
    in_app_community_updates: true,
    in_app_system_updates: true
  });

  // Handle input changes for notification settings
  const handleNotificationSettingChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Save notification settings
  const handleSaveNotificationSettings = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // This would save to a notification_preferences table
      // Placeholder for future implementation
      /*
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...notificationSettings
        });
      */
      
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Error saving notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Integration settings
  const [connectedServices, setConnectedServices] = useState({
    google: false,
    microsoft: false,
    slack: false,
    github: false
  });

  // Placeholder for connecting/disconnecting services
  const toggleServiceConnection = (service: string) => {
    setConnectedServices(prev => ({
      ...prev,
      [service]: !prev[service as keyof typeof prev]
    }));
  };

  if (!user) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Account Settings
          </h1>
          
          <Link 
            to="/profile" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Link>
        </div>

        <div className="mt-6">
          <div className="bg-white shadow rounded-lg">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`${
                    activeTab === 'account'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Account & Privacy
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`${
                    activeTab === 'calendar'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar Integration
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`${
                    activeTab === 'notifications'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`${
                    activeTab === 'integrations'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Integrations
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`${
                    activeTab === 'preferences'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Account & Privacy Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 flex items-center">
                      <Lock className="h-5 w-5 mr-2" />
                      Account Security
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <div className="mt-1 flex items-center">
                          <span className="block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 sm:text-sm">
                            {user.email}
                          </span>
                          <button 
                            className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() => alert('Email change functionality would be implemented here')}
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <button 
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          onClick={() => alert('Password change functionality would be implemented here')}
                        >
                          Change Password
                        </button>
                      </div>
                      
                      <div>
                        <button 
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          onClick={() => alert('Two-factor authentication would be implemented here')}
                        >
                          Enable Two-Factor Authentication
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Privacy Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_public"
                          name="is_public"
                          checked={accountSettings.is_public}
                          onChange={handleAccountSettingChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                          Make my profile public
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allows_messages"
                          name="allows_messages"
                          checked={accountSettings.allows_messages}
                          onChange={handleAccountSettingChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="allows_messages" className="ml-2 block text-sm text-gray-900">
                          Allow other users to message me
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email_notifications"
                          name="email_notifications"
                          checked={accountSettings.email_notifications}
                          onChange={handleAccountSettingChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-900">
                          Receive email notifications
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAccountSettings}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Calendar Integration Tab */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Calendar Integration
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your calendar to manage your availability and schedule appointments. 
                    You can connect to Google Calendar, Office 365, or set your availability manually.
                  </p>
                  
                  {/* Reuse the ExpertAvailabilityManager component */}
                  {user?.id && <ExpertAvailabilityManager expertId={user.id} />}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-2">Email Notifications</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="email_new_messages"
                            name="email_new_messages"
                            checked={notificationSettings.email_new_messages}
                            onChange={handleNotificationSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="email_new_messages" className="ml-2 block text-sm text-gray-900">
                            New messages
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="email_community_updates"
                            name="email_community_updates"
                            checked={notificationSettings.email_community_updates}
                            onChange={handleNotificationSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="email_community_updates" className="ml-2 block text-sm text-gray-900">
                            Community updates
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="email_system_updates"
                            name="email_system_updates"
                            checked={notificationSettings.email_system_updates}
                            onChange={handleNotificationSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="email_system_updates" className="ml-2 block text-sm text-gray-900">
                            System updates
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-2">In-App Notifications</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="in_app_new_messages"
                            name="in_app_new_messages"
                            checked={notificationSettings.in_app_new_messages}
                            onChange={handleNotificationSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="in_app_new_messages" className="ml-2 block text-sm text-gray-900">
                            New messages
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="in_app_community_updates"
                            name="in_app_community_updates"
                            checked={notificationSettings.in_app_community_updates}
                            onChange={handleNotificationSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="in_app_community_updates" className="ml-2 block text-sm text-gray-900">
                            Community updates
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="in_app_system_updates"
                            name="in_app_system_updates"
                            checked={notificationSettings.in_app_system_updates}
                            onChange={handleNotificationSettingChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="in_app_system_updates" className="ml-2 block text-sm text-gray-900">
                            System updates
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotificationSettings}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2" />
                    External Integrations
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Google</h4>
                          <p className="text-xs text-gray-500">Connect to Google services</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleServiceConnection('google')}
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          connectedServices.google
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {connectedServices.google ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.174,3.468H11.995V20.53h11.179c0.45,0,0.826-0.375,0.826-0.827V4.295C24,3.843,23.623,3.468,23.174,3.468z M8.326,20.53V3.468H0.826C0.375,3.468,0,3.843,0,4.295v15.408c0,0.452,0.375,0.827,0.826,0.827H8.326z"/>
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Microsoft</h4>
                          <p className="text-xs text-gray-500">Connect to Microsoft services</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleServiceConnection('microsoft')}
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          connectedServices.microsoft
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {connectedServices.microsoft ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-md">
                          <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Slack</h4>
                          <p className="text-xs text-gray-500">Connect to Slack workspace</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleServiceConnection('slack')}
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          connectedServices.slack
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {connectedServices.slack ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-md">
                          <svg className="h-6 w-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">GitHub</h4>
                          <p className="text-xs text-gray-500">Connect to GitHub repositories</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleServiceConnection('github')}
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          connectedServices.github
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {connectedServices.github ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Application Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                        Theme
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="theme-light"
                            name="theme"
                            value="light"
                            checked={accountSettings.theme === 'light'}
                            onChange={handleAccountSettingChange}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="theme-light" className="ml-2 flex items-center text-sm text-gray-900">
                            <Sun className="h-4 w-4 mr-1" />
                            Light
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="theme-dark"
                            name="theme"
                            value="dark"
                            checked={accountSettings.theme === 'dark'}
                            onChange={handleAccountSettingChange}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="theme-dark" className="ml-2 flex items-center text-sm text-gray-900">
                            <Moon className="h-4 w-4 mr-1" />
                            Dark
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="theme-system"
                            name="theme"
                            value="system"
                            checked={accountSettings.theme === 'system'}
                            onChange={handleAccountSettingChange}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="theme-system" className="ml-2 text-sm text-gray-900">
                            System
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <div className="flex items-center">
                        <Languages className="h-5 w-5 text-gray-400 mr-2" />
                        <select
                          id="language"
                          name="language"
                          value={accountSettings.language}
                          onChange={handleAccountSettingChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="zh">中文</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <select
                          id="timezone"
                          name="timezone"
                          value={accountSettings.timezone}
                          onChange={handleAccountSettingChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                          <option value="Australia/Sydney">Sydney</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAccountSettings}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
