import { Request } from 'express';

// User Entity Type
export interface UserEntity {
  id: string;
  email: string;
  createdAt: Date;
}

// Request DTO
export interface SignUpRequestDTO {
  email: string;
  password: string;
}

// 인증된 사용자 정보가 포함된 Request
export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}

// Response DTO
export interface SignUpResponseDTO {
  user: UserEntity;
}
export interface AuthResponseDTO {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
