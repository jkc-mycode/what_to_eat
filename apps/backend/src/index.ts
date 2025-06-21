import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

dotenv.config();

import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { prisma } from './utils/prisma.util';
import './config/passport.config'; // Passport 설정 초기화
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3000;

// CORS 설정 - credentials: 'include'와 호환되도록 설정
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://your-production-domain.com'
        : 'http://localhost:5173', // 개발 환경에서 프론트엔드 URL
    credentials: true, // 쿠키를 포함한 요청 허용
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// 세션 설정 (나중에 사용)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24시간
      httpOnly: true, // Refresh Token 보안을 위해 설정
    },
  })
);

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 라우트 정의
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API 서버가 실행 중입니다.' });
});

// 인증 라우트
app.use('/api/auth', authRoutes);

// 게시물 라우트
app.use('/api/post', postRoutes);

console.log('DB 연결 테스트 시작...');
prisma.$queryRaw`SELECT 1`;

// 에러 처리 미들웨어 등록
app.use(errorHandlerMiddleware);

app.listen(SERVER_PORT, () => {
  console.log(`서버가 포트 ${SERVER_PORT}에서 실행 중입니다`);
});
