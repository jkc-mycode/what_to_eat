import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthService } from '../services/auth.service';
import {
  SignUpRequestDTO,
  AuthenticatedRequest,
  ApiResponse,
  ErrorResponseDTO,
  SignUpResponseDTO,
  AuthResponseDTO,
} from '../types/auth.types';
import { JwtService } from '../services/jwt.service';

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
  signInWithPassport = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('local', (error: any, user: any, info: any) => {
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

      // JWT 토큰 생성 (JwtService 통해서)
      const token = this.jwtService.generateToken(user.id);

      const { password: _, ...userWithoutPassword } = user;

      const successResponse: ApiResponse<AuthResponseDTO> = {
        success: true,
        message: '로그인이 완료되었습니다.',
        data: {
          user: userWithoutPassword,
          token,
        },
      };
      res.json(successResponse);
    })(req, res, next);
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

      const successResponse: ApiResponse = {
        success: true,
        data: { user },
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

  // 로그아웃 (추후 Redis 연동 시 사용)
  signOut = (req: Request, res: Response): void => {
    const successResponse: ApiResponse = {
      success: true,
      message: '로그아웃이 완료되었습니다.',
    };
    res.json(successResponse);
  };
}
