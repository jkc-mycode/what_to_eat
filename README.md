# WhatToEat

음식 투표 및 추천을 위한 커뮤니티 웹 애플리케이션입니다.
사용자는 다양한 음식 투표를 만들고, 참여하며, 결과를 확인할 수 있습니다.

> **이 프로젝트는 Turbo를 활용한 모노레포 구조로 구현되었습니다.**
> 프론트엔드(React)와 백엔드(Node.js, Express, Prisma 등)가 하나의 레포에서 통합관리됩니다.

<br>

## 화면 스크린샷

- 메인 페이지  
  ![메인 페이지](./docs/screenshot-main.png)
- 투표 상세 페이지  
  ![투표 상세](./docs/screenshot-detail.png)
- 투표 생성/수정  
  ![투표 생성](./docs/screenshot-create.png)
- 로그인/회원가입  
  ![로그인](./docs/screenshot-login.png)


<br>

## 주요 기능

### 프론트엔드(React)
- 음식 투표 / 일반 게시글 목록, 검색, 페이징, 탭 필터(전체/진행중/마감)
- 투표 생성, 수정, 삭제 (투표 항목 2~10개, 중복 불가, 만료일 설정)
- 투표 참여 및 결과 실시간 반영
- 내 투표 / 내가 참여한 투표 목록
- 이메일 / 비밀번호 회원가입 및 로그인, 카카오 소셜 로그인
- JWT 기반 인증, 자동 로그인 유지, 로그아웃

### 백엔드(Node.js + Express)
- 게시글/투표 CRUD, 투표 참여/취소, 투표 결과 집계
- 회원가입, 로컬/카카오 로그인, JWT 발급/갱신, 프로필 조회
- 투표 만료 자동 처리(스케줄러 CRON 사용)
- 인증 미들웨어, 에러 핸들러

<br>

## 기술 스택

- **모노레포 관리**: Turbo
- **프론트엔드**: React, TypeScript, Vite, Tailwind CSS, React Router
- **백엔드**: Node.js, Express, TypeScript
- **인증**: Passport.js(Local, Kakao), JWT, httpOnly 쿠키

<br>

## 프로젝트 구조

```
WhatToEat/
  apps/
    frontend/   # 프론트엔드(React)
      src/
        pages/        # Home, Login, Signup, Create/Edit/Detail 등
        services/     # api.service.ts, auth.service.ts
        contexts/     # AuthContext.tsx
        components/   # Header, UI 컴포넌트
    backend/    # 백엔드(Node.js + Express)
      src/
        controllers/  # auth.controller.ts, post.controller.ts
        services/     # auth.service.ts, post.service.ts, jwt.service.ts
        routes/       # auth.routes.ts, post.routes.ts
        types/        # auth.types.ts, post.types.ts
        middlewares/  # 인증, 에러 핸들러
        scheduler/    # poll-expiry.scheduler.ts
        config/       # passport.config.ts, prisma.ts
  packages/     # 공통 타입, 설정 등
  turbo.json    # Turbo 모노레포 설정
```

<br>

## 설치 및 실행

### 1. 레포지토리 클론
```bash
git clone https://github.com/yourname/WhatToEat.git
cd WhatToEat
```

### 2. 패키지 설치
```bash
pnpm install
```

### 3. 환경 변수 설정
- `apps/backend/.env`
- `apps/frontend/.env`

### 4. 개발 서버 실행
```bash
pnpm dev
```

<br>

## 주요 코드 예시

### 프론트엔드

#### 1. API 호출 래퍼 (api.service.ts)
- 모든 API 요청에 인증 토큰을 자동으로 포함하고, 에러를 일관되게 처리합니다.
  ```ts
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const config: RequestInit = { ...options, headers, credentials: 'include' };
    const response = await fetch(url, config);
    if (!response.ok) throw new Error((await response.json()).message || 'API 오류');
    if (response.status === 204) return null;
    return response.json();
  };
  ```


