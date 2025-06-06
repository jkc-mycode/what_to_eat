import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT, authenticateRefreshToken } from '../middlewares/auth.middleware';
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
    failureRedirect: '/login?error=kakao_failed',
    session: false,
  }),
  authController.kakaoCallback
);

// 로그아웃 (Access Token 필요)
router.post('/signout', authenticateJWT, authController.signOut as any);

// 토큰 갱신 (Refresh Token 필요)
router.post('/refresh', authenticateRefreshToken, authController.refreshToken);

// 사용자 프로필 조회 (Access Token 필요)
router.get('/profile', authenticateJWT, authController.getProfile as any);

// 토큰 유효성 검증 (Access Token 필요)
router.get('/verify', authenticateJWT, (req, res) => {
  const authReq = req as AuthenticatedRequest;
  res.json({
    success: true,
    message: '유효한 Access Token입니다.',
    data: {
      user: authReq.user,
      tokenType: 'access',
    },
  });
});

export default router;
