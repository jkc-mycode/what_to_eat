import express from 'express';
import authRouter from './auth.js';
import userRouter from './user.js';
import postRouter from './post.js';
import authPassportRouter from './auth-passport.js';

const router = express.Router();

router.use('/auth', [authRouter, authPassportRouter]);
router.use('/user', userRouter);
router.use('/post', postRouter);

export default router;