#### 2. 투표 생성 폼 처리 (CreatePostPage.tsx)
- 투표 항목, 만료일 등 폼 데이터를 가공해 API로 전송합니다.
  ```ts
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...유효성 검사 생략
    const requestData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      isPoll: formData.isPoll,
      isPollActive: formData.isPollActive,
      pollExpiresAt: formData.isPoll && formData.pollExpiresAt
        ? fromKstLocalString(formData.pollExpiresAt)
        : null,
      votes: formData.isPoll ? formData.votes.filter((vote) => vote.trim()) : undefined,
    };
    const response = await apiFetch('/post', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    if (response.success) navigate('/');
    else setError(response.message || '생성 실패');
  };
  ```


#### 3. 인증 컨텍스트 사용 (AuthContext.tsx)
- 전역 인증 상태를 쉽게 확인하고, 로그인/로그아웃을 처리할 수 있습니다.
  ```ts
  const { isAuthenticated, user, login, logout } = useAuth();
  if (!isAuthenticated) navigate('/login');
  ```


<br>

### 백엔드

#### 1. 투표 생성/조회/참여 컨트롤러 (post.controller.ts)
- 인증된 사용자만 투표 생성/참여가 가능합니다.
  ```ts
  // 투표 생성
  createPost = async (req, res) => {
    const userId = req.user!.id;
    const dto = req.body;
    const post = await this.postService.createPost(userId, dto);
    res.status(201).json({ success: true, data: post });
  };
  
  // 투표 참여
  vote = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user!.id;
    const dto = req.body;
    await this.postService.vote(postId, userId, dto);
    res.json({ success: true, message: '투표 완료' });
  };
  ```


#### 2. 인증(회원가입/로그인) 컨트롤러 (auth.controller.ts)
- 이메일/비밀번호 회원가입, passport-local 기반 로그인
  ```ts
  // 회원가입
  signUp = async (req, res) => {
    const { email, password } = req.body;
    const result = await this.authService.signUp({ email, password });
    res.status(201).json({ success: true, data: result });
  };
  
  // 로컬 로그인 (passport local)
  signInWithPassport = async (req, res, next) => {
    passport.authenticate('local', async (error, user, info) => {
      if (!user) return res.status(401).json({ success: false, message: info?.message });
      // JWT 토큰 발급 및 쿠키 설정
      // ...
    })(req, res, next);
  };
  ```


#### 3. 투표 만료 스케줄러 (poll-expiry.scheduler.ts)
- 1분마다 만료된 투표를 자동으로 비활성화합니다.
  ```ts
  import cron from 'node-cron';
  import { PrismaClient } from '@prisma/client';
  const prisma = new PrismaClient();
  
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    await prisma.post.updateMany({
      where: { isPollActive: true, pollExpiresAt: { lt: now } },
      data: { isPollActive: false },
    });
  });
  ```


<br>

## 트러블슈팅 기록

### 1. 카카오 소셜 로그인 연동 시, 로그인 후 토큰 저장 및 상태 반영 문제

#### 문제
- 카카오 소셜 로그인 버튼을 누르면 카카오 인증은 정상적으로 진행되지만,  
  로그인 후 홈으로 이동했을 때 로그인 상태(예: 헤더의 버튼, 마이페이지 등)가 즉시 반영되지 않음.

#### 원인
- 카카오 인증 후 백엔드에서 access token과 refresh token을 반환하는데,
  - access token은 JSON 응답으로 내려주고,
  - refresh token은 httpOnly 쿠키로 내려줌.
- 프론트엔드에서는 access token을 localStorage에 저장해야 하지만,  
  콜백 처리 페이지가 없어서 저장 및 상태 갱신이 즉시 이루어지지 않음.
- 또한, 전역 상태(AuthContext)의 user 정보가 갱신되지 않아,  
  홈으로 이동해도 로그인 상태가 바로 반영되지 않음.

#### 해결
1. **카카오 콜백 처리 페이지(`KakaoCallbackPage`) 추가**
   - 백엔드에서 카카오 인증 후, access token을 쿼리스트링으로 프론트엔드 콜백 URL(`/kakao-callback`)로 리다이렉트.
   - 프론트엔드의 `KakaoCallbackPage`에서 access token을 localStorage에 저장하고,  
     바로 user 정보를 불러와 전역 상태(AuthContext)의 user를 갱신.
   - 이후 홈으로 이동하면 새로고침 없이도 로그인 상태가 즉시 반영됨.

