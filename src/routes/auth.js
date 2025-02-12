import express from 'express';

const router = express.Router();

// 회원가입
router.post('/sign-up', async (req, res, next) => {
  try {
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 로그인
router.post('/sign-in', async (req, res, next) => {
  try {
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 로그아웃
router.post('/sign-out', async (req, res, next) => {
  try {
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 토큰 재발급
router.post('/refresh', async (req, res, next) => {
  try {
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;
