export function Footer() {
  return (
    <footer className="bg-[#0d1b2e] border-t border-[#1e3a5f] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
          <div className="font-black text-white tracking-tighter flex items-center gap-1">
            MACTA<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
          </div>
          <span>The Premium Auction Platform for Final Bidders.</span>
        </div>
        <div className="text-center text-gray-500 text-[10px] mt-4 uppercase tracking-widest">
          © 2026 MACTA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
