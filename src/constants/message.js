export const MESSAGE = {
  COMMON: {
    NOT_FOUND: '일치하는 회원이 없습니다.',
    UNAUTHORIZED: '인증정보가 유효하지 않습니다.',
    FORBIDDEN: '권한이 없습니다.',
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
  POST: {
    CREATE: {
      SUCCESS: '게시물 생성에 성공했습니다.',
    },
    FIND: {
      SUCCESS: '게시물 조회에 성공했습니다.',
      NOT_FOUND: '조회된 게시물이 없습니다.',
    },
    UPDATE: {
      SUCCESS: '게시물 수정에 성공했습니다.',
    },
    DELETE: {
      SUCCESS: '게시물 삭제에 성공했습니다.',
    },
  },
  MENU: {
    CREATE: {
      SUCCESS: '메뉴 생성에 성공했습니다.',
    },
    FIND: {
      SUCCESS: '메뉴 조회에 성공했습니다.',
      NOT_FOUND: '조회된 메뉴가 없습니다.',
    },
    VOTE: {
      SUCCESS: '메뉴 투표에 성공했습니다.',
      DUPLICATED: '이미 투표했습니다.',
      FAIL: '투표를 진행할 수 없습니다.',
      COMPLETE: '투표를 종료합니다.',
    },
    VOTE_CANCEL: {
      SUCCESS: '메뉴 투표 취소에 성공했습니다.',
      FAIL: '투표 취소할 수 없습니다.',
    },
    UPDATE: {
      SUCCESS: '메뉴 수정에 성공했습니다.',
    },
    DELETE: {
      SUCCESS: '메뉴 삭제에 성공했습니다.',
    },
  },
  RECEIPT: {
    CREATE: {
      SUCCESS: '영수증 생성에 성공했습니다.',
    },
  },
};
