# ReadMind - 당신의 두뇌를 위한 디지털 헬스장

정보의 홍수 속에서, 당신은 얼마나 효과적으로 읽고 있나요? **ReadMind**는 단순히 글자를 빠르게 보여주는 도구가 아닙니다. 당신의 읽기 능력을 체계적으로 훈련하고, 중요한 정보를 놓치지 않도록 돕는 **개인 맞춤형 속독 트레이너이자 지식 관리 시스템**입니다.

매일 쏟아지는 뉴스 기사, 업무 이메일, 전공 서적까지. ReadMind를 통해 당신의 읽기 습관을 혁신하고, 습득한 지식을 자신만의 노트에 기록하고 관리해보세요. 이 모든 데이터는 당신만이 접근할 수 있는 개인 서버에 안전하게 저장됩니다.

## ✨ 주요 기능 (Key Features)

### 📝 **지능형 마크다운 에디터**
- **실시간 마크다운 편집**: GitHub 스타일의 마크다운 에디터로 문서를 작성하고 실시간 미리보기를 제공합니다
- **문서 관리 시스템**: 생성, 읽기, 수정, 삭제(CRUD) 기능을 통해 개인 지식 베이스를 구축할 수 있습니다
- **자동 저장**: 작성 중인 문서가 자동으로 저장되어 데이터 손실을 방지합니다
- **클라우드 동기화**: 로그인한 사용자의 문서는 서버에 안전하게 저장되어 어디서든 접근 가능합니다

### 🚀 **고급 속독 훈련 시스템**
- **두 가지 읽기 모드**:
  - **플래시 모드**: 단어를 하나씩 중앙에 표시하여 집중력을 극대화
  - **텔레프롬프터 모드**: 실제 책처럼 여러 단어를 한 번에 표시하여 자연스러운 읽기 연습
- **정밀한 속도 제어**: WPM(분당 단어 수) 50-1000 범위에서 세밀하게 조절 가능
- **단어 묶음(Chunking)**: 1-10개 단어를 묶어서 표시하여 읽기 효율성 향상
- **시선 고정점**: 단어 내 특정 위치에 시선을 고정하여 읽기 속도 향상

### 🌍 **다국어 텍스트 분석**
- **영어**: 공백 기반 단어 분리로 자연스러운 읽기 흐름 제공
- **한국어**: 한글 특성을 고려한 글자 단위 분리로 정확한 속독 지원
- **일본어**: Kuromoji.js 형태소 분석기를 통한 의미 단위 분리
- **중국어**: 글자 단위 분리로 한자 텍스트 처리
- **자동 정제**: URL, 이메일, 특수기호 등 읽기 방해 요소 자동 제거

### 🎨 **Material 3 디자인 시스템**
- **현대적 UI**: Google Material 3 디자인 가이드라인을 완전히 준수
- **다크/라이트 모드**: 시스템 설정에 따른 자동 테마 전환 및 수동 전환 지원
- **다양한 색상 테마**: Blue, Green, Purple, Orange 테마 제공
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 경험
- **접근성**: ARIA 속성과 키보드 네비게이션으로 모든 사용자가 접근 가능

### 🔐 **엔터프라이즈급 보안**
- **JWT 인증**: 24시간 만료 토큰과 자동 갱신 시스템
- **비밀번호 암호화**: bcryptjs를 사용한 솔트 포함 해싱
- **reCAPTCHA**: 봇 공격 방지를 위한 Google reCAPTCHA v2 통합
- **Rate Limiting**: API 요청 제한으로 서버 보호
- **HTTPS 강제**: 모든 통신의 암호화 보장
- **보안 헤더**: XSS, CSRF, 클릭재킹 등 다양한 공격 방어

### ⚡ **고성능 최적화**
- **SQLite 인덱싱**: 데이터베이스 쿼리 성능 최적화
- **JavaScript 번들링**: Rollup을 사용한 코드 압축 및 최적화
- **CDN 활용**: 외부 라이브러리 CDN 로드로 서버 부하 감소
- **메모리 관리**: 효율적인 DOM 조작과 이벤트 리스너 관리

## 🛠️ 기술 스택 (Technology Stack)

### Frontend
- **Vanilla JavaScript (ES6 Modules)**: 프레임워크 없는 순수 JavaScript로 가볍고 빠른 성능
- **Material Web Components**: Google의 공식 Material 3 컴포넌트 라이브러리
- **Tailwind CSS**: 유틸리티-우선 CSS 프레임워크
- **SimpleMDE**: 마크다운 에디터
- **Kuromoji.js**: 일본어 형태소 분석기
- **Rollup**: JavaScript 번들러

