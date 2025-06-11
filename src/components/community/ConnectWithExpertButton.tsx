import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { connectService, ConnectRequest } from '@/lib/services/connect.service';
import ConnectRequestModal from './ConnectRequestModal';
import { toast } from '@/lib/utils/toast';

interface ConnectWithExpertButtonProps {
  expertId: string;
  expertName?: string;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export const ConnectWithExpertButton: React.FC<ConnectWithExpertButtonProps> = ({
  expertId,
  expertName = 'Expert',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
}) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<ConnectRequest | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');

  useEffect(() => {
    if (user && expertId) {
      checkExistingConnection();
    }
  }, [user, expertId]);

  const checkExistingConnection = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const request = await connectService.checkConnectionExists(user.id, expertId);
      setExistingRequest(request);
      
      if (request) {
        setConnectionStatus(request.status as 'pending' | 'accepted' | 'declined');
      } else {
        setConnectionStatus('none');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (!user) {
      toast.error('Authentication Required', 'Please sign in to connect with experts.');
      return;
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConnect = async (message: string, expertiseArea?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const request = await connectService.createConnectRequest({
        requester_id: user.id,
        expert_id: expertId,
        message,
        expertise_area: expertiseArea,
      });
      
      if (request) {
        setExistingRequest(request);
        setConnectionStatus('pending');
        toast.success('Connection Request Sent', `Your request to connect with ${expertName} has been sent.`);
      }
    } catch (error) {
      console.error('Error creating connection request:', error);
      toast.error('Connection Request Failed', 'There was an error sending your connection request. Please try again.');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const getButtonText = () => {
    switch (connectionStatus) {
      case 'pending':
        return 'Connection Pending';
      case 'accepted':
        return 'Connected';
      case 'declined':
        return 'Connection Declined';
      default:
        return `Connect with ${expertName}`;
    }
  };

  const getButtonVariant = () => {
    switch (connectionStatus) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'outline';
      case 'declined':
        return 'ghost';
      default:
        return variant;
    }
  };

  const isButtonDisabled = connectionStatus === 'pending' || connectionStatus === 'accepted' || isLoading;

  return (
    <>
      <Button
        variant={getButtonVariant()}
        size={size}
        className={`${className} ${fullWidth ? 'w-full' : ''}`}
        onClick={handleOpenModal}
        disabled={isButtonDisabled}
      >
        {isLoading ? 'Loading...' : getButtonText()}
      </Button>
      
      {isModalOpen && (
        <ConnectRequestModal
          expertId={expertId}
          expertName={expertName}
          onClose={handleCloseModal}
          onSubmit={handleConnect}
        />
      )}
    </>
  );
};

export default ConnectWithExpertButton;
