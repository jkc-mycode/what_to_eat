import express from 'express';
import { prisma } from '../utils/prisma.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';

const router = express.Router();

// 게시물 생성
router.post('/', async (req, res, next) => {
  try {
    const { title, department } = req.body;
    const newPost = await prisma.post.create({
      data: {
        userId: req.user.id,
        title,
        department,
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
router.get('/:id', async (req, res, next) => {
  try {
    const post = await prisma.post.findFirst({
      where: { id: +req.params.id },
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
        Menu: true,
        Receipt: true,
      },
    });
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.POST.FIND.NOT_FOUND,
      });
    }
    console.log(post);
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
    const { title, department } = req.body;
    const postId = +req.params.id;
    const post = await prisma.post.findFirst({
      where: { id: postId },
      include: { User: true },
    });
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.POST.FIND.NOT_FOUND,
      });
    }
    if (post.User.id !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }

    const updateData = {
      title: post.title !== title ? title : undefined,
      department: post.department !== department ? department : undefined,
    };

    const updatedPost = await prisma.post.update({
      where: { id: postId },
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
    const postId = +req.params.id;
    const post = await prisma.post.findFirst({
      where: { id: postId },
      include: { User: true },
    });
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.POST.FIND.NOT_FOUND,
      });
    }
    if (post.User.id !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.COMMON.FORBIDDEN,
      });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.POST.DELETE.SUCCESS,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
