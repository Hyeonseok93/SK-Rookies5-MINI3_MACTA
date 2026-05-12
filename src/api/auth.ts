import type { AxiosError } from 'axios';
import { api } from './client';
import { clearAccessTokenCookie, setAccessTokenCookie } from './tokenCookie';

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
  accessToken: string;
  user: LoginUser;
}

interface SignupData {
  id: number;
  nickname: string;
}

interface ErrorResponse {
  message?: string;
}

export async function login(payload: LoginRequest) {
  const { data } = await api.post<ApiResponse<LoginData>>('/auth/login', payload);
  setAccessTokenCookie(data.data.accessToken);
  localStorage.setItem('macta_user', JSON.stringify(data.data.user));
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
  return data;
}

export function logout() {
  clearAccessTokenCookie();
  localStorage.removeItem('macta_user');
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

export async function signup(payload: SignupRequest) {
  const { data } = await api.post<ApiResponse<SignupData>>('/auth/signup', payload);
  return data;
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;
  const status = axiosError.response?.status;
  const responseMessage = axiosError.response?.data?.message;

  if (responseMessage) {
    return responseMessage;
  }

  if (status && status >= 500) {
    return axiosError.message;
  }

  return fallback;
}
