import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, ArrowLeft, Gift } from 'lucide-react';
import { useLMS } from '../contexts/LMSContext';
import { useAuth } from '../contexts/AuthContext';

export default function PurchasePage() {
  const { user } = useAuth();
  const { courseCards, purchaseCard } = useLMS();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Course card not found</p>
        </div>
      </div>
    );
  }

  // Redirect if the card is free
  if (selectedCard.isFree) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      // Simulate PayHere integration
      await purchaseCard(selectedCard.id);
      setSuccess(true);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            You now have access to the {selectedCard.month} {selectedCard.year} course content.
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
    <div className="min-h-screen bg-gray-50 py-8">
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Details</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Course:</span>
                <span className="font-semibold">{selectedCard.month} {selectedCard.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Videos Included:</span>
                <span className="font-semibold">{selectedCard.videos.length} videos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Access Duration:</span>
                <span className="font-semibold">1 Month</span>
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

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="w-6 h-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-6 p-4 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">
                Secured by PayHere - Your payment information is safe and encrypted
              </span>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Payment...' : `Pay LKR ${selectedCard.price.toLocaleString()}`}
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>By clicking "Pay", you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}