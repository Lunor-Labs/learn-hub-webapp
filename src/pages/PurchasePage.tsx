import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, ArrowLeft, Gift, AlertCircle, Loader } from 'lucide-react';
import { useLMS } from '../contexts/LMSContext';
import { useAuth } from '../contexts/AuthContext';
import { createPayHerePayment, processPayment } from '../services/payhereService';

export default function PurchasePage() {
  const { user } = useAuth();
  const { courseCards, purchaseCard } = useLMS();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payhere' | 'manual'>('payhere');
  const location = useLocation();
  const navigate = useNavigate();

  const cardId = location.state?.cardId || courseCards[0]?.id;
  const selectedCard = courseCards.find(card => card.id === cardId);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!selectedCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Course card not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Redirect if the card is free
  if (selectedCard.isFree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <Gift className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Course!</h2>
          <p className="text-gray-600 mb-6">
            This course is free! You can access all content without any payment.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if already purchased
  if (selectedCard.isPurchased) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Purchased!</h2>
          <p className="text-gray-600 mb-6">
            You already have access to this course.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handlePayHerePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const orderId = `ORDER_${Date.now()}_${selectedCard.id}`;
      const [firstName, ...lastNameParts] = user.name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';

      const payment = createPayHerePayment(
        orderId,
        selectedCard.price,
        selectedCard.name,
        {
          firstName,
          lastName,
          email: user.email,
          phone: ''
        }
      );

      await processPayment(
        payment,
        async (completedOrderId) => {
          // Payment successful
          try {
            await purchaseCard(selectedCard.id);
            setSuccess(true);
          } catch (error) {
            console.error('Error completing purchase:', error);
            setError('Payment successful but failed to activate course. Please contact support.');
          }
          setLoading(false);
        },
        (errorMessage) => {
          // Payment error
          setError(`Payment failed: ${errorMessage}`);
          setLoading(false);
        },
        () => {
          // Payment dismissed
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const handleManualPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate manual payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await purchaseCard(selectedCard.id);
      setSuccess(true);
    } catch (error) {
      console.error('Manual purchase failed:', error);
      setError('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            You now have access to <strong>{selectedCard.name}</strong> course content.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Details</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Course:</span>
                <span className="font-semibold">{selectedCard.name}</span>
              </div>
              {selectedCard.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-semibold text-right max-w-xs">{selectedCard.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Videos Included:</span>
                <span className="font-semibold">{selectedCard.videos.length} videos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Access Duration:</span>
                <span className="font-semibold">Lifetime Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plays per Video:</span>
                <span className="font-semibold">3 plays maximum</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-teal-600">LKR {selectedCard.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-teal-50 rounded-xl">
              <h4 className="font-semibold text-teal-800 mb-2">What's Included:</h4>
              <ul className="text-sm text-teal-700 space-y-1">
                {selectedCard.videos.map((video, index) => (
                  <li key={video.id}>• {video.title}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="w-6 h-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">Payment Options</h2>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-teal-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payhere"
                      checked={paymentMethod === 'payhere'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'payhere')}
                      className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">PayHere (Recommended)</span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Secure
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay with Visa, MasterCard, or online banking via PayHere
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-teal-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="manual"
                      checked={paymentMethod === 'manual'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'manual')}
                      className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">Demo Payment</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          Testing
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Simulate payment for testing purposes
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center space-x-2 mb-6 p-4 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">
                {paymentMethod === 'payhere' 
                  ? 'Secured by PayHere - Your payment information is safe and encrypted'
                  : 'Demo mode - No real payment will be processed'
                }
              </span>
            </div>

            {/* Payment Button */}
            <button
              onClick={paymentMethod === 'payhere' ? handlePayHerePayment : handleManualPayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `Pay LKR ${selectedCard.price.toLocaleString()}`
              )}
            </button>

            {/* Payment Info */}
            <div className="mt-4 text-center text-sm text-gray-500">
              {paymentMethod === 'payhere' ? (
                <div>
                  <p>You will be redirected to PayHere for secure payment</p>
                  <p className="mt-1">Sandbox mode - Use test card: 4111 1111 1111 1111</p>
                </div>
              ) : (
                <p>Demo payment will be processed instantly</p>
              )}
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>By clicking "Pay", you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}