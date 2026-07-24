import { Heart, KeyRound, Package, Settings, ShoppingBag, TrendingUp } from 'lucide-react';
import type { UserSummaryResponse } from '../../api/types';
import type { StoredUser } from '../../pages/myPageConstants';

interface MyPageHeaderProps {
  user: StoredUser | null;
  stats: UserSummaryResponse | null | undefined;
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export function MyPageHeader({ user, stats, onEditProfile, onChangePassword }: MyPageHeaderProps) {
  return (
    <div className="bg-[#0d1b2e] border border-[#1e3a5f] rounded-2xl p-8 mb-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{user?.nickname || 'User'}</h1>
          <p className="text-gray-400 font-medium">
            {user?.role === 'ROLE_USER' ? 'Macta Member' : user?.role === 'ROLE_ADMIN' ? 'Macta Admin' : 'Active Member'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            <button
              type="button"
              onClick={onEditProfile}
              className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2e4a6f] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Edit Profile
            </button>
            <button
              type="button"
              onClick={onChangePassword}
              className="px-4 py-2 bg-[#0a1628] hover:bg-[#1e3a5f] border border-[#1e3a5f] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Change Password
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
          {[
            { label: 'Bidding', value: stats?.biddingCount, icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Won', value: stats?.wonCount, icon: ShoppingBag, color: 'text-green-400' },
            { label: 'Hosted', value: stats?.hostedCount, icon: Package, color: 'text-purple-400' },
            { label: 'Likes', value: stats?.watchlistCount, icon: Heart, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0a1628] border border-[#1e3a5f] rounded-xl p-4 text-center min-w-[100px]">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-xl font-bold text-white">{stat.value ?? '...'}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
