import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/utils/toast';
import { sampleDataService } from '@/lib/services/sample-data.service';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Button component that creates a sample expert profile for the current user
 * This is useful for testing and development purposes
 */
const CreateSampleExpertProfileButton: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateSampleProfile = async () => {
    if (!user) {
      toast.error('Error', 'You must be logged in to create a sample expert profile');
      return;
    }

    try {
      setLoading(true);
      const result = await sampleDataService.addSampleExpertProfile(user.id);
      
      toast.success('Success', 'Sample expert profile created successfully');
      
      console.log('Sample expert profile created:', result);
    } catch (error) {
      console.error('Error creating sample expert profile:', error);
      
      toast.error('Error', 'Failed to create sample expert profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateSampleProfile} 
      disabled={loading}
      variant="outline"
      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
    >
      {loading ? 'Creating...' : 'Create Sample Expert Profile'}
    </Button>
  );
};

export default CreateSampleExpertProfileButton;
