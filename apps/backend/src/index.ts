import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { prisma } from './utils/prisma.util';

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 라우트 정의
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API 서버가 실행 중입니다.' });
});

console.log('DB 연결 테스트 시작...');
prisma.$queryRaw`SELECT 1`;

// 에러 처리 미들웨어 등록
app.use(errorHandlerMiddleware);

app.listen(SERVER_PORT, () => {
  console.log(`서버가 포트 ${SERVER_PORT}에서 실행 중입니다`);
});
