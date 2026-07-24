import { api } from './client';
import { getApiErrorMessage } from '../utils/apiError';

export const AUTH_STATE_CHANGED_EVENT = 'macta-auth-state-changed';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface SignupRequest {
  loginId: string;
  password: string;
  nickname: string;
  email: string;
}

export interface LoginUser {
  id: number | string;
  role: string;
  nickname: string;
  email: string;
}

interface LoginData {
  user: LoginUser;
}

interface SignupData {
  id: number;
  nickname: string;
}

export async function restoreSession() {
  try {
    const { data } = await api.get<ApiResponse<LoginData>>('/auth/me');
    if (data.success && data.data?.user) {
      localStorage.setItem('macta_user', JSON.stringify(data.data.user));
      window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
      return data.data.user;
    }
  } catch {
    localStorage.removeItem('macta_user');
  }
  return null;
}

export async function login(payload: LoginRequest) {
  const { data } = await api.post<ApiResponse<LoginData>>('/auth/login', payload);
  localStorage.setItem('macta_user', JSON.stringify(data.data.user));
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
  return data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore logout API failures; still clear local session.
  }

  localStorage.removeItem('macta_user');
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

export async function signup(payload: SignupRequest) {
  const { data } = await api.post<ApiResponse<SignupData>>('/auth/signup', payload);
  return data;
}

export async function checkLoginId(loginId: string) {
  const { data } = await api.get<ApiResponse<boolean>>('/auth/check-login-id', {
    params: { login_id: loginId },
  });
  return data;
}

export async function checkEmail(email: string) {
  const { data } = await api.get<ApiResponse<boolean>>('/auth/check-email', {
    params: { email },
  });
  return data;
}

export async function checkNickname(nickname: string) {
  const { data } = await api.get<ApiResponse<boolean>>('/auth/check-nickname', {
    params: { nickname },
  });
  return data;
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
