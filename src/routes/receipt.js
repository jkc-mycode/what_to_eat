import express from 'express';
import { uploadImage } from '../middlewares/image-upload.js';
import { prisma } from '../utils/prisma.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';
import { postCheck } from '../middlewares/post-check.js';

const router = express.Router();

router.use('/:id/menu', postCheck());

// 영수증 제출
router.post(
  '/:id/receipt',
  uploadImage.single('img'),
  async (req, res, next) => {
    try {
      const { card, mealType, memberCount, price, date, memo } = req.body;
      const img = req.file;

      if (req.post.status !== 'COMPLETED') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: MESSAGE.POST.FIND.NOT_COMPLETED,
        });
      }

      const receipt = await prisma.receipt.create({
        data: {
          card,
          mealType,
          memberCount: +memberCount,
          price: +price,
          date: new Date(date),
          memo,
          img: img?.location,
          Post: {
            connect: {
              id: req.post.id,
            },
          },
        },
      });

      return res.status(HTTP_STATUS.CREATED).json({
        message: MESSAGE.RECEIPT.CREATE.SUCCESS,
        data: { receipt },
      });
    } catch (err) {
      next(err);
    }
  }
);

// 영수증 목록 조회
router.get('/:id/receipt', async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// 영수증 상세 조회
router.get('/:id/receipt/:receiptId', async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

// 영수증 수정
router.patch('/:id/receipt/:receiptId', async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

export default router;
