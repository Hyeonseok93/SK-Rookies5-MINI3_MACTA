import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, X, Plus, Calendar, Coins, Package, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { auctionApi } from '../api/auction';
import type { Category } from '../api/types';
import type { CategoryType } from '../data/mockData';

export function RegisterAuctionPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType | ''>('');
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [images, setPictures] = useState<{ url: string; main: boolean }[]>([]);

  useEffect(() => {
    auctionApi.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const handleImageAdd = () => {
    // Simulate image upload with a high-quality placeholder
    const mockImages = [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80'
    ];
    const randomUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
    
    if (images.length < 5) {
      setPictures([...images, { url: randomUrl, main: images.length === 0 }]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some(img => img.main)) {
      newImages[0].main = true;
    }
    setPictures(newImages);
  };

  const handleSetMainImage = (index: number) => {
    setPictures(images.map((img, i) => ({
      ...img,
      main: i === index
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || images.length === 0) {
      alert('Please fill all fields and add at least one image');
      return;
    }

    setIsLoading(true);
    try {
      const res = await auctionApi.createAuction({
        title,
        description,
        category: category as CategoryType,
        start_price: parseInt(startPrice.replace(/,/g, '')),
        end_time: new Date(endTime).toISOString(),
        pictures: images
      });

      if (res.success) {
        alert('Auction registered successfully!');
        navigate('/');
      }
    } catch (err) {
      alert('Failed to register auction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[#1e3a5f]">
            <h1 className="text-3xl font-bold text-white mb-2">Register New Auction</h1>
            <p className="text-gray-400">Share your item with the community and start the bidding!</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Image Upload Simulation */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">Product Pictures (Max 5)</label>
              <div className="flex flex-wrap gap-4">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleSetMainImage(idx)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      img.main ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-[#1e3a5f] hover:border-gray-500'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="Preview" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent setting as main when deleting
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {img.main && (
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-[10px] text-white text-center py-0.5 font-bold">
                        MAIN
                      </div>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={handleImageAdd}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-[#1e3a5f] flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-400 transition-all bg-[#0a1628]"
                  >
                    <Camera className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-medium text-center px-1 leading-tight">Add Photo<br/>(Simulated)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-300">Auction Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro Max - Like New"
                  className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full pl-12 pr-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <Plus className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none rotate-45" />
                </div>
              </div>

              {/* Start Price */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Starting Price (KRW)</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={startPrice ? Number(startPrice.replace(/,/g, '')).toLocaleString() : ''}
                    onChange={(e) => setStartPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g., 500,000"
                    className="w-full pl-12 pr-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* End Time */}
              <div className="col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-300">Auction End Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-300">Detailed Description</label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item, including condition, usage period, and any flaws..."
                  className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Auction</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