2. **AuthContext에 setUser 함수 노출**
   - 외부에서 user 상태를 직접 갱신할 수 있도록 setUser를 context value에 추가.
   - `KakaoCallbackPage`에서 setUser를 사용해 user 정보를 즉시 반영.

3. **카카오 로그인 버튼의 URL을 백엔드 절대경로로 수정**
   - 프론트엔드와 백엔드가 포트가 다를 때,  
     카카오 로그인 버튼의 href를 `http://localhost:3000/api/auth/kakao`로 수정하여 인증이 정상적으로 시작되도록 함.

---

### 2. Refresh Token 보안 처리 관련 질문

#### 문제
- 백엔드에서 refresh token을 암호화해서 DB에 저장하는데,  
  클라이언트에게는 평문으로 전달해도 되는지 의문이 생김.

#### 원인
- refresh token은 장기 세션을 유지하는 중요한 정보이기 때문에,  
  평문으로 노출되면 보안상 위험할 수 있음.

#### 해결
- **refresh token은 httpOnly, secure 쿠키로만 전달**하고,  
  JS 코드에서는 접근할 수 없도록 처리(현재 구조가 표준적이고 안전).
- 개발자 도구(F12)에서는 쿠키 값을 볼 수 있지만,  
  이는 사용자 본인만 볼 수 있는 것이고,  
  웹사이트의 JS 코드에서는 접근이 불가능하므로 보안상 안전함.

---

### 3. 로그인 상태 즉시 반영 관련 UX 개선

#### 문제
- 로그인 후 홈으로 이동했을 때, 로그인 상태가 바로 반영되지 않거나  
  새로고침이 필요할 수 있음.

#### 원인
- access token 저장 후 전역 상태(AuthContext)의 user 정보가 즉시 갱신되지 않으면  
  UI에 로그인 상태가 반영되지 않음.

#### 해결
- `KakaoCallbackPage`에서 access token 저장 후,  
  바로 user 정보를 불러와 setUser로 상태를 갱신하여  
  새로고침 없이도 로그인 상태가 즉시 반영되도록 개선.

---

## 추가 트러블슈팅 사례 (백엔드/검색/서버 실행)

### 4. Prisma 검색에서 mode: 'insensitive' 옵션 에러

**문제**  
게시물 검색 시 Prisma 쿼리에서 `mode: 'insensitive'` 옵션을 사용하면 아래와 같은 에러가 발생합니다.
```
Unknown argument `mode`. Did you mean `lte`? Available options are marked with ?.
```
이로 인해 검색 기능이 동작하지 않고, 서버에서 500 에러가 발생할 수 있습니다.

**원인**  
Prisma의 일부 버전(특히 MySQL 사용 시)에서는 `contains` 연산자에서 `mode: 'insensitive'` 옵션이 지원되지 않습니다.
MySQL의 기본 collation 설정에 따라 대소문자 구분 여부가 결정되는데, collation이 case-insensitive(ci)라면 대소문자 구분 없이 검색됩니다.

**해결**  
- `mode: 'insensitive'` 옵션을 제거하고, 아래와 같이 단순히 `contains`만 사용하세요.
  ```typescript
  { title: { contains: search } }
  ```
- 만약 대소문자 구분이 반드시 필요하다면,
  1. **DB 컬럼의 collation을 bin/binary로 변경**  
     (예: `ALTER TABLE posts MODIFY title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;`)
  2. **Prisma의 queryRaw로 BINARY 비교**  
     (예: `SELECT * FROM posts WHERE BINARY title LIKE '%검색어%'`)
- collation이 ci라면 대소문자 구분 없이 검색되니, 대부분의 서비스에서는 별도 옵션 없이 사용해도 무방합니다.

---

### 5. 서버 코드 수정 후에도 로그(console.log)나 변경 사항이 반영되지 않는 현상

**문제**  
- controller의 constructor에 console.log는 찍히는데, 메서드 내부의 console.log는 출력되지 않음
- 또는, API 응답에 수정한 값이 반영되지 않음
- 실제로는 코드가 바뀌었는데, 서버가 이전 상태로 동작하는 것처럼 보임

