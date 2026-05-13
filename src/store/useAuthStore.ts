import { create } from 'zustand';

interface User {
  id: number;
  nickname: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('macta_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  isLoggedIn: !!localStorage.getItem('macta_user'),
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
    // 토큰 쿠키 삭제 로직은 기존 authApi.logout 등에서 처리하거나 여기서 확장 가능
    set({ user: null, isLoggedIn: false });
  },
}));
