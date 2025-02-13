import express from 'express';
import passport from '../passport/index.js';
import { generateToken } from '../utils/generate-token.js';
import { MESSAGE } from '../constants/message.js';

const router = express.Router();

router.get('/fail', async (req, res, next) => {
  return res.status(401).json({ message: MESSAGE.AUTH.SIGN_IN.FAIL });
});

router.get('/kakao', passport.authenticate('kakao'));
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/api/auth/fail',
  }),
  async (req, res) => {
    const user = req.user;
    const payload = { id: user.id };
    const data = await generateToken(payload);

    res.status(200).json({
      message: MESSAGE.AUTH.SIGN_IN.SUCCESS,
      data,
    });
  }
);

export default router;
