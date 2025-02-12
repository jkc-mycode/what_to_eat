import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { AUTH_CONSTANT } from '../constants/auth.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';

export const generateToken = async (payload) => {
  const userId = payload.id;
  // accessToken 생성
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: AUTH_CONSTANT.ACCESS_TOKEN_EXPIRED_IN,
  });

  // refreshToken 생성
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: AUTH_CONSTANT.REFRESH_TOKEN_EXPIRED_IN,
  });

  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: MESSAGE.AUTH.SIGN_IN.NOT_FOUND });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });
  return { accessToken, refreshToken };
};
