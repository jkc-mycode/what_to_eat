import passport from 'passport';
import { passportKakao } from './kakao-strategy.js';
import { prisma } from '../utils/prisma.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passportKakao();

export default passport;
