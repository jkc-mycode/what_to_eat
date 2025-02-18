import express from 'express';
import { prisma } from '../utils/prisma.js';
import { accessTokenValidator } from '../middlewares/access-token-validator.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';

const router = express.Router();

// 메뉴(후보) 추가
router.post('/:id/menu', accessTokenValidator, async (req, res, next) => {
  try {
    const postId = +req.params.id;
    const { shopName, foodName, description } = req.body;
    const post = await prisma.post.findFirst({
      where: { id: postId },
    });
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.POST.FIND.NOT_FOUND,
      });
    }
    if (post.department !== req.user.department) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }

    const newMenu = await prisma.menu.create({
      data: {
        postId,
        userId: +req.user.id,
        shopName,
        foodName,
        description,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.MENU.CREATE.SUCCESS,
      data: { newMenu },
    });
  } catch (err) {
    next(err);
  }
});

// 메뉴 목록 조회
router.get('/:id/menu', async (req, res, next) => {
  try {
    const postId = +req.params.id;
    const menus = await prisma.menu.findMany({
      where: { postId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.MENU.FIND.SUCCESS,
      data: { menus },
    });
  } catch (err) {
    next(err);
  }
});

// 메뉴 상세 조회
router.get('/:id/menu/:menuId', async (req, res, next) => {
  try {
    const menuId = +req.params.menuId;
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
    });
    if (!menu) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.MENU.FIND.NOT_FOUND,
      });
    }
    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.MENU.FIND.SUCCESS,
      data: { menu },
    });
  } catch (err) {
    next(err);
  }
});

// 메뉴 투표
router.post('/:id/menu/:menuId/vote', async (req, res, next) => {
  try {
    const menuId = +req.params.menuId;
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
    });
    if (!menu) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.MENU.FIND.NOT_FOUND,
      });
    }
    const voteHistory = await prisma.voteHistory.findFirst({
      where: {
        userId: req.user.id,
        menuId,
        isCanceled: false,
      },
    });
    if (voteHistory) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: MESSAGE.MENU.VOTE.DUPLICATED,
      });
    }
    await prisma.$transaction(async (prisma) => {
      await prisma.voteHistory.create({
        data: {
          userId: req.user.id,
          menuId,
        },
      });

      await prisma.menu.update({
        where: { id: menuId },
        data: {
          count: {
            increment: 1,
          },
        },
      });
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.MENU.VOTE.SUCCESS,
    });
  } catch (err) {
    next(err);
  }
});

// 메뉴 투표 취소
router.post('/:id/menu/:menuId/cancel', async (req, res, next) => {
  try {
    const menuId = +req.params.menuId;
    const voteHistory = await prisma.voteHistory.findFirst({
      where: {
        userId: req.user.id,
        menuId,
        isCanceled: false,
      },
    });
    if (!voteHistory) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: MESSAGE.MENU.VOTE_CANCEL.FAIL,
      });
    }

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
    });
    if (!menu) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.MENU.FIND.NOT_FOUND,
      });
    }
    if (menu.count > 0) {
      await prisma.$transaction(async (prisma) => {
        await prisma.menu.update({
          where: { id: menuId },
          data: {
            count: {
              decrement: 1,
            },
          },
        });

        await prisma.voteHistory.update({
          where: { id: voteHistory.id },
          data: { isCanceled: true },
        });
      });
    } else {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: MESSAGE.MENU.VOTE_CANCEL.FAIL,
      });
    }

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.MENU.VOTE_CANCEL.SUCCESS,
    });
  } catch (err) {
    next(err);
  }
});

// 게시물 메뉴 수정
router.patch('/:id/menu/:menuId', async (req, res, next) => {
  try {
    const { shopName, foodName, description } = req.body;
    const menu = await prisma.menu.findFirst({
      where: { id: +req.params.menuId, deletedAt: null },
    });
    if (!menu) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.MENU.FIND.NOT_FOUND,
      });
    }

    if (menu.userId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }
    const updatedMenu = await prisma.menu.update({
      where: {
        id: +req.params.menuId,
      },
      data: {
        shopName,
        foodName,
        description,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.MENU.UPDATE.SUCCESS,
      data: { updatedMenu },
    });
  } catch (err) {
    next(err);
  }
});

// 게시물 메뉴 삭제
router.delete('/:id/menu/:menuId', async (req, res, next) => {
  try {
    const menuId = +req.params.menuId;
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, deletedAt: null },
    });
    if (!menu) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.MENU.FIND.NOT_FOUND,
      });
    }
    await prisma.menu.update({
      where: { id: menuId },
      data: { deletedAt: new Date() },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.MENU.DELETE.SUCCESS,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
