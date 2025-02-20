import express from 'express';
import { prisma } from '../utils/prisma.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';
import { postCheck } from '../middlewares/post-check.js';

const router = express.Router();

router.use('/:id', postCheck());

// 게시물 생성
router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body;
    const newPost = await prisma.post.create({
      data: {
        userId: req.user.id,
        title,
        department: req.user.department,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.POST.CREATE.SUCCESS,
      data: { newPost },
    });
  } catch (err) {
    next(err);
  }
});

// 게시물 목록 조회
router.get('/', async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { deletedAt: null },
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
      message: MESSAGE.POST.FIND.SUCCESS,
      data: { posts },
    });
  } catch (err) {
    next(err);
  }
});

// 게시물 상세 조회
router.get('/:id', postCheck(true, true), async (req, res, next) => {
  try {
    const post = req.post;

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.POST.FIND.SUCCESS,
      data: { post },
    });
  } catch (err) {
    next(err);
  }
});

// 게시물 수정
router.patch('/:id', async (req, res, next) => {
  try {
    const { title } = req.body;
    const post = req.post;

    if (post.User.id !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }

    const updateData = {
      title: post.title !== title ? title : undefined,
    };

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: updateData,
    });

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.POST.UPDATE.SUCCESS,
      data: { updatedPost },
    });
  } catch (err) {
    next(err);
  }
});

// 게시물 삭제
router.delete('/:id', async (req, res, next) => {
  try {
    const post = req.post;

    if (post.User.id !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { deletedAt: new Date() },
    });

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.POST.DELETE.SUCCESS,
    });
  } catch (err) {
    next(err);
  }
});

// 메뉴 확정
router.post(
  '/:id/confirm-menu',
  postCheck(true, true),
  async (req, res, next) => {
    try {
      const post = req.post;
      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'COMPLETED' },
      });

      return res.status(HTTP_STATUS.CREATED).json({
        message: MESSAGE.MENU.VOTE.COMPLETE,
      });
    } catch (err) {
      next();
    }
  }
);

export default router;
