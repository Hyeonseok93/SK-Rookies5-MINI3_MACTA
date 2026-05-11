import type { AxiosError } from 'axios';
import { api } from './client';
import { setAccessTokenCookie } from './tokenCookie';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface LoginRequest {
  login_id: string;
  password: string;
}

export interface SignupRequest {
  login_id: string;
  password: string;
  nickname: string;
  email: string;
}

interface SignupPayload extends SignupRequest {
  role: 'ROLE_USER';
}

export interface LoginUser {
  id: number;
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

  return data;
}

export async function signup(payload: SignupRequest) {
  const signupPayload: SignupPayload = {
    ...payload,
    role: 'ROLE_USER',
  };
  const { data } = await api.post<ApiResponse<SignupData>>('/auth/signup', signupPayload);
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
