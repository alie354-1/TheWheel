import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { contractService, Contract } from '@/lib/services/contract.service';
import { toast } from '@/lib/utils/toast';

interface ContractModalProps {
  contractId?: string;
  expertId?: string;
  userId?: string;
  connectRequestId?: string;
  onClose: () => void;
  onSigned?: (contract: Contract) => void;
  mode?: 'view' | 'sign' | 'create';
}

export const ContractModal: React.FC<ContractModalProps> = ({
  contractId,
  expertId,
  userId,
  connectRequestId,
  onClose,
  onSigned,
  mode = 'view',
}) => {
  const { user } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      if (contractId) {
        try {
          setLoading(true);
          const contractData = await contractService.getContractById(contractId);
          setContract(contractData);
          setTitle(contractData?.title || '');
          setContent(contractData?.content || '');
          setHourlyRate(contractData?.hourly_rate);
        } catch (error) {
          console.error('Error fetching contract:', error);
          toast.error('Error', 'Failed to load contract details.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handleCreateContract = async () => {
    if (!user || !expertId || !userId) return;
    
    try {
      setSigning(true);
      
      // This is a placeholder for contract creation
      // In a real implementation, you would use a template or form builder
      const newContract = await contractService.createContract({
        expert_id: expertId,
        user_id: userId,
        connect_request_id: connectRequestId,
        title,
        content,
        status: 'draft',
        expert_signed: user.id === expertId,
        user_signed: user.id === userId,
        hourly_rate: hourlyRate,
        terms_and_conditions: 'Standard terms and conditions apply.',
      });
      
      setContract(newContract);
      
      if (user.id === expertId) {
        await contractService.signContractAsExpert(newContract!.id);
        toast.success('Contract Created', 'Contract has been created and signed. Waiting for client signature.');
      } else {
        await contractService.signContractAsUser(newContract!.id);
        toast.success('Contract Signed', 'Contract has been signed successfully.');
      }
      
      if (onSigned) {
        onSigned(newContract!);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Error', 'Failed to create contract.');
    } finally {
      setSigning(false);
    }
  };

  const handleSignContract = async () => {
    if (!user || !contract) return;
    
    try {
      setSigning(true);
      
      let signedContract: Contract | null = null;
      
      if (user.id === contract.expert_id) {
        signedContract = await contractService.signContractAsExpert(contract.id);
        toast.success('Contract Signed', 'Contract has been signed. Waiting for client signature.');
      } else if (user.id === contract.user_id) {
        signedContract = await contractService.signContractAsUser(contract.id);
        toast.success('Contract Signed', 'Contract has been signed successfully.');
      }
      
      if (signedContract && onSigned) {
        onSigned(signedContract);
      }
      
      onClose();
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('Error', 'Failed to sign contract.');
    } finally {
      setSigning(false);
    }
  };

  const handleRejectContract = async () => {
    if (!user || !contract) return;
    
    try {
      setSigning(true);
      
      await contractService.rejectContract(contract.id, 'Contract terms not acceptable.');
      toast.success('Contract Rejected', 'Contract has been rejected.');
      
      onClose();
    } catch (error) {
      console.error('Error rejecting contract:', error);
      toast.error('Error', 'Failed to reject contract.');
    } finally {
      setSigning(false);
    }
  };

  const isExpert = user?.id === contract?.expert_id;
  const isClient = user?.id === contract?.user_id;
  const canSign = (isExpert && !contract?.expert_signed) || (isClient && !contract?.user_signed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create Contract' : 
             mode === 'sign' ? 'Review & Sign Contract' : 
             'Contract Details'}
          </h2>
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {mode === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="contract-title" className="block font-medium mb-1">Contract Title</label>
                  <input
                    id="contract-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., Consulting Agreement"
                  />
                </div>
                
                <div>
                  <label htmlFor="hourly-rate" className="block font-medium mb-1">Hourly Rate ($)</label>
                  <input
                    id="hourly-rate"
                    type="number"
                    value={hourlyRate || ''}
                    onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., 150"
                  />
                </div>
                
                <div>
                  <label htmlFor="contract-content" className="block font-medium mb-1">Contract Content</label>
                  <textarea
                    id="contract-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    className="w-full p-2 border rounded-md font-mono text-sm"
                    placeholder="Enter contract terms and conditions..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This is a placeholder for contract content. In a production environment, 
                    you would use a template system or rich text editor.
                  </p>
                </div>
                
                <div className="flex items-start mt-4">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms-checkbox" className="ml-2 text-sm text-gray-600">
                    I confirm that this contract contains all required legal terms and conditions,
                    and I understand that this creates a legally binding agreement.
                  </label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} disabled={signing}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleCreateContract} 
                    disabled={!title || !content || !termsAccepted || signing}
                  >
                    {signing ? 'Creating...' : 'Create & Sign Contract'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Contract Status:</div>
                    <div className={`px-2 py-1 rounded text-sm ${
                      contract?.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      contract?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      contract?.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract?.status === 'draft' ? 'Draft' :
                       contract?.status === 'sent' ? 'Awaiting Signature' :
                       contract?.status === 'accepted' ? 'Accepted' :
                       contract?.status === 'rejected' ? 'Rejected' :
                       contract?.status === 'expired' ? 'Expired' :
                       contract?.status === 'terminated' ? 'Terminated' :
                       'Unknown'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Expert</div>
                      <div>{contract?.expert_id}</div>
                      {contract?.expert_signed && (
                        <div className="text-green-600 text-sm mt-1">
                          Signed on {new Date(contract.expert_signed_at!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Client</div>
                      <div>{contract?.user_id}</div>
                      {contract?.user_signed && (
                        <div className="text-green-600 text-sm mt-1">
                          Signed on {new Date(contract.user_signed_at!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">{contract?.title || 'Contract'}</h3>
                  
                  {contract?.hourly_rate && (
                    <div className="mb-4 text-blue-600 font-medium">
                      Hourly Rate: ${contract.hourly_rate.toFixed(2)}
                    </div>
                  )}
                  
                  <div className="border rounded-md p-4 bg-gray-50 whitespace-pre-wrap font-mono text-sm">
                    {contract?.content || 'No content available.'}
                  </div>
                </div>
                
                {mode === 'sign' && canSign && (
                  <div className="flex items-start mt-4">
                    <input
                      id="terms-checkbox"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="terms-checkbox" className="ml-2 text-sm text-gray-600">
                      I have read and agree to the terms and conditions of this contract,
                      and I understand that by signing, I am entering into a legally binding agreement.
                    </label>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} disabled={signing}>
                    Close
                  </Button>
                  
                  {mode === 'sign' && canSign && (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleRejectContract} 
                        disabled={signing}
                      >
                        {signing ? 'Rejecting...' : 'Reject Contract'}
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleSignContract} 
                        disabled={!termsAccepted || signing}
                      >
                        {signing ? 'Signing...' : 'Sign Contract'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContractModal;