### Backend
- **Node.js & Express.js**: JavaScript 서버 런타임과 웹 프레임워크
- **SQLite**: 파일 기반 경량 데이터베이스
- **JWT**: 토큰 기반 인증
- **bcryptjs**: 비밀번호 해싱
- **express-rate-limit**: API 요청 제한
- **CORS**: 크로스 오리진 리소스 공유

### Infrastructure
- **Caddy**: 자동 HTTPS 웹 서버
- **Docker**: 컨테이너화 (선택사항)

## 📂 프로젝트 구조 (Project Structure)

```
readmind-main/
├── 📁 backend/                    # 백엔드 서버 코드
│   ├── 📄 server.js              # Express 서버 메인 파일
│   ├── 📄 database.js            # SQLite 데이터베이스 설정
│   ├── 📁 middleware/            # 미들웨어
│   │   ├── 📄 auth.js           # JWT 인증 미들웨어
│   │   └── 📄 captcha_verification.js  # reCAPTCHA 검증
│   ├── 📁 routes/               # API 라우트
│   │   ├── 📄 auth.js          # 인증 관련 API
│   │   ├── 📄 documents.js     # 문서 관리 API
│   │   ├── 📄 settings.js      # 사용자 설정 API
│   │   └── 📄 health.js        # 헬스체크 API
│   └── 📄 package.json         # 백엔드 의존성
├── 📁 public/                   # 프론트엔드 정적 파일
│   ├── 📄 index.html           # 메인 HTML 파일
│   ├── 📄 main.js              # 애플리케이션 진입점
│   ├── 📄 state.js             # 전역 상태 관리
│   ├── 📄 save_manager.js      # 설정 저장 관리
│   ├── 📄 auth.js              # 인증 관련 함수
│   ├── 📄 ui.js                # UI 로직 및 DOM 조작
│   ├── 📄 reader.js            # 속독 엔진
│   ├── 📄 text_handler.js      # 텍스트 분석 및 처리
│   ├── 📄 document_manager.js  # 문서 관리
│   ├── 📄 translations.js      # 다국어 번역
│   ├── 📄 themes.css           # Material 3 테마
│   ├── 📁 dist/               # 번들된 JavaScript
│   │   └── 📄 bundle.js       # 최적화된 번들 파일
│   └── 📄 favicon.png         # 사이트 아이콘
├── 📄 package.json            # 프로젝트 메타데이터
├── 📄 rollup.config.js        # 번들러 설정
├── 📄 Caddyfile              # Caddy 웹서버 설정
├── 📄 setup.sh               # 자동 설치 스크립트
└── 📄 README.md              # 프로젝트 문서
```

## 🚀 설치 및 실행 방법 (Installation & Setup)

### 1. 시스템 요구사항
- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상
- **운영체제**: Linux, macOS, Windows (Ubuntu 20.04+ 권장)

### 2. 자동 설치 (권장)

```bash
# 저장소 클론
git clone https://github.com/your-username/readmind-main.git
cd readmind-main

# 실행 권한 부여
chmod +x setup.sh

# 자동 설치 실행
./setup.sh
```

자동 설치 스크립트가 다음 작업을 수행합니다:
- Node.js 및 npm 의존성 설치
- 환경 변수 파일(.env) 생성
- JWT 시크릿 키 자동 생성
- 데이터베이스 초기화
- 서버 시작

### 3. 수동 설치

#### 3.1 의존성 설치
```bash
# 프로젝트 루트에서
npm install

# 백엔드 의존성 설치
cd backend
npm install
cd ..
```

#### 3.2 환경 변수 설정
```bash
# .env 파일 생성
cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
EOF
```

#### 3.3 데이터베이스 초기화
```bash
# 백엔드 서버 실행 (데이터베이스 자동 생성)
cd backend
node server.js
```

#### 3.4 프론트엔드 빌드
```bash
# 새 터미널에서
npm run build
```

### 4. 서버 실행

#### 개발 모드
```bash
# 백엔드 서버 실행
cd backend
npm run dev

# 또는
node server.js
```

#### 프로덕션 모드
```bash
# 전체 애플리케이션 실행
npm start
```

### 5. 웹서버 설정 (Caddy)

#### 5.1 Caddy 설치
```bash
# Ubuntu/Debian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# macOS
brew install caddy

# Windows
choco install caddy
```

#### 5.2 Caddy 설정
```bash
# Caddyfile 설정
cat > Caddyfile << EOF
your-domain.com {
    root * /path/to/readmind-main/public
    file_server
    try_files {path} /index.html
    
    reverse_proxy /api/* localhost:3000
    
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
EOF

# Caddy 실행
sudo caddy run --config Caddyfile
```

