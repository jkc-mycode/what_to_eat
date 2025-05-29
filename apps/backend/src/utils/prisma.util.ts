import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],

  // 에러 메시지를 평문이 아닌, 개발자가 읽기 쉬운 형태로 출력
  errorFormat: 'pretty',
}); // PrismaClient 인스턴스를 생성합니다.

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('DB 연결에 성공했습니다.');
  } catch (error) {
    console.error('DB 연결에 실패했습니다.', error);
  }
};

connectDB();
