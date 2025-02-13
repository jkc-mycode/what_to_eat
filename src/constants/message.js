export const MESSAGE = {
  COMMON: {
    NOT_FOUND: '일치하는 회원이 없습니다.',
    UNAUTHORIZED: '인증정보가 유효하지 않습니다.',
  },
  ERROR_HANDLER: {
    ETC: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.',
  },
  AUTH: {
    SIGN_UP: {
      SUCCESS: '회원가입에 성공했습니다.',
      EMAIL: {
        DUPLICATED: '중복된 이메일이 존재합니다.',
      },
      PASSWORD: {
        CONFIRM: '비밀번호 확인 입력해 주세요.',
        NOT_MATCH: '비밀번호가 서로 일치하지 않습니다.',
      },
    },
    SIGN_IN: {
      NOT_FOUND: '일치하는 회원이 없습니다.',
      SUCCESS: '로그인에 성공했습니다.',
      FAIL: '로그인에 실패했습니다.',
    },
    SIGN_OUT: {
      SUCCESS: '로그아웃에 성공했습니다.',
    },
    TOKEN: {
      EXPIRED: '토큰이 만료되었습니다.',
      INVALID: '토큰이 유효하지 않습니다.',
    },
  },
  USER: {},
  POST: {},
};
