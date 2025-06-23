import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util';
import bcrypt from 'bcrypt';

export class JwtService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || 'your-accessSecret-key';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refreshSecret-key';
  }

  // 액세스 토큰 생성 (짧은 만료시간)
  generateAccessToken(userId: string): string {
    const payload = {
      id: userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30분
    };

    return jwt.sign(payload, this.accessSecret);
  }

  // 리프레시 토큰 생성 및 DB 저장
  async generateRefreshToken(userId: string): Promise<string> {
    const payload = {
      id: userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7일
    };

    const refreshToken = jwt.sign(payload, this.refreshSecret);

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // DB에 해시형태의 리프레시 토큰 저장
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: tokenHash,
        refreshTokenExpiresAt: expiresAt,
      },
    });

    return refreshToken; // 원본 토큰 반환
  }

  // 액세스 토큰 검증
  verifyAccessToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.accessSecret);
      if ((decoded as any).type !== 'access') {
        throw new Error('유효하지 않은 토큰입니다.');
      }
      return decoded;
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.');
    }
  }

  // 리프레시 토큰 검증
  async verifyRefreshToken(refreshToken: string): Promise<any> {
    try {
      // 1. JWT 서명 검증
      const decoded = jwt.verify(refreshToken, this.refreshSecret) as any;

      // 2. 토큰 타입 확인
      if (decoded.type !== 'refresh') {
        throw new Error('유효하지 않은 토큰 타입입니다.');
      }

      // 3. DB에서 사용자와 해시된 토큰 조회
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          refreshToken: true,
          refreshTokenExpiresAt: true,
        },
      });

      if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) {
        throw new Error('유효하지 않은 리프레시 토큰입니다.');
      }

      // 4. bcrypt로 토큰 해시 비교
      const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isTokenValid) {
        throw new Error('유효하지 않은 리프레시 토큰입니다.');
      }

      // 5. 만료 시간 확인
      if (new Date() > user.refreshTokenExpiresAt) {
        await this.revokeRefreshToken(user.id);
        throw new Error('만료된 리프레시 토큰입니다.');
      }

      return { id: user.id };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('변조된 리프레시 토큰입니다.');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('만료된 리프레시 토큰입니다.');
      }
      throw new Error('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  // 토큰 쌍 생성
  async generateTokens(userId: string) {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 리프레시 토큰 무효화
  async revokeRefreshToken(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });
  }

  // 모든 토큰 무효화 (로그아웃 시 사용)
  async revokeAllTokens(userId: string): Promise<void> {
    await this.revokeRefreshToken(userId);
  }
}
