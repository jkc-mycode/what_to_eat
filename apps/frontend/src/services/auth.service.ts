import { apiFetch } from './api.service';
import { LoginCredentials } from '../types/auth.types';

// 로그인 요청
export const loginApi = (credentials: LoginCredentials) => {
  return apiFetch('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// 사용자 프로필 조회
export const getProfileApi = () => {
  return apiFetch('/auth/profile');
};

// Access Token 갱신
export const refreshTokenApi = () => {
  // body나 headers가 필요 없음 (httpOnly 쿠키가 자동으로 전송됨)
  return apiFetch('/auth/refresh', {
    method: 'POST',
  });
};

// 로그아웃
export const logoutApi = () => {
  return apiFetch('/auth/signout', {
    method: 'POST',
  });
};
