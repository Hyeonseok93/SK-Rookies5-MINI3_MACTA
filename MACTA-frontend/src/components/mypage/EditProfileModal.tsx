import { Loader2, Mail, Save, UserRound, X } from 'lucide-react';
import type { UserInfoResponse } from '../../api/types';

interface EditProfileModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  profile: UserInfoResponse | null;
  emailFallback?: string;
  nickname: string;
  error: string;
  onNicknameChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditProfileModal({
  isOpen,
  isLoading,
  isSaving,
  profile,
  emailFallback,
  nickname,
  error,
  onNicknameChange,
  onClose,
  onSubmit,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e3a5f] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
            disabled={isSaving}
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-blue-400">
            <Loader2 className="mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm text-gray-500">Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 px-6 py-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                Email
              </label>
              <div className="flex h-11 items-center gap-3 rounded-lg border border-[#1e3a5f] bg-[#0a1628] px-3 text-gray-300">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="truncate text-sm">{profile?.email || emailFallback || '-'}</span>
              </div>
            </div>

            <div>
              <label htmlFor="profile-nickname" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                Nickname
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="profile-nickname"
                  value={nickname}
                  onChange={(e) => onNicknameChange(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] pl-10 pr-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-blue-500"
                  placeholder="Enter nickname"
                  disabled={isSaving}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
