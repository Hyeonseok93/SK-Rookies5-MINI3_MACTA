import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200",
          "dark:bg-[#0d1b2e] dark:border-[#1e3a5f]"
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground dark:text-white leading-none">
              {title}
            </h3>
            <p className="text-muted-foreground dark:text-gray-400 text-sm leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium border-border hover:bg-accent dark:border-[#1e3a5f] dark:hover:bg-[#1e3a5f] dark:text-gray-300"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
