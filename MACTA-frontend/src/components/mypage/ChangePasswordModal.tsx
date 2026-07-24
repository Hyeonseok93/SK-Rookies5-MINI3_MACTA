import { Loader2, Lock, Save, X } from 'lucide-react';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  isChanging: boolean;
  form: PasswordForm;
  onChange: (field: keyof PasswordForm, value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChangePasswordModal({
  isOpen,
  isChanging,
  form,
  onChange,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  if (!isOpen) return null;

  const fields: { id: keyof PasswordForm; label: string; value: string }[] = [
    { id: 'currentPassword', label: 'Current Password', value: form.currentPassword },
    { id: 'newPassword', label: 'New Password', value: form.newPassword },
    { id: 'confirmPassword', label: 'Confirm Password', value: form.confirmPassword },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e3a5f] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Change Password</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
            disabled={isChanging}
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-5">
          {fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                {field.label}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id={field.id}
                  type="password"
                  value={field.value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] pl-10 pr-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-blue-500"
                  placeholder={field.label}
                  disabled={isChanging}
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1e3a5f]/50 hover:text-white"
              disabled={isChanging}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isChanging}
            >
              {isChanging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
