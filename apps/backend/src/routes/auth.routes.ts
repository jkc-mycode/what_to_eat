import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { AuthenticatedRequest } from '../types/auth.types';
import { AuthService } from '../services/auth.service';
import { JwtService } from '../services/jwt.service';
import passport from '../config/passport.config';

const router = Router();
const authController = new AuthController(new AuthService(), new JwtService());

// 회원가입
router.post('/signup', authController.signUp);

// 로그인 (Passport Local Strategy 사용)
router.post('/signin', authController.signInWithPassport);

// 카카오 로그인 시작
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=kakao_failed`,
    session: false,
  }),
  authController.kakaoCallback
);

// 로그아웃
router.post('/signout', authController.signOut);

// 사용자 프로필 조회 (인증 필요)
router.get('/profile', authenticateJWT, authController.getProfile as any);

// 토큰 유효성 검증
router.get('/verify', authenticateJWT, (req, res) => {
  const authReq = req as AuthenticatedRequest;
  res.json({
    success: true,
    message: '유효한 토큰입니다.',
    data: {
      user: authReq.user,
    },
  });
});

export default router;
