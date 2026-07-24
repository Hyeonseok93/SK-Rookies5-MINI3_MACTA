import { create } from 'zustand';
import { AUTH_STATE_CHANGED_EVENT } from '../api/auth';

interface User {
  id: number | string;
  nickname: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  syncAuthState: () => void;
}

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('macta_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getCurrentAuthState = () => {
  const user = getStoredUser();
  if (user) {
    return { user, isLoggedIn: true };
  }
  return { user: null, isLoggedIn: false };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getCurrentAuthState(),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('macta_user', JSON.stringify(user));
      set({ user, isLoggedIn: true });
    } else {
      localStorage.removeItem('macta_user');
      set({ user: null, isLoggedIn: false });
    }
  },
  logout: () => {
    localStorage.removeItem('macta_user');
    set({ user: null, isLoggedIn: false });
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
  },
  syncAuthState: () => {
    set(getCurrentAuthState());
  },
}));
