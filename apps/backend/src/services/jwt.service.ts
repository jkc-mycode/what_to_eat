import jwt, { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  // JWT 토큰 생성
  generateToken(userId: string): string {
    const payload: JwtPayload = { id: userId };

    const options: SignOptions = {
      expiresIn: this.expiresIn as any,
    };

    return jwt.sign(payload, this.secret, options);
  }

  // JWT 토큰 검증
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.');
    }
  }

  // 토큰에서 사용자 ID 추출
  extractUserId(token: string): string {
    const payload = this.verifyToken(token);
    return payload.id;
  }

  // 토큰 만료 시간 확인
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.verifyToken(token);
      if (!payload.exp) return false;

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // 유효하지 않은 토큰은 만료된 것으로 간주
    }
  }

  // Authorization 헤더에서 토큰 추출
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7); // 'Bearer ' 제거
  }
}
