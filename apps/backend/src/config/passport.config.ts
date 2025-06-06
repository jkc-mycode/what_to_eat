import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.util';

// Local Strategy (로그인에서 사용)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done) => {
      try {
        // 사용자 찾기
        const user = await prisma.user.findUnique({
          where: { email },
          omit: {
            refreshToken: true,
            refreshTokenExpiresAt: true,
          },
        });

        if (!user) {
          return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Kakao Strategy (카카오톡 소셜 로그인에서 사용)
passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
      callbackURL:
        process.env.KAKAO_CALLBACK_URL || 'http://localhost:3000/api/auth/kakao/callback',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // 카카오 프로필에서 정보 추출
        console.log('profile', profile);
        const kakaoId = profile.id;
        const email = profile._json.kakao_account?.email;
        const nickname = profile.displayName || profile._json.properties?.nickname;

        // 기존 사용자 찾기 (카카오 ID로)
        let user = await prisma.user.findUnique({
          where: { socialId: String(kakaoId) },
          omit: {
            password: true,
            refreshToken: true,
            refreshTokenExpiresAt: true,
          },
        });

        if (user) {
          // 기존 사용자면 로그인
          return done(null, user);
        }

        // 이메일로 기존 사용자 찾기
        if (email) {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            omit: {
              refreshToken: true,
              refreshTokenExpiresAt: true,
            },
          });

          if (existingUser) {
            // 기존 계정에 카카오 ID 연결
            user = await prisma.user.update({
              where: { email },
              data: { socialId: String(kakaoId) },
              omit: {
                password: true,
                refreshToken: true,
                refreshTokenExpiresAt: true,
              },
            });
            return done(null, user);
          }
        }

        // 새 사용자 생성
        user = await prisma.user.create({
          data: {
            email: email || `kakao_${kakaoId}@kakao.com`,
            password: '',
            nickname: nickname || `카카오사용자${kakaoId}`,
            socialId: String(kakaoId),
          },
          omit: {
            password: true,
            refreshToken: true,
            refreshTokenExpiresAt: true,
          },
        });

        return done(null, user);
      } catch (error) {
        console.error('카카오 로그인 에러:', error);
        return done(error, null);
      }
    }
  )
);

// JWT Strategy (토큰 인증에서 사용)
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
    },
    async (payload, done) => {
      try {
        if (payload.type !== 'access') {
          return done(null, false, { message: 'Access Token이 필요합니다.' });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          return done(null, false, { message: '만료된 토큰입니다.' });
        }

        const user = await prisma.user.findUnique({
          where: { id: payload.id },
          select: {
            id: true,
            email: true,
            nickname: true,
            createdAt: true,
          },
        });

        if (user) {
          return done(null, user);
        } else {
          return done(null, false, { message: '사용자를 찾을 수 없습니다.' });
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Passport 세션 직렬화/역직렬화 설정
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      omit: {
        password: true,
        refreshToken: true,
        refreshTokenExpiresAt: true,
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
