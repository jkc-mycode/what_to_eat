import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.util';
import { SignUpRequestDTO, UserEntity, SignUpResponseDTO } from '../types/auth.types';

export class AuthService {
  private readonly saltRounds = 10;

  // 회원가입
  async signUp(data: SignUpRequestDTO): Promise<SignUpResponseDTO> {
    const { email, password } = data;

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }

  // 사용자 정보 조회
  async getUserById(id: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return user;
  }
}
