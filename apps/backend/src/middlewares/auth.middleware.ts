import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

// Passport JWT 미들웨어 (사용자 인증 확인용 미들웨어)
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
