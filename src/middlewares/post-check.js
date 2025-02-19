import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';
import { prisma } from '../utils/prisma.js';

export const postCheck = (menu = null, receipt = null) => {
  return async (req, res, next) => {
    try {
      const postId = +req.params.id;
      const post = await prisma.post.findFirst({
        where: { id: postId, deletedAt: null },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              deletedAt: true,
            },
          },
        },
      });

      if (!post) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          message: MESSAGE.POST.FIND.NOT_FOUND,
        });
      }

      if (menu) {
        post.Menu = await prisma.menu.findMany({
          where: { postId: post.id, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
      }
      if (receipt) {
        post.Receipt = await prisma.receipt.findMany({
          where: { postId: post.id, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
      }
      req.post = post;
      next();
    } catch (err) {
      next(err);
    }
  };
};
