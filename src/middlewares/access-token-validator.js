import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';

export const accessTokenValidator = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [tokenType, accessToken] = authorization?.split(' ');

    if (tokenType !== 'Bearer') {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.AUTH.TOKEN.INVALID });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: MESSAGE.AUTH.TOKEN.EXPIRED });
      } else {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: MESSAGE.AUTH.TOKEN.INVALID });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      omit: { password: true },
    });

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.COMMON.NOT_FOUND });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    next();
  }
};
