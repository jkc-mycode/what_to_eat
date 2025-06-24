import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 매 1분마다 만료된 투표 비활성화
cron.schedule('* * * * *', async () => {
  const now = new Date();
  await prisma.post.updateMany({
    where: {
      isPollActive: true,
      pollExpiresAt: {
        lt: now,
      },
    },
    data: {
      isPollActive: false,
    },
  });
});
