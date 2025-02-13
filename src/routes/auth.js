import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.js';
import { generateToken } from '../utils/generate-token.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';
import { refreshTokenValidator } from '../middlewares/refresh-token-validator.js';

const router = express.Router();

// 회원가입
router.post('/sign-up', async (req, res, next) => {
  try {
    const { name, email, password, passwordCheck, department, position } =
      req.body;

    const isExistUser = await prisma.user.findFirst({
      where: { email },
    });

    if (isExistUser) {
      res
        .status(HTTP_STATUS.CONFLICT)
        .json({ message: MESSAGE.AUTH.SIGN_UP.EMAIL.DUPLICATED });
    }
    if (!passwordCheck) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGE.AUTH.SIGN_UP.PASSWORD.CONFIRM });
    }
    if (password != passwordCheck) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGE.AUTH.SIGN_UP.PASSWORD.NOT_MATCH });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
        position,
      },
      omit: { password: true },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.AUTH.SIGN_UP.SUCCESS,
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
});

// 로그인
router.post('/sign-in', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json(MESSAGE.COMMON.NOT_FOUND);
    }
    const isValidUser = await bcrypt.compare(password, user.password);
    if (!isValidUser) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.COMMON.UNAUTHORIZED });
    }
    const payload = { id: user.id };
    const data = await generateToken(payload);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: MESSAGE.AUTH.SIGN_IN.SUCCESS, data });
  } catch (err) {
    next(err);
  }
});

// 로그아웃
router.post('/sign-out', refreshTokenValidator, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: MESSAGE.AUTH.SIGN_OUT.SUCCESS });
  } catch (err) {
    next(err);
  }
});

// 토큰 재발급
router.post('/refresh', refreshTokenValidator, async (req, res, next) => {
  try {
    const payload = { id: req.user.id };
    const data = await generateToken(payload);
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: MESSAGE.AUTH.SIGN_IN.SUCCESS, data });
  } catch (err) {
    next(err);
  }
});

export default router;
