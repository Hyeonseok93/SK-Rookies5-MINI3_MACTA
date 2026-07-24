import { ChevronRight, Heart, Package, TrendingUp } from 'lucide-react';
import type { MyPageTab } from '../../pages/myPageTypes';

const TABS: { id: MyPageTab; label: string; icon: typeof Package }[] = [
  { id: 'auctions', label: 'My Auctions', icon: Package },
  { id: 'bids', label: 'Bidding History', icon: TrendingUp },
  { id: 'likes', label: 'Watchlist', icon: Heart },
];

interface MyPageSidebarProps {
  activeTab: MyPageTab;
  onTabChange: (tab: MyPageTab) => void;
}

export function MyPageSidebar({ activeTab, onTabChange }: MyPageSidebarProps) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <nav className="space-y-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:bg-[#1e3a5f]/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </div>
            <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === tab.id ? 'translate-x-1' : ''}`} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
