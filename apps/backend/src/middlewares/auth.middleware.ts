import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { JwtService } from '../services/jwt.service';

// Passport JWT 미들웨어 (Access Token 인증용)
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (error: any, user: any, info: any) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: '인증 처리 중 오류가 발생했습니다.',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || '인증이 필요합니다.',
      });
    }

    // req.user에 사용자 정보 설정
    req.user = user;
    next();
  })(req, res, next);
};

// Refresh Token 검증 미들웨어
export const authenticateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 헤더 대신 쿠키에서 Refresh Token을 가져옴
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh Token이 필요합니다. 다시 로그인해주세요.',
      });
      return;
    }

    const jwtService = new JwtService();

    // Refresh Token 검증
    const decoded = await jwtService.verifyRefreshToken(refreshToken);

    // req에 사용자 ID 설정
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : '유효하지 않은 Refresh Token입니다.',
    });
  }
};
