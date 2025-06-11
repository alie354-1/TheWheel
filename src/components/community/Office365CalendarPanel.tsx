import React, { useState, useEffect } from 'react';
import { Calendar, Check, ExternalLink, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/utils/toast';

interface Office365CalendarPanelProps {
  expertId: string;
  onDisconnect?: () => void;
}

const Office365CalendarPanel: React.FC<Office365CalendarPanelProps> = ({ expertId, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState<string | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, [expertId]);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('office365_calendar_credentials, integration_type')
        .eq('user_id', expertId)
        .single();

      if (error) {
        console.error('Error checking connection status:', error);
        return;
      }

      const isOffice365Connected = 
        data?.integration_type === 'office365_calendar' && 
        data?.office365_calendar_credentials !== null;
      
      setIsConnected(isOffice365Connected);
      
      if (isOffice365Connected && data?.office365_calendar_credentials) {
        // In a real implementation, we would decrypt the credentials
        // and extract the email from the token payload
        // For now, we'll use a placeholder
        setCalendarEmail(data.office365_calendar_credentials.email || 'your.email@outlook.com');
      } else {
        setCalendarEmail(null);
      }
    } catch (error) {
      console.error('Error in checkConnectionStatus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // In a real implementation, we would:
      // 1. Get the app credentials from app_settings
      // 2. Generate an OAuth URL with the correct scopes
      // 3. Redirect the user to the OAuth URL
      // 4. Handle the callback in a separate route
      
      // For now, we'll simulate the OAuth flow with a mock implementation
      setIsLoading(true);
      
      // Simulate a delay for the OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock credentials that would be returned from Microsoft
      const mockCredentials = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expiry_date: Date.now() + 3600000, // 1 hour from now
        email: 'your.email@outlook.com',
        scope: 'Calendars.Read Calendars.ReadWrite'
      };
      
      // Update the expert profile with the mock credentials
      const { error } = await supabase.rpc('connect_office365_calendar', {
        p_expert_id: expertId,
        p_credentials: mockCredentials
      });
      
      if (error) {
        console.error('Error connecting Office 365 Calendar:', error);
        toast.error('Failed to connect Office 365 Calendar', 'Please try again later.');
        return;
      }
      
      setIsConnected(true);
      setCalendarEmail('your.email@outlook.com');
      toast.success('Office 365 Calendar Connected', 'Your calendar has been successfully connected.');
      
      // Refresh the connection status
      checkConnectionStatus();
    } catch (error) {
      console.error('Error in handleConnect:', error);
      toast.error('Connection Error', 'Failed to connect Office 365 Calendar. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      // Call the disconnect_office365_calendar function
      const { error } = await supabase.rpc('disconnect_office365_calendar', {
        p_expert_id: expertId
      });
      
      if (error) {
        console.error('Error disconnecting Office 365 Calendar:', error);
        toast.error('Failed to disconnect Office 365 Calendar', 'Please try again later.');
        return;
      }
      
      setIsConnected(false);
      setCalendarEmail(null);
      toast.success('Office 365 Calendar Disconnected', 'Your calendar has been successfully disconnected.');
      
      // Call the onDisconnect callback if provided
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
      toast.error('Disconnection Error', 'Failed to disconnect Office 365 Calendar. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Office 365 Calendar Integration
        </h3>
        
        <div className="prose prose-sm text-gray-500 mb-6">
          <p>
            Connect your Office 365 Calendar to automatically sync your availability.
            When connected, we'll check your Office 365 Calendar for conflicts when clients
            try to book appointments with you.
          </p>
        </div>
        
        {isConnected ? (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Connected to Office 365 Calendar
                </p>
                {calendarEmail && (
                  <p className="mt-1 text-sm text-green-700">
                    Using calendar: {calendarEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Not connected to Office 365 Calendar
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Connect your calendar to automatically sync your availability
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Disconnecting...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Disconnect Office 365 Calendar
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Connect Office 365 Calendar
              </>
            )}
          </button>
        )}
        
        <div className="mt-6 text-xs text-gray-500">
          <p className="flex items-center">
            <ExternalLink className="h-3 w-3 mr-1" />
            <a 
              href="https://outlook.office.com/calendar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-900"
            >
              Open Office 365 Calendar
            </a>
          </p>
        </div>
      </div>
      
      {isConnected && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-md leading-6 font-medium text-gray-900 mb-4">
            Sync Settings
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="buffer_time" className="block text-sm font-medium text-gray-700">
                Buffer Time (minutes)
              </label>
              <select
                id="buffer_time"
                name="buffer_time"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                defaultValue="15"
              >
                <option value="0">No buffer</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Add buffer time before and after appointments to prevent back-to-back bookings
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sync_all_calendars"
                  name="sync_all_calendars"
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sync_all_calendars" className="font-medium text-gray-700">
                  Sync all calendars
                </label>
                <p className="text-gray-500">
                  Check availability across all your Office 365 Calendars
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Office365CalendarPanel;
