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
      where: { postId },
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
    console.log();
  } catch (err) {
    next(err);
  }
});

// 메뉴 투표
router.post('/:id/menu/:menuId', async (req, res, next) => {
  try {
    console.log();
  } catch (err) {
    next(err);
  }
});

// 게시물 메뉴 수정
router.patch('/:id/menu/:menuId', async (req, res, next) => {
  try {
    console.log();
  } catch (err) {
    next(err);
  }
});

// 게시물 메뉴 삭제
router.delete('/:id/menu/:menuId', async (req, res, next) => {
  try {
    console.log();
  } catch (err) {
    next(err);
  }
});

export default router;
