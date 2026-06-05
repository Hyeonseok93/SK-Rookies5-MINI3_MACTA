import axios from 'axios';
import { getAccessTokenCookie } from './tokenCookie';
import { useTimeStore } from '../store/useTimeStore';
import { useAuthStore } from '../store/useAuthStore';

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessTokenCookie();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Record start time for RTT compensation
  config.metadata = { startTime: Date.now() };

  return config;
});

// Response Interceptor for Time Sync and Global Error Handling
api.interceptors.response.use(
  (response) => {
    // 1. Time Synchronization Logic
    const startTime = response.config.metadata?.startTime;
    const endTime = Date.now();
    const serverTimestamp = response.data?.timestamp;

    if (startTime && serverTimestamp) {
      const st = new Date(serverTimestamp).getTime();
      const rtt = (endTime - startTime) / 2;
      const serverOffset = (st + rtt) - endTime;
      
      // Update global time offset
      useTimeStore.getState().setServerOffset(serverOffset);
    }

    return response;
  },
  (error) => {
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: '서버와 통신할 수 없습니다. 네트워크 상태를 확인해주세요.',
      });
    }

    const { status, data } = error.response;
    const errorCode = data?.error?.code;
    let customMessage = data?.message || data?.error?.message;

    switch (status) {
      case 400:
        if (errorCode === 'INVALID_BID_PRICE') {
          customMessage = '현재 최고가보다 높은 금액을 입력해야 합니다.';
        } else if (errorCode === 'INVALID_INPUT_VALUE') {
          customMessage = '입력 형식이 올바르지 않습니다.';
        }
        break;

      case 401:
        // Unauthorized: Clear tokens and redirect
        customMessage = '세션이 만료되었습니다. 다시 로그인해주세요.';
        useAuthStore.getState().logout();
        break;

      case 403:
        customMessage = '해당 작업에 대한 권한이 없습니다.';
        useAuthStore.getState().logout();
        break;

      case 404:
        if (errorCode === 'RESOURCE_NOT_FOUND') {
          customMessage = '요청하신 데이터를 찾을 수 없습니다.';
        }
        break;

      case 409:
        if (errorCode === 'BID_CONFLICT') {
          customMessage = '다른 사용자가 해당 입찰가로 먼저 입찰을 완료했습니다. 다시 시도해주세요.';
        } else if (errorCode === 'ALREADY_PROCESSED') {
          customMessage = '이미 처리가 완료된 요청입니다.';
        }
        break;

      case 500:
        customMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        break;

      default:
        customMessage = customMessage || '알 수 없는 오류가 발생했습니다.';
    }

    // Wrap the error with our custom message
    return Promise.reject({
      ...error,
      status,
      errorCode,
      message: customMessage,
    });
  }
);
