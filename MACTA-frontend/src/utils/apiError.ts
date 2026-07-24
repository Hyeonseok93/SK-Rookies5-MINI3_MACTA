import type { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: {
    message?: string;
    code?: string;
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as AxiosError<ApiErrorBody> & { message?: string };

  const responseMessage =
    apiError.response?.data?.message || apiError.response?.data?.error?.message;

  if (responseMessage) {
    return responseMessage;
  }

  if (apiError.response?.status && apiError.response.status >= 500) {
    return apiError.message || fallback;
  }

  return apiError.message || fallback;
}
