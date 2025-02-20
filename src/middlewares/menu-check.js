import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';
import { prisma } from '../utils/prisma.js';

export const menuCheck = (voteHistory = null) => {
  return async (req, res, next) => {
    try {
      const post = req.post;
      if (post.status !== 'IN_PROGRESS') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: MESSAGE.MENU.VOTE.FAIL,
        });
      }

      const menuId = +req.params.menuId;
      const menu = await prisma.menu.findFirst({
        where: { id: menuId, deletedAt: null },
      });
      if (!menu) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          message: MESSAGE.MENU.FIND.NOT_FOUND,
        });
      }

      if (voteHistory) {
        menu.VoteHistory = await prisma.voteHistory.findMany({
          where: { menuId: menu.id },
        });
      }
      req.menu = menu;
      next();
    } catch (err) {
      next(err);
    }
  };
};
