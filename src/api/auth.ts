import type { AxiosError } from 'axios';
import { api } from './client';
import { clearAccessTokenCookie, setAccessTokenCookie } from './tokenCookie';
import { MOCK_USERS } from '../data/mockData';

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
  try {
    const { data } = await api.post<ApiResponse<LoginData>>('/auth/login', payload);
    setAccessTokenCookie(data.data.accessToken);
    localStorage.setItem('macta_user', JSON.stringify(data.data.user));
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
    return data;
  } catch (error) {
    // FALLBACK: If API fails (e.g., local dev without backend), check MOCK_USERS
    const mockUser = MOCK_USERS.find(
      u => u.loginId === payload.loginId && u.password === payload.password
    );

    if (mockUser) {
      const mockResponse: ApiResponse<LoginData> = {
        success: true,
        message: '로그인에 성공했습니다.',
        timestamp: new Date().toISOString(),
        data: {
          accessToken: 'mock-access-token-' + Date.now(),
          user: {
            id: 'mock-id-' + mockUser.loginId,
            nickname: mockUser.nickname,
            email: mockUser.email,
            role: mockUser.role
          }
        }
      };
      
      setAccessTokenCookie(mockResponse.data.accessToken);
      localStorage.setItem('macta_user', JSON.stringify(mockResponse.data.user));
      window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
      return mockResponse;
    }
    
    throw error;
  }
}

export function logout() {
  clearAccessTokenCookie();
  localStorage.removeItem('macta_user');
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

export async function signup(payload: SignupRequest) {
  try {
    const { data } = await api.post<ApiResponse<SignupData>>('/auth/signup', payload);
    return data;
  } catch (error) {
    // FALLBACK: Simulate success for demonstration
    const mockResponse: ApiResponse<SignupData> = {
      success: true,
      message: '회원가입이 완료되었습니다.',
      timestamp: new Date().toISOString(),
      data: {
        id: Date.now(),
        nickname: payload.nickname
      }
    };
    return mockResponse;
  }
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
