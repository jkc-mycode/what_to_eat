import express from 'express';
import { uploadImage } from '../middlewares/image-upload.js';
import { prisma } from '../utils/prisma.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';

const router = express.Router();

// 영수증 제출
router.post('/', uploadImage.single('img'), async (req, res, next) => {
  try {
    const { card, mealType, memberCount, price, date, memo } = req.body;
    const img = req.file;

    const receipt = await prisma.receipt.create({
      data: { card, mealType, memberCount, price, date, memo, img },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.RECEIPT.CREATE.SUCCESS,
    });
  } catch (err) {
    next(err);
  }
});

// 영수증 목록 조회
router.get('/', async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// 영수증 상세 조회
router.get('/:id', async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// 영수증 수정
router.patch('/:id', async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

export default router;
