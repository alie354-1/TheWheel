import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { contractService, Payment } from '@/lib/services/contract.service';
import { toast } from '@/lib/utils/toast';

interface PaymentModalProps {
  sessionId?: string;
  contractId?: string;
  expertId: string;
  userId: string;
  amount: number;
  onClose: () => void;
  onPaymentComplete?: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  sessionId,
  contractId,
  expertId,
  userId,
  amount,
  onClose,
  onPaymentComplete,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [saveCard, setSaveCard] = useState<boolean>(false);

  // This is a placeholder for payment methods
  // In a real implementation, these would come from a payment service
  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'bank_transfer', name: 'Bank Transfer' },
  ];

  const handlePayment = async () => {
    if (!user) return;
    
    // Validate payment details
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        toast.error('Missing Information', 'Please fill in all card details.');
        return;
      }
      
      // Simple validation - in a real app, you'd use a proper validation library
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Invalid Card', 'Please enter a valid card number.');
        return;
      }
    }
    
    try {
      setProcessing(true);
      
      // This is a placeholder for payment processing
      // In a real implementation, you would integrate with a payment gateway
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create payment record
      const payment = await contractService.createPayment({
        expert_id: expertId,
        user_id: userId,
        session_id: sessionId,
        contract_id: contractId,
        amount,
        currency: 'USD',
        payment_method: paymentMethod,
        payment_reference: `PAYMENT-${Date.now()}`,
        status: 'completed',
        payment_date: new Date().toISOString(),
        notes: 'Payment for expert session',
      });
      
      if (payment) {
        toast.success('Payment Successful', `Your payment of $${amount.toFixed(2)} has been processed successfully.`);
        
        if (onPaymentComplete) {
          onPaymentComplete(payment);
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Payment</h2>
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-blue-600 font-medium">Session Fee</div>
                <div className="text-2xl font-bold">${amount.toFixed(2)}</div>
              </div>
              <div className="text-blue-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`border rounded-md p-3 flex flex-col items-center justify-center transition-colors ${
                      paymentMethod === method.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span className="text-sm font-medium">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {paymentMethod === 'credit_card' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="card-name" className="block text-sm font-medium mb-1">Name on Card</label>
                  <input
                    id="card-name"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="card-number" className="block text-sm font-medium mb-1">Card Number</label>
                  <input
                    id="card-number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="card-expiry" className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input
                      id="card-expiry"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="w-full p-2 border rounded-md"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="card-cvc" className="block text-sm font-medium mb-1">CVC</label>
                    <input
                      id="card-cvc"
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      className="w-full p-2 border rounded-md"
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="save-card"
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="save-card" className="ml-2 text-sm text-gray-600">
                    Save card for future payments
                  </label>
                </div>
              </div>
            )}
            
            {paymentMethod === 'paypal' && (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-600 mb-2">You will be redirected to PayPal to complete your payment.</p>
                <div className="flex justify-center">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.067 8.478c.492.88.493 2.053.025 3.34-.952 2.312-3.196 3.5-6.25 3.5h-.478c-.426 0-.794.3-.873.718l-.012.067-.692 4.39-.022.14c-.079.418-.447.717-.873.717H7.9c-.37 0-.596-.39-.45-.736l.037-.082 1.293-8.208c.109-.692.704-1.2 1.407-1.2h3.839c.989 0 1.851-.267 2.559-.752.707-.486 1.195-1.18 1.45-2.067.256-.889.256-1.651.032-2.294-.225-.642-.632-1.02-1.226-1.2.597-.312 1.136-.468 1.615-.468.597 0 1.078.156 1.45.468.37.312.63.752.782 1.317.152.565.152 1.2 0 1.85z" fill="#253B80"/>
                    <path d="M9.118 7.696c.109-.692.704-1.2 1.407-1.2h4.839c.37 0 .74-.039 1.11-.117-.707-.486-1.615-.702-2.726-.702H9.01c-.704 0-1.3.508-1.408 1.2L6.01 15.696c-.146.346.08.736.45.736h1.992l.666-4.736z" fill="#179BD7"/>
                    <path d="M20.067 8.478c.492.88.493 2.053.025 3.34-.952 2.312-3.196 3.5-6.25 3.5h-.478c-.426 0-.794.3-.873.718l-.012.067-.692 4.39-.022.14c-.079.418-.447.717-.873.717H7.9c-.37 0-.596-.39-.45-.736l.037-.082 1.293-8.208-1.293 8.208-.037.082c-.146.346.08.736.45.736h2.992c.426 0 .794-.3.873-.718l.022-.14.692-4.39.012-.067c.079-.417.447-.717.873-.717h.478c3.054 0 5.298-1.188 6.25-3.5.468-1.287.467-2.46-.025-3.34z" fill="#222D65"/>
                    <path d="M9.118 7.696c.109-.692.704-1.2 1.407-1.2h4.839c.37 0 .74-.039 1.11-.117a3.8 3.8 0 00-.74-.078h-4.84c-.703 0-1.298.508-1.407 1.2l-1.3 8.23.037-.082 1.293-8.208.6.255z" fill="#253B80"/>
                  </svg>
                </div>
              </div>
            )}
            
            {paymentMethod === 'bank_transfer' && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600 mb-2">Please use the following details for bank transfer:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Account Name:</span>
                    <span>Expert Connect Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Account Number:</span>
                    <span>1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sort Code:</span>
                    <span>12-34-56</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Reference:</span>
                    <span>EC-{userId.substring(0, 8)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Please allow 1-3 business days for the payment to be processed.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handlePayment} 
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>This is a placeholder payment form. In a production environment, you would integrate with a secure payment processor.</p>
          <p className="mt-1">No actual payments will be processed.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