**원인**  
- turbo(turborepo) 등으로 dev 서버를 여러 번 실행/종료하면서, 같은 포트(예: 3000번)에 여러 node 서버가 중복 실행됨
- Windows 환경에서 ctrl + c로 turbo를 종료해도 하위 node 프로세스가 완전히 종료되지 않고 남아 있을 수 있음
- 실제로 요청을 처리하는 서버와, 코드를 수정한 서버가 다를 수 있음(즉, "유령 서버"가 남아 있음)

**현상**  
- 서버를 여러 번 띄웠다 내리면, 포트 충돌이 발생하지 않고도 여러 node.exe가 백그라운드에 남아 있을 수 있음
- 코드 수정 후 서버를 재시작해도, 이전에 남아 있던 서버가 계속 요청을 처리함

**해결**  
1. **모든 node 프로세스를 강제 종료**
   ```cmd
   taskkill /F /IM node.exe
   ```
   - 작업 관리자에서 node.exe를 모두 종료해도 됨
2. **터미널을 완전히 닫았다가 다시 열고, 서버를 한 번만 실행**
3. **서버 코드 수정 후에는 반드시 서버를 재시작**
4. **netstat 등으로 포트 점유 상태를 확인하여, 한 번에 하나의 서버만 실행되도록 관리**
   - `netstat -ano | findstr :3000`으로 3000번 포트 점유 프로세스 확인

---

### 6. turbo dev 등 멀티 프로세스 툴 사용 시 안전하게 종료하는 방법

**문제**  
- turbo dev 등으로 여러 패키지를 동시에 실행한 뒤 ctrl + c로 종료해도 하위 node 서버가 남아 있음
- 서버를 여러 번 실행/종료하다 보면, 포트 충돌 없이도 여러 node 서버가 백그라운드에 남아 있음

**원인**  
- turbo가 여러 하위 프로세스를 띄우는데, Windows 등 일부 환경에서는 ctrl + c로 메인 프로세스만 종료되고 하위 프로세스(node)가 남을 수 있음
- 특히, VSCode 내장 터미널이나 PowerShell 등에서는 이런 현상이 더 자주 발생

**해결**  
- 모든 node 프로세스를 강제 종료하거나, 터미널을 완전히 닫아서 모든 하위 프로세스까지 종료
- 서버를 다시 실행하기 전에는 항상 포트 점유 상태를 확인
- 가능하다면, 각 패키지(backend, frontend)를 개별적으로 실행하여 관리

---

### 7. Prisma 검색에서 대소문자 구분이 필요한 경우

**문제**  
- contains로 검색 시 대소문자 구분이 안 됨(예: "Chicken"과 "chicken"이 모두 검색됨)

**원인**  
- MySQL의 기본 collation이 case-insensitive(ci)로 되어 있음

**해결**  
- DB 컬럼의 collation을 bin/binary로 변경하거나, Prisma의 queryRaw로 BINARY 비교 사용
- 예시:  
  ```sql
  ALTER TABLE posts MODIFY title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
  ```
- 단, 프로젝트 요구에 따라 대소문자 구분이 필요 없다면 별도 조치 없이 사용 가능

---

### 8. node-cron 등 스케줄러 추가 후 로그가 안 찍히는 현상

**문제**  
- node-cron 등 스케줄러를 추가한 뒤, 라우터/컨트롤러의 console.log가 안 찍히는 것처럼 보임

**원인**  
- 일반적으로 직접적인 연관은 없으나, 스케줄러 코드에서 예외가 발생해 서버가 죽거나, 여러 서버가 중복 실행된 경우 발생할 수 있음
- 스케줄러 내부에서 처리하지 않은 예외가 발생하면, 서버 전체가 다운될 수 있음

**해결**  
- 스케줄러 코드에 try-catch를 추가해 예외를 방지하고, 서버 중복 실행을 막음
- 스케줄러와 서버 라우터의 로그가 모두 정상적으로 찍히는지, 서버가 한 번만 실행되고 있는지 항상 확인

