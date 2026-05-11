import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Lock, Package, CreditCard } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionItems } from '../data/mockData';

export function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = auctionItems.find(i => i.id === id);

  const [orderComplete, setOrderComplete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);
    setTimeout(() => {
      navigate('/my-page');
    }, 3000);
  };

  if (!item) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
          <p className="text-xl">Item not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  if (orderComplete) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-12 text-center shadow-2xl">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Order Complete!</h1>
              <p className="text-green-100 text-lg mb-8">
                Your payment has been processed successfully. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              >
                Go to My Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const shippingFee = 3000;
  const serviceFee = Math.floor(item.current_price * 0.05);
  const totalAmount = item.current_price + shippingFee + serviceFee;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/product/${item.id}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Auction</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
              <h2 className="text-white font-bold text-xl mb-4">Order Summary</h2>
              <div className="mb-6">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full aspect-square object-cover rounded-lg mb-3"
                />
                <h3 className="text-white font-semibold">{item.title}</h3>
              </div>
              <div className="border-t border-[#1e3a5f] pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Winning Bid</span>
                  <span className="text-white">₩{item.current_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className="text-white">₩{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Service Fee (5%)</span>
                  <span className="text-white">₩{serviceFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-[#1e3a5f] pt-3 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-green-400 font-bold text-2xl">
                    ₩{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-400" />
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Address"
                    className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-lg p-6">
                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-green-400" />
                  Payment Method
                </h2>
                <div className="p-4 bg-[#0a1628] border-2 border-green-500 rounded-lg flex items-center gap-3">
                  <CreditCard className="text-green-400" />
                  <span className="text-white">Credit / Debit Card</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-5 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
              >
                Complete Secure Purchase
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
