import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/utils/toast';
import { availabilityService, ExpertAvailability } from '@/lib/services/availability.service';
import { Tabs, Tab } from '@/components/ui/Tabs';
import { Calendar, Mail, Clock, Link } from 'lucide-react';
import GoogleCalendarPanel from './GoogleCalendarPanel';
import Office365CalendarPanel from './Office365CalendarPanel';
import CalendlyPanel from './CalendlyPanel';
import { supabase } from '@/lib/supabase';

interface ExpertAvailabilityManagerProps {
  expertId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const hourFormatted = hour.toString().padStart(2, '0');
  const minuteFormatted = minute.toString().padStart(2, '0');
  return {
    value: `${hourFormatted}:${minuteFormatted}`,
    label: `${hour % 12 || 12}:${minuteFormatted} ${hour < 12 ? 'AM' : 'PM'}`,
  };
});

const ExpertAvailabilityManager: React.FC<ExpertAvailabilityManagerProps> = ({ expertId }) => {
  const [availabilitySlots, setAvailabilitySlots] = useState<ExpertAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [integrationType, setIntegrationType] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6, // Default to Monday
    start_time: '09:00',
    end_time: '17:00',
  });

  useEffect(() => {
    loadAvailability();
    checkIntegrationType();
  }, [expertId]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const slots = await availabilityService.getExpertAvailability(expertId);
      setAvailabilitySlots(slots);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Error', 'Failed to load availability settings.');
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrationType = async () => {
    setIntegrationLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('integration_type')
        .eq('user_id', expertId)
        .single();

      if (error) {
        console.error('Error fetching integration type:', error);
        return;
      }

      setIntegrationType(data?.integration_type || 'manual');
      setActiveTab(data?.integration_type || 'manual');
    } catch (error) {
      console.error('Error checking integration type:', error);
    } finally {
      setIntegrationLoading(false);
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    // Update the integration type in the database
    try {
      const { error } = await supabase
        .from('expert_profiles')
        .update({ integration_type: value })
        .eq('user_id', expertId);

      if (error) {
        console.error('Error updating integration type:', error);
        toast.error('Error', 'Failed to update integration type.');
        return;
      }

      setIntegrationType(value);
      toast.success('Integration Updated', 'Your availability integration has been updated.');
    } catch (error) {
      console.error('Error updating integration type:', error);
      toast.error('Error', 'Failed to update integration type.');
    }
  };

  const handleAddSlot = async () => {
    if (newSlot.start_time >= newSlot.end_time) {
      toast.error('Invalid Time Range', 'End time must be after start time.');
      return;
    }

    // Check for overlapping slots
    const overlappingSlot = availabilitySlots.find(
      slot => 
        slot.day_of_week === newSlot.day_of_week &&
        ((newSlot.start_time >= slot.start_time && newSlot.start_time < slot.end_time) ||
         (newSlot.end_time > slot.start_time && newSlot.end_time <= slot.end_time) ||
         (newSlot.start_time <= slot.start_time && newSlot.end_time >= slot.end_time))
    );

    if (overlappingSlot) {
      toast.error('Time Slot Overlap', 'This time slot overlaps with an existing availability slot.');
      return;
    }

    setSaving(true);
    try {
      await availabilityService.setExpertAvailability(
        expertId,
        newSlot.day_of_week,
        newSlot.start_time,
        newSlot.end_time,
        true
      );
      
      toast.success('Availability Added', 'Your availability slot has been added.');
      await loadAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      toast.error('Error', 'Failed to add availability slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    setSaving(true);
    try {
      await availabilityService.deleteAvailability(slotId);
      toast.success('Availability Removed', 'Your availability slot has been removed.');
      await loadAvailability();
    } catch (error) {
      console.error('Error removing availability:', error);
      toast.error('Error', 'Failed to remove availability slot.');
    } finally {
      setSaving(false);
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      return `${hour % 12 || 12}:${minutes} ${hour < 12 ? 'AM' : 'PM'}`;
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const handleCalendarDisconnect = () => {
    // Refresh the integration type after disconnecting
    checkIntegrationType();
  };

  if (loading || integrationLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'google_calendar':
        return <GoogleCalendarPanel expertId={expertId} onDisconnect={handleCalendarDisconnect} />;
      case 'office365_calendar':
        return <Office365CalendarPanel expertId={expertId} onDisconnect={handleCalendarDisconnect} />;
      case 'calendly':
        return <CalendlyPanel expertId={expertId} onDisconnect={handleCalendarDisconnect} />;
      case 'manual':
      default:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Manual Availability</h3>
              <p className="text-sm text-blue-700">
                Set your weekly availability manually by adding time slots for each day of the week.
                Users will only be able to book sessions during your available times.
              </p>
            </div>
            
            <div className="bg-white rounded-lg">
              <h3 className="text-lg font-medium mb-4">Add New Availability Slot</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="day-of-week" className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    id="day-of-week"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newSlot.day_of_week}
                    onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 6 })}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <select
                    id="start-time"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select
                    id="end-time"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={handleAddSlot} 
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? 'Adding...' : 'Add Availability Slot'}
              </Button>
            </div>
            
            <div className="bg-white rounded-lg mt-6">
              <h3 className="text-lg font-medium mb-4">Current Availability</h3>
              
              {availabilitySlots.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">You haven't set any availability slots yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Add slots above to let users know when you're available for sessions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySlots = availabilitySlots.filter(slot => slot.day_of_week === day.value);
                    
                    if (daySlots.length === 0) return null;
                    
                    return (
                      <div key={day.value} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <h4 className="font-medium text-gray-800 mb-2">{day.label}</h4>
                        <div className="space-y-2">
                          {daySlots.map((slot) => (
                            <div key={slot.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span>{formatTimeRange(slot.start_time, slot.end_time)}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteSlot(slot.id)}
                                disabled={saving}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Manage Your Availability</h2>
        
        <div className="mb-6">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="w-full"
            variant="bordered"
          >
            <Tab
              value="manual"
              label={
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Manual Schedule
                </div>
              }
            />
            <Tab
              value="google_calendar"
              label={
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Google Calendar
                </div>
              }
            />
            <Tab
              value="office365_calendar"
              label={
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Office 365
                </div>
              }
            />
            <Tab
              value="calendly"
              label={
                <div className="flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  Calendly
                </div>
              }
            />
          </Tabs>
        </div>
        
        {renderTabContent()}
      </Card>
    </div>
  );
};

export default ExpertAvailabilityManager;
