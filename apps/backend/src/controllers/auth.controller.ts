import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthService } from '../services/auth.service';
import {
  SignUpRequestDTO,
  AuthenticatedRequest,
  SignUpResponseDTO,
  AuthResponseDTO,
} from '../types/auth.types';
import { JwtService } from '../services/jwt.service';
import { ApiResponse, ErrorResponseDTO } from '../types/common.types';

export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  // 회원가입
  signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password }: SignUpRequestDTO = req.body;

      // 입력값 검증
      if (!email || !password) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '이메일과 비밀번호를 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '올바른 이메일 형식을 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 비밀번호 길이 검증
      if (password.length < 4) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '비밀번호는 최소 4자 이상이어야 합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const result = await this.authService.signUp({ email, password });

      const successResponse: ApiResponse<SignUpResponseDTO> = {
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: result,
      };

      res.status(201).json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        res.status(400).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // Passport Local Strategy를 사용한 로그인
  signInWithPassport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    passport.authenticate('local', async (error: any, user: any, info: any) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: info?.message || '로그인에 실패했습니다.',
        };
        res.status(401).json(errorResponse);
        return;
      }

      try {
        // JWT 토큰 생성
        const { accessToken, refreshToken } = await this.jwtService.generateTokens(user.id);

        // Refresh Token은 httpOnly 쿠키로 설정
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // https에서만 쿠키 전송
          sameSite: 'strict', // 같은 사이튜에서만 쿠키 전송
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        });

        const { password: _, ...userWithoutPassword } = user;

        // Access Token만 JSON으로 전송
        const successResponse: ApiResponse<AuthResponseDTO> = {
          success: true,
          message: '로그인이 완료되었습니다.',
          data: {
            user: userWithoutPassword,
            accessToken,
          },
        };
        res.json(successResponse);
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  };

  // 카카오 OAuth 콜백 처리
  kakaoCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as any;

      if (!user) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '로그인에 실패했습니다.',
        };
        res.status(401).json(errorResponse);
        return;
      }

      // JWT 토큰 생성 (JwtService 통해서)
      const { accessToken, refreshToken } = await this.jwtService.generateTokens(user.id);

      res.json({ accessToken, refreshToken });
    } catch (error) {
      console.error('카카오 콜백 처리 에러:', error);
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        res.status(400).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 토큰 재발급
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as any;
      // 새로운 토큰 쌍 생성
      const { accessToken, refreshToken } = await this.jwtService.generateTokens(user.id);

      // 새로운 Refresh Token을 httpOnly 쿠키로 설정
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      });

      // 새로운 Access Token만 JSON으로 전송
      const successResponse: ApiResponse = {
        success: true,
        message: '토큰이 갱신되었습니다.',
        data: {
          accessToken,
        },
      };
      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        res.status(401).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 사용자 정보 조회
  getProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;

      const user = await this.authService.getUserById(userId);

      const { refreshToken, refreshTokenExpiresAt, ...userWithoutRefreshToken } = user;

      const successResponse: ApiResponse = {
        success: true,
        data: { user: userWithoutRefreshToken },
      };
      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        res.status(404).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 로그아웃
  signOut = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '유효한 사용자 정보를 찾을 수 없습니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 사용자 조회 (리프레시 토큰 상태 확인)
      const user = await this.authService.getUserById(userId);
      if (!user) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
        res.status(404).json(errorResponse);
        return;
      }

      // 이미 로그아웃된 상태인지 확인
      if (!user.refreshToken) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '이미 로그아웃되어 있습니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 리프레시 토큰 무효화
      await this.jwtService.revokeAllTokens(userId);

      // 쿠키 제거
      res.clearCookie('refreshToken');

      const successResponse: ApiResponse = {
        success: true,
        message: '로그아웃이 완료되었습니다.',
      };
      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        res.status(400).json(errorResponse);
        return;
      }
      next(error);
    }
  };
}
