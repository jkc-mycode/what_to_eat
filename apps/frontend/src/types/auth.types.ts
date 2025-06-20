// 백엔드와 공유하는 사용자 타입
export interface User {
  id: string;
  email: string;
  nickname?: string;
  socialId?: string;
  updatedAt: string;
  deletedAt?: string;
  createdAt: string;
}

// 로그인 요청 타입
export interface LoginCredentials {
  email: string;
  password: string;
}

// 회원가입 요청 타입
export interface SignUpCredentials {
  email: string;
  password: string;
}

// 인증 응답 타입
export interface AuthResponse {
  user: User;
  accessToken: string;
}

// API 응답 래퍼 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// 에러 응답 타입
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// API 에러 타입
export interface ApiError {
  status?: number;
  message?: string;
}
