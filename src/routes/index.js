import express from 'express';
import authRouter from './auth.js';
import userRouter from './user.js';
import postRouter from './post.js';
import menuRouter from './menu.js';
import receiptRouter from './receipt.js';
import authPassportRouter from './auth-passport.js';
import { accessTokenValidator } from '../middlewares/access-token-validator.js';

const router = express.Router();

router.use('/auth', [authRouter, authPassportRouter]);
router.use('/user', userRouter);
router.use('/post', accessTokenValidator, [postRouter, menuRouter]);
router.use('/receipt', accessTokenValidator, receiptRouter);

export default router;
