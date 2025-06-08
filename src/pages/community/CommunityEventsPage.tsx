import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { eventService } from '../../lib/services/community';
import { CommunityEvent, CommunityEventFilters, EventRegistration, PaginationParams } from '../../lib/types/community.types';

/**
 * Community Events Page
 * 
 * Displays a list of community events with filtering and pagination.
 * Also handles single event view when an eventId is provided.
 */
const CommunityEventsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<CommunityEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CommunityEventFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    page_size: 9
  });
  const [totalPages, setTotalPages] = useState(1);
  const [userRegistered, setUserRegistered] = useState(false);

  // Fetch single event or list of events based on presence of eventId
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (eventId) {
          // Fetch single event and its registrations
          const [event, eventRegistrations] = await Promise.all([
            eventService.getEvent(eventId),
            eventService.getEventRegistrations(eventId)
          ]);
          
          setCurrentEvent(event);
          setRegistrations(eventRegistrations);
          setEvents([]);
          
          // Check if current user is registered (in a real app, you would get the current user ID from auth context)
          const currentUserId = 'current-user-id';
          setUserRegistered(eventRegistrations.some(reg => reg.user_id === currentUserId && reg.status !== 'cancelled'));
        } else {
          // Fetch list of events
          const response = await eventService.getEvents(filters, pagination);
          setEvents(response.data);
          setTotalPages(response.total_pages);
          setCurrentEvent(null);
          setRegistrations([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, filters, pagination]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CommunityEventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle event registration
  const handleRegister = async () => {
    if (!currentEvent) return;
    
    try {
      // In a real app, you would get the current user ID from auth context
      const currentUserId = 'current-user-id';
      
      await eventService.registerForEvent(currentEvent.id, currentUserId);
      setUserRegistered(true);
      
      // Refresh registrations
      const updatedRegistrations = await eventService.getEventRegistrations(currentEvent.id);
      setRegistrations(updatedRegistrations);
    } catch (err) {
      console.error('Error registering for event:', err);
      setError('Failed to register for event. Please try again.');
    }
  };

  // Handle cancelling registration
  const handleCancelRegistration = async () => {
    if (!currentEvent) return;
    
    try {
      // In a real app, you would get the current user ID from auth context
      const currentUserId = 'current-user-id';
      
      await eventService.cancelRegistration(currentEvent.id, currentUserId);
      setUserRegistered(false);
      
      // Refresh registrations
      const updatedRegistrations = await eventService.getEventRegistrations(currentEvent.id);
      setRegistrations(updatedRegistrations);
    } catch (err) {
      console.error('Error cancelling registration:', err);
      setError('Failed to cancel registration. Please try again.');
    }
  };

  // Format date and time
  const formatDateTime = (dateString: string, timezone: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    return new Date(dateString).toLocaleString('en-US', options);
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

  // Single event view
  if (currentEvent) {
    const isUpcoming = new Date(currentEvent.start_date) > new Date();
    const isOngoing = new Date(currentEvent.start_date) <= new Date() && new Date(currentEvent.end_date) >= new Date();
    const isPast = new Date(currentEvent.end_date) < new Date();
    const isFull = currentEvent.max_attendees !== null && 
                  currentEvent.max_attendees !== undefined && 
                  (currentEvent.attendee_count || 0) >= currentEvent.max_attendees;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/community/events" className="text-blue-600 hover:text-blue-800">
            ← Back to all events
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentEvent.title}</h1>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-line">{currentEvent.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Event Details</h3>
              <div className="space-y-2">
                <div>
                  <div className="font-medium">Start</div>
                  <div>{formatDateTime(currentEvent.start_date, currentEvent.timezone)}</div>
                </div>
                <div>
                  <div className="font-medium">End</div>
                  <div>{formatDateTime(currentEvent.end_date, currentEvent.timezone)}</div>
                </div>
                <div>
                  <div className="font-medium">Location</div>
                  <div>
                    {currentEvent.event_format === 'virtual' 
                      ? 'Virtual Event' 
                      : currentEvent.event_format === 'hybrid'
                      ? 'Hybrid Event (In-person & Virtual)'
                      : 'In-person Event'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Organizer</div>
                  <div>{currentEvent.organizer_name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="font-medium">Attendees</div>
                  <div>{currentEvent.attendee_count || 0} registered</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration</h3>
              
              {isUpcoming && !isPast && (
                <>
                  {userRegistered ? (
                    <div>
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                        <div className="font-bold">You're registered!</div>
                        <p className="text-sm">We look forward to seeing you at the event.</p>
                      </div>
                      <button
                        onClick={handleCancelRegistration}
                        className="w-full bg-white border border-red-500 text-red-500 hover:bg-red-50 font-medium py-2 px-4 rounded"
                      >
                        Cancel Registration
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleRegister}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                      >
                        {isFull ? 'Join Waitlist' : 'Register Now'}
                      </button>
                    </div>
                  )}
                </>
              )}
              
              {isOngoing && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  <div className="font-bold">Event is happening now!</div>
                </div>
              )}
              
              {isPast && (
                <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded">
                  <div className="font-bold">Event has ended</div>
                </div>
              )}
            </div>
          </div>
          
          {registrations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Attendees ({registrations.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {registrations.map((registration) => (
                  <div key={registration.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                    <div>
                      <div className="font-medium">Anonymous</div>
                      <div className="text-xs text-gray-500">{registration.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Events list view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Events</h1>
        <p className="text-gray-600">Join events, connect with others, and grow your network.</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="event-type"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.event_type || ''}
              onChange={(e) => handleFilterChange({ 
                event_type: e.target.value ? (e.target.value as any) : undefined 
              })}
            >
              <option value="">All Types</option>
              <option value="forge_session">Forge Session</option>
              <option value="breakthrough_board">Breakthrough Board</option>
              <option value="demo_day">Demo Day</option>
              <option value="think_tank">Think Tank</option>
              <option value="networking">Networking</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="event-format" className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              id="event-format"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filters.event_format || ''}
              onChange={(e) => handleFilterChange({ 
                event_format: e.target.value ? (e.target.value as any) : undefined 
              })}
            >
              <option value="">All Formats</option>
              <option value="virtual">Virtual</option>
              <option value="in_person">In Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search events..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              value={filters.search_term || ''}
              onChange={(e) => handleFilterChange({ search_term: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mb-6">
        <Link 
          to="/community/events/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Link>
      </div>
      
      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {events.map((event) => {
            const isUpcoming = new Date(event.start_date) > new Date();
            const isOngoing = new Date(event.start_date) <= new Date() && new Date(event.end_date) >= new Date();
            const isPast = new Date(event.end_date) < new Date();
            
            return (
              <div key={event.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col">
                <div className={`p-2 text-center text-sm font-medium ${
                  isOngoing 
                    ? 'bg-green-100 text-green-800' 
                    : isUpcoming
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isOngoing ? 'Happening Now' : isUpcoming ? 'Upcoming' : 'Past Event'}
                </div>
                
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    <Link to={`/community/events/${event.id}`} className="hover:text-blue-600">
                      {event.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <div className="mb-1">
                      <span className="font-medium">Date:</span> {new Date(event.start_date).toLocaleDateString()}
                    </div>
                    <div className="mb-1">
                      <span className="font-medium">Time:</span> {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> {event.event_format}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/community/events/${event.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Event Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or create a new event.</p>
          <Link 
            to="/community/events/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-block"
          >
            Create Event
          </Link>
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

export default CommunityEventsPage;
