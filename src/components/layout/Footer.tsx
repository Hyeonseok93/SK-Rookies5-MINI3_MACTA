import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0d1b2e] border-t border-[#1e3a5f] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Secured by AWS WAF & JWT Authentication</span>
        </div>
        <div className="text-center text-gray-500 text-sm mt-4">
          © 2026 ShieldBid. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
