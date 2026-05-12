import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ 
  message = 'Something went wrong while fetching data.', 
  onRetry,
  title = 'Connection Error'
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 bg-[#0d1b2e]/50 border border-red-500/20 rounded-2xl text-center">
      <div className="bg-red-500/10 p-4 rounded-full mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mx-auto mb-8">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all group"
        >
          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Try Again
        </button>
      )}
    </div>
  );
}
