import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.js';

const passportKakao = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: process.env.KAKAO_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findFirst({
            where: { socialId: String(profile.id) },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.username,
                provider: profile.provider,
                email: profile._json.kakao_account.email,
                socialId: String(profile.id),
              },
            });
          }
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
};

export { passportKakao };
