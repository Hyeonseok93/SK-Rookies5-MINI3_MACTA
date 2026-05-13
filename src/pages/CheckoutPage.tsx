import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Lock, Package, CreditCard, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionApi } from '../api/auction';
import type { AuctionDetail } from '../api/types';
import { formatPrice, calculateServiceFee } from '../utils/format';
import { useToast } from '../components/common/Toast';

export function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [item, setItem] = useState<AuctionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    if (!id) return;
    auctionApi.getAuctionDetail(id).then(res => {
      if (res.success) setItem(res.data);
      setIsLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsProcessing(true);
    try {
      const res = await auctionApi.processPayment(item.id);
      if (res.success) {
        setOrderComplete(true);
        showToast('Payment successful!', 'success');
        setTimeout(() => {
          navigate('/my-page');
        }, 3000);
      }
    } catch {
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 text-blue-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-gray-400">Loading order summary...</p>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
          <p className="text-xl">Auction not found</p>
          <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-12 text-center shadow-2xl animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Payment Success!</h1>
              <p className="text-green-100 text-lg mb-8">
                Your order for <strong>{item.title}</strong> has been confirmed.
              </p>
              <button
                onClick={() => navigate('/my-page')}
                className="px-8 py-4 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors font-bold"
              >
                Go to My Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const shippingFee = 3000;
  const serviceFee = calculateServiceFee(item.currentPrice);
  const totalAmount = item.currentPrice + shippingFee + serviceFee;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-6 shadow-xl sticky top-24">
              <h2 className="text-white font-bold text-xl mb-4">Order Summary</h2>
              <div className="mb-6">
                <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-[#1e3a5f]">
                  <img src={item.mainPictureUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <h3 className="text-white font-semibold leading-tight">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{item.category}</p>
              </div>
              
              <div className="border-t border-[#1e3a5f] pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Winning Bid</span>
                  <span className="text-white font-medium">₩{formatPrice(item.currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white font-medium">₩{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Service Fee (5%)</span>
                  <span className="text-white font-medium">₩{formatPrice(serviceFee)}</span>
                </div>
                <div className="border-t border-[#1e3a5f] pt-3 flex justify-between items-baseline">
                  <span className="text-white font-bold">Total Amount</span>
                  <span className="text-green-400 font-black text-2xl">
                    ₩{formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-6 shadow-xl">
                <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-400" />
                  Shipping Address
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recipient Name</label>
                    <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                    <input type="tel" required placeholder="010-0000-0000" className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Address</label>
                    <input type="text" required placeholder="Enter your full address" className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-6 shadow-xl">
                <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-green-400" />
                  Payment Method
                </h2>
                <div className="p-5 bg-blue-600/10 border-2 border-blue-500 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Credit / Debit Card</p>
                      <p className="text-xs text-gray-400">Secured encrypted transaction</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-2xl font-black text-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay ₩{formatPrice(totalAmount)} Now</span>
                )}
              </button>
            </form>
            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> Secure checkout powered by BIDDLY Pay
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
