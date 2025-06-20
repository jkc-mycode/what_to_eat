const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 커스텀 fetch 래퍼
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const accessToken = localStorage.getItem('accessToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // httpOnly 쿠키를 주고받기 위해 필수!
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'API 요청 중 오류가 발생했습니다.');
    (error as unknown as { status: number }).status = response.status;
    throw error;
  }

  // No Content 응답 처리
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