---

## 트러블슈팅: Vite 'Malformed URI sequence' 에러

**문제**  
Vite 개발 서버를 실행하거나, 프론트엔드에서 이미지를 불러올 때 아래와 같은 에러가 발생할 수 있습니다.
```
Malformed URI sequence in request URL
[vite] Internal server error: URI malformed
```
이 에러가 발생하면 이미지, 정적 파일, 또는 전체 페이지가 정상적으로 표시되지 않을 수 있습니다.

**원인**  
1. `index.html`에 서버 템플릿 문법(`<% ... %>`) 사용
   - Vite는 EJS, JSP, ERB 등 서버 템플릿 문법을 지원하지 않습니다.
   - `index.html`에 `<% ... %>`와 같은 문법이 남아 있으면, Vite가 해당 파일을 정적으로 해석하지 못해 URI 에러가 발생합니다.
   - 예시: `<title><%= title %></title>`
2. public 폴더에 없는 파일을 경로로 참조
   - Vite는 `public` 폴더에 있는 파일만 정적 경로(`/파일명`)로 제공합니다.
   - 예를 들어, `<img src="/test.png" />`를 사용하는데 실제로 `apps/frontend/public/test.png`가 없으면, 잘못된 경로 요청으로 인해 에러가 발생할 수 있습니다.
3. 정적 파일 경로에 쿼리 파라미터 사용
   - Vite의 정적 파일 제공 방식에서는 쿼리 파라미터가 붙은 경로(예: `/placeholder.svg?height=80&width=80`)를 제대로 처리하지 못할 수 있습니다.
   - 이로 인해 내부적으로 잘못된 URI 해석이 일어나 에러가 발생할 수 있습니다.
4. 경로나 파일명에 한글, 공백, 특수문자 포함
   - 파일명이나 경로에 한글, 공백, 특수문자가 포함되어 있으면 URI 인코딩/디코딩 과정에서 문제가 발생할 수 있습니다.

**현상**  
- 이미지, 정적 파일, 또는 전체 페이지가 정상적으로 표시되지 않음
- 브라우저 네트워크 탭에서 404 또는 500 에러가 발생하거나, Vite 서버 터미널에 URI malformed 관련 에러가 출력됨

**해결**  
1. `index.html`에서 서버 템플릿 문법 제거
   - `apps/frontend/index.html` 파일에서 `<% ... %>`와 같은 문법을 모두 삭제하세요.
   - 동적으로 값을 넣고 싶다면, Vite의 환경 변수 문법이나 React 코드에서 처리하세요.
   - 예시(수정 전): `<title><%= title %></title>` → 예시(수정 후): `<title>FoodPoll</title>`
2. public 폴더에 정적 파일 추가 및 경로 확인
   - 필요한 이미지는 반드시 `apps/frontend/public/` 폴더에 넣으세요.
   - `<img src="/파일명" />` 형태로 경로를 지정하면 정상적으로 동작합니다.
   - 예시: `apps/frontend/public/test.png` → `<img src="/test.png" />`
3. 쿼리 파라미터 없이 파일 경로 사용
   - 정적 파일을 불러올 때 쿼리 파라미터(`?height=80&width=80` 등)를 붙이지 마세요.
   - 이미지 크기 조절은 CSS로 처리하세요.
   - 예시(수정 전): `<img src="/placeholder.svg?height=80&width=80" />` → 예시(수정 후): `<img src="/placeholder.svg" style="width:80px; height:80px;" />`
4. 파일명과 경로는 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용
   - 한글, 공백, 특수문자가 포함된 파일명/경로는 피하세요.
   - 예시(수정 전): `/이미지 1.png`, `/테스트@이미지.png` → 예시(수정 후): `/image1.png`, `/test_image.png`
5. Vite 서버 재시작
   - 위의 모든 수정을 한 뒤에는 Vite 개발 서버를 완전히 종료했다가 다시 실행하세요.

문제가 계속된다면, 브라우저 개발자 도구의 네트워크 탭에서 실제 요청 경로와 응답 상태를 확인하고, 추가적인 에러 메시지를 참고하세요.

---
