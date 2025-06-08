import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { connectService, ConnectRequest } from '@/lib/services/connect.service';
import { sessionService } from '@/lib/services/session.service';
import { contractService, Contract, Payment } from '@/lib/services/contract.service';
import { toast } from '@/lib/utils/toast';
import ContractModal from '@/components/community/ContractModal';
import PaymentModal from '@/components/community/PaymentModal';

/**
 * User Connections Page
 * 
 * Displays a user's connections with experts, including pending requests,
 * active connections, contracts, and payments.
 */
const UserConnectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<ConnectRequest[]>([]);
  const [activeConnections, setActiveConnections] = useState<ConnectRequest[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Array<any>>([]);
  const [pastSessions, setPastSessions] = useState<Array<any>>([]);
  
  // Modal states
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<{
    id: string;
    expert_id: string;
    contract_id?: string;
    hourly_rate: number;
    duration_minutes: number;
    payment_status?: string;
  } | null>(null);
  const [contractMode, setContractMode] = useState<'view' | 'sign'>('view');

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch connection requests
        const requests = await connectService.getUserConnectRequests(user.id);
        setPendingRequests(requests.filter((req: ConnectRequest) => req.status === 'pending'));
        setActiveConnections(requests.filter((req: ConnectRequest) => req.status === 'accepted'));
        
        // Fetch contracts
        const userContracts = await contractService.getContractsByUser(user.id);
        setContracts(userContracts);
        
        // Fetch payments
        const userPayments = await contractService.getPaymentsByUser(user.id);
        setPayments(userPayments);
        
        // Fetch sessions
        const sessions = await sessionService.getUserSessions(user.id);
        const now = new Date();
        
        setUpcomingSessions(
          sessions.filter((session: any) => new Date(session.start_time) > now)
            .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        );
        
        setPastSessions(
          sessions.filter((session: any) => new Date(session.start_time) <= now)
            .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        );
      } catch (error) {
        console.error('Error fetching user connections:', error);
        toast.error('Error', 'Failed to load your connections. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleViewContract = (contractId: string) => {
    setSelectedContract(contractId);
    setContractMode('view');
    setIsContractModalOpen(true);
  };

  const handleSignContract = (contractId: string) => {
    setSelectedContract(contractId);
    setContractMode('sign');
    setIsContractModalOpen(true);
  };

  const handlePayForSession = (session: {
    id: string;
    expert_id: string;
    contract_id?: string;
    hourly_rate: number;
    duration_minutes: number;
    payment_status?: string;
  }) => {
    setSelectedSession(session);
    setIsPaymentModalOpen(true);
  };

  const handleContractSigned = (contract: Contract) => {
    // Update the contracts list
    setContracts(prevContracts => 
      prevContracts.map(c => c.id === contract.id ? contract : c)
    );
    
    toast.success('Contract Signed', 'The contract has been signed successfully.');
  };

  const handlePaymentComplete = (payment: Payment) => {
    // Update the payments list
    setPayments(prevPayments => [...prevPayments, payment]);
    
    // Update the session payment status
    if (selectedSession) {
      setUpcomingSessions(prevSessions => 
        prevSessions.map(s => s.id === selectedSession.id 
          ? { ...s, payment_status: 'paid' } 
          : s
        )
      );
    }
    
    toast.success('Payment Complete', 'Your payment has been processed successfully.');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Expert Connections</h1>
        <p className="text-gray-600">Manage your connections with experts, contracts, and payments.</p>
      </div>
      
      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Requests</h2>
        
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden">
                    {request.expert_avatar_url && (
                      <img 
                        src={request.expert_avatar_url} 
                        alt={request.expert_name || 'Expert'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{request.expert_name || 'Expert'}</h3>
                    <div className="text-sm text-blue-600">{request.expertise_area || 'Expert'}</div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 text-yellow-800 text-sm px-3 py-2 rounded-md mb-3">
                  Request Pending
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <div className="font-medium">Your message:</div>
                  <p className="mt-1">{request.message}</p>
                </div>
                
                <div className="text-xs text-gray-500">
                  Requested on {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">You don't have any pending connection requests.</p>
          </div>
        )}
      </div>
      
      {/* Active Connections */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Connections</h2>
        
        {activeConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeConnections.map(connection => (
              <div key={connection.id} className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden">
                    {connection.expert_avatar_url && (
                      <img 
                        src={connection.expert_avatar_url} 
                        alt={connection.expert_name || 'Expert'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{connection.expert_name || 'Expert'}</h3>
                    <div className="text-sm text-blue-600">{connection.expertise_area || 'Expert'}</div>
                  </div>
                </div>
                
                <div className="bg-green-50 text-green-800 text-sm px-3 py-2 rounded-md mb-3">
                  Connected
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <Link 
                    to={`/community/experts/${connection.expert_id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Profile
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link 
                    to={`/community/connections/chat/${connection.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">You don't have any active connections yet.</p>
            <Link 
              to="/community/experts"
              className="inline-block mt-3 text-blue-600 hover:text-blue-800 font-medium"
            >
              Find Experts →
            </Link>
          </div>
        )}
      </div>
      
      {/* Upcoming Sessions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Sessions</h2>
        
        {upcomingSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Expert</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date & Time</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Duration</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Payment</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingSessions.map(session => {
                  const sessionContract = contracts.find(c => c.id === session.contract_id);
                  const hourlyRate = sessionContract?.hourly_rate || 0;
                  const durationHours = session.duration_minutes / 60;
                  const sessionCost = hourlyRate * durationHours;
                  
                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 overflow-hidden">
                            {session.expert_avatar_url && (
                              <img 
                                src={session.expert_avatar_url} 
                                alt={session.expert_name || 'Expert'} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>{session.expert_name || 'Expert'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(session.start_time).toLocaleDateString()} at {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">{session.duration_minutes} minutes</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {session.payment_status === 'paid' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {session.payment_status || 'Unpaid'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {session.payment_status !== 'paid' && (
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              onClick={() => handlePayForSession(session)}
                            >
                              Pay (${sessionCost.toFixed(2)})
                            </button>
                          )}
                          <Link 
                            to={`/community/sessions/${session.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">You don't have any upcoming sessions.</p>
          </div>
        )}
      </div>
      
      {/* Contracts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contracts</h2>
        
        {contracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Expert</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Title</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Hourly Rate</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Created</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contracts.map(contract => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{contract.expert_id}</td>
                    <td className="py-3 px-4">{contract.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contract.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        contract.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        contract.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {contract.hourly_rate ? `$${contract.hourly_rate.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(contract.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => handleViewContract(contract.id)}
                        >
                          View
                        </button>
                        
                        {contract.status === 'sent' && !contract.user_signed && (
                          <button 
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            onClick={() => handleSignContract(contract.id)}
                          >
                            Sign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">You don't have any contracts yet.</p>
          </div>
        )}
      </div>
      
      {/* Payment History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment History</h2>
        
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Expert</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Payment Method</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{payment.expert_id}</td>
                    <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.payment_method || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">You don't have any payment history yet.</p>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {isContractModalOpen && selectedContract && (
        <ContractModal
          contractId={selectedContract}
          mode={contractMode}
          onClose={() => setIsContractModalOpen(false)}
          onSigned={handleContractSigned}
        />
      )}
      
      {isPaymentModalOpen && selectedSession && (
        <PaymentModal
          expertId={selectedSession.expert_id}
          userId={user?.id || ''}
          sessionId={selectedSession.id}
          contractId={selectedSession.contract_id}
          amount={selectedSession.hourly_rate * (selectedSession.duration_minutes / 60)}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default UserConnectionsPage;
