import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Link as LinkIcon, Check, X, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from '@/lib/utils/toast';

interface CalendlyPanelProps {
  expertId: string;
  onUpdate?: () => void;
  onDisconnect?: () => void;
}

/**
 * Component for connecting and managing Calendly integration
 */
const CalendlyPanel: React.FC<CalendlyPanelProps> = ({ expertId, onUpdate, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [eventLink, setEventLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // Load the expert's Calendly configuration
  useEffect(() => {
    const loadCalendlyConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('expert_profiles')
          .select('calendly_config, integration_type')
          .eq('user_id', expertId)
          .single();

        if (error) {
          console.error('Error fetching Calendly config:', error);
          setError('Failed to load Calendly configuration');
          return;
        }

        if (data?.integration_type === 'calendly' && data?.calendly_config) {
          try {
            const config = JSON.parse(data.calendly_config);
            setEventLink(config.event_link || '');
            setConnectedEmail(config.email || null);
            setIsConnected(true);
          } catch (e: any) {
            console.error('Error parsing Calendly config:', e);
            setError('Invalid Calendly configuration');
          }
        }
      } catch (e: any) {
        console.error('Error in loadCalendlyConfig:', e);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendlyConfig();
  }, [expertId]);

  // Connect Calendly
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate the event link
      if (!eventLink) {
        setError('Please enter your Calendly event link');
        return;
      }

      if (!eventLink.includes('calendly.com')) {
        setError('Please enter a valid Calendly event link');
        return;
      }

      // Extract email from the event link (this is a simplified approach)
      const emailMatch = eventLink.match(/calendly\.com\/([^\/]+)/);
      const email = emailMatch ? `${emailMatch[1]}@example.com` : null;

      // Create the Calendly configuration
      const calendlyConfig = JSON.stringify({
        event_link: eventLink,
        email: email,
        connected_at: new Date().toISOString()
      });

      // Update the expert's profile
      const { error: updateError } = await supabase
        .from('expert_profiles')
        .update({
          integration_type: 'calendly',
          calendly_config: calendlyConfig
        })
        .eq('user_id', expertId);

      if (updateError) {
        console.error('Error updating expert profile:', updateError);
        setError('Failed to connect Calendly');
        return;
      }

      setIsConnected(true);
      setConnectedEmail(email);
      
      toast.success('Calendly Connected', 'Your Calendly account has been successfully connected.');

      if (onUpdate) {
        onUpdate();
      }
    } catch (e: any) {
      console.error('Error in handleConnect:', e);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect Calendly
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Update the expert's profile
      const { error: updateError } = await supabase
        .from('expert_profiles')
        .update({
          integration_type: 'manual',
          calendly_config: null
        })
        .eq('user_id', expertId);

      if (updateError) {
        console.error('Error updating expert profile:', updateError);
        setError('Failed to disconnect Calendly');
        return;
      }

      setIsConnected(false);
      setEventLink('');
      setConnectedEmail(null);
      
      toast.success('Calendly Disconnected', 'Your Calendly account has been disconnected.');

      if (onUpdate) {
        onUpdate();
      }
      
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (e: any) {
      console.error('Error in handleDisconnect:', e);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
          Calendly Integration
        </h3>
        
        <div className="prose prose-sm text-gray-500 mb-6">
          <p>
            Connect your Calendly account to manage your availability and appointments.
            Your Calendly settings will determine your available time slots.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <div className="flex">
              <X className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {isConnected ? (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Connected to Calendly
                </p>
                {connectedEmail && (
                  <p className="mt-1 text-sm text-green-700">
                    Account: {connectedEmail}
                  </p>
                )}
                <p className="mt-1 text-sm text-green-700">
                  Event Link: <a href={eventLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">{eventLink}</a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="calendly-link" className="block text-sm font-medium text-gray-700 mb-1">
                Calendly Event Link
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="calendly-link"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://calendly.com/yourusername/30min"
                  value={eventLink}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventLink(e.target.value)}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter the link to your Calendly event that clients will use to book appointments with you.
              </p>
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
                Disconnect Calendly
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Connect Calendly
              </>
            )}
          </button>
        )}
        
        <div className="mt-6 text-xs text-gray-500">
          <p className="flex items-center">
            <ExternalLink className="h-3 w-3 mr-1" />
            <a 
              href="https://calendly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-900"
            >
              Open Calendly
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendlyPanel;
