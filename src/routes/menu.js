import express from 'express';
import { prisma } from '../utils/prisma.js';
import { accessTokenValidator } from '../middlewares/access-token-validator.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';
import { postCheck } from '../middlewares/post-check.js';
import { menuCheck } from '../middlewares/menu-check.js';

const router = express.Router();

router.use('/:id/menu', postCheck());
router.use('/:id/menu/:menuId', menuCheck());

// 메뉴(후보) 추가
router.post('/:id/menu', accessTokenValidator, async (req, res, next) => {
  try {
    const { shopName, foodName, description } = req.body;
    const post = req.post;

    if (post.department !== req.user.department) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }

    const newMenu = await prisma.menu.create({
      data: {
        postId: post.id,
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
    const post = req.post;
    const menus = await prisma.menu.findMany({
      where: { postId: post.id, deletedAt: null },
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
router.get('/:id/menu/:menuId', menuCheck(true), async (req, res, next) => {
  try {
    const menu = req.menu;

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
    const menu = req.menu;
    const voteHistory = await prisma.voteHistory.findFirst({
      where: {
        userId: req.user.id,
        menuId: menu.id,
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
          menuId: menu.id,
        },
      });

      await prisma.menu.update({
        where: { id: menu.id },
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
    const menu = req.menu;
    const voteHistory = await prisma.voteHistory.findFirst({
      where: {
        userId: req.user.id,
        menuId: menu.id,
        isCanceled: false,
      },
    });
    if (!voteHistory) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: MESSAGE.MENU.VOTE_CANCEL.FAIL,
      });
    }

    if (menu.count > 0) {
      await prisma.$transaction(async (prisma) => {
        await prisma.menu.update({
          where: { id: menu.id },
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
    const menu = req.menu;

    if (menu.userId !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }
    const updatedMenu = await prisma.menu.update({
      where: {
        id: menu.id,
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
    const menu = req.menu;
    await prisma.menu.update({
      where: { id: menu.id },
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