## 🎯 사용 방법 (How to Use)

### 1. 첫 방문
1. 브라우저에서 `http://localhost:3000` 또는 설정한 도메인에 접속
2. 환영 다이얼로그에서 "Get Started" 클릭
3. 우측 상단의 "Login" 버튼 클릭하여 계정 생성

### 2. 계정 생성
1. "Don't have an account? Sign up" 클릭
2. 이메일과 강력한 비밀번호 입력 (최소 8자, 대소문자, 숫자, 특수문자 포함)
3. reCAPTCHA 완료 후 "Sign up" 클릭

### 3. 문서 작성
1. 메인 에디터에 마크다운 문법으로 텍스트 작성
2. 실시간 미리보기로 결과 확인
3. 문서는 자동으로 저장됨

### 4. 속독 훈련
1. 에디터에 읽고 싶은 텍스트 입력
2. 읽기 모드 선택 (Flash 또는 Teleprompter)
3. WPM 슬라이더로 속도 조절
4. "Start" 버튼으로 훈련 시작
5. "Pause"로 일시정지, "Reset"으로 초기화

### 5. 설정 관리
- **테마**: 우측 상단 테마 선택기로 색상 변경
- **언어**: 언어 선택기로 한국어/영어/일본어 전환
- **다크모드**: 다크모드 토글 버튼으로 전환
- **폰트**: 폰트 패밀리와 크기 조절

## 🔧 개발자 가이드 (Developer Guide)

### 코드 구조 설명

#### Frontend 아키텍처
```
main.js (진입점)
├── state.js (전역 상태)
├── save_manager.js (설정 저장)
├── auth.js (인증 관리)
├── ui.js (UI 로직)
├── reader.js (속독 엔진)
├── text_handler.js (텍스트 분석)
├── document_manager.js (문서 관리)
└── translations.js (다국어)
```

#### Backend 아키텍처
```
server.js (Express 서버)
├── database.js (SQLite 설정)
├── middleware/
│   ├── auth.js (JWT 검증)
│   └── captcha_verification.js (reCAPTCHA)
└── routes/
    ├── auth.js (인증 API)
    ├── documents.js (문서 API)
    ├── settings.js (설정 API)
    └── health.js (헬스체크)
```

### 주요 함수 설명

#### Frontend
- `initializeApp()`: 애플리케이션 초기화
- `scheduleSave()`: 설정 자동 저장 (1.5초 디바운스)
- `startReadingFlow()`: 속독 훈련 시작
- `updateTextStats()`: 텍스트 통계 업데이트
- `segmentKoreanText()`: 한국어 텍스트 분리

#### Backend
- `setupDatabase()`: SQLite 데이터베이스 초기화
- `validatePassword()`: 비밀번호 정책 검증
- `authenticateToken()`: JWT 토큰 검증
- `rateLimit()`: API 요청 제한

### 데이터베이스 스키마

#### users 테이블
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    settings TEXT DEFAULT '{}'
);
```

#### documents 테이블
```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

#### 인덱스
```sql
CREATE INDEX idx_documents_user_id ON documents (user_id);
CREATE INDEX idx_documents_updated_at ON documents (updated_at);
CREATE INDEX idx_users_email ON users (email);
```

## 🐛 문제 해결 (Troubleshooting)

### 일반적인 문제

#### 1. 서버가 시작되지 않음
```bash
# 포트 확인
lsof -i :3000

# 프로세스 종료
pkill -f "node server.js"

# 다시 시작
cd backend && node server.js
```

#### 2. 데이터베이스 오류
```bash
# 데이터베이스 파일 삭제 후 재생성
rm database.sqlite
cd backend && node server.js
```

#### 3. 번들 파일 오류
```bash
# 번들 재생성
npm run build
```

#### 4. 의존성 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install
```

### 로그 확인
```bash
# 서버 로그
tail -f backend.log

# Caddy 로그
sudo journalctl -u caddy -f
```

## 🤝 기여하기 (Contributing)

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스 (License)

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 (Support)

- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/readmind-main/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/your-username/readmind-main/discussions)
- **이메일**: support@readmind.app

## 🙏 감사의 말 (Acknowledgments)

- [Material Design](https://material.io/) - UI 디자인 가이드라인
- [Kuromoji.js](https://github.com/takuyaa/kuromoji.js) - 일본어 형태소 분석
- [SimpleMDE](https://github.com/sparksuite/simplemde-markdown-editor) - 마크다운 에디터
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Express.js](https://expressjs.com/) - 웹 프레임워크

---

**ReadMind**와 함께 당신의 읽기 능력을 한 단계 업그레이드하세요! 🚀