import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

try {
  await prisma.$connect();
  console.log('DB 연결 성공!!');
} catch (err) {
  console.log('DB 연결 실패!!');
  console.error(err);
}
