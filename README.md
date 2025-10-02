# 🧠 ReadMind - 차세대 속독 & 지식 관리 플랫폼

> **당신의 읽기 능력을 혁신하는 AI 기반 속독 트레이너**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🎯 **프로젝트 개요**

ReadMind는 현대인의 정보 과부하 문제를 해결하기 위해 설계된 **종합적인 속독 훈련 및 지식 관리 시스템**입니다. 단순한 속독 도구를 넘어서, 개인화된 학습 경험과 안전한 데이터 관리를 제공하는 완전한 웹 애플리케이션입니다.

### 🔧 **최근 개선 사항**
- 다크/라이트 모드와 사용자 컬러 테마가 로그인 이후에도 일관되게 유지됩니다.
- 로컬 개발 환경에서는 reCAPTCHA 없이도 회원가입과 로그인이 가능합니다.
- Rollup 빌드 파이프라인을 정리하여 순환 의존성을 제거하고 번들 작업을 안정화했습니다.

### 🌟 **핵심 가치**
- **🚀 읽기 속도 향상**: 과학적으로 검증된 속독 기법 적용
- **🧠 이해도 유지**: 속도와 함께 내용 이해도도 고려한 훈련
- **📚 지식 관리**: 마크다운 기반 개인 노트 시스템
- **🔒 개인정보 보호**: 모든 데이터를 개인 서버에 안전하게 저장

---

## ✨ **주요 기능**

### 🎨 **현대적 사용자 인터페이스**
- **Material Design 3**: Google의 최신 디자인 시스템 완전 적용
- **다크/라이트 모드**: 시간과 환경에 맞는 자동/수동 테마 전환
- **4가지 컬러 테마**: Blue, Green, Purple, Orange 사용자 맞춤 선택
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원
- **접근성 최적화**: WCAG 2.1 AA 등급 준수

### ⚡ **고급 속독 엔진**
- **플래시 모드**: 단어별 집중 훈련으로 최대 효율 달성
- **텔레프롬프터 모드**: 자연스러운 읽기 흐름 유지 훈련
- **적응형 속도**: 단어 길이와 복잡도에 따른 자동 속도 조절
- **시선 고정점**: 단어 내 최적 위치 표시로 안구 운동 최소화
- **WPM 50-500**: 초보자부터 전문가까지 맞춤 속도 설정

### 🌐 **다국어 텍스트 처리**
- **한국어**: 자연스러운 어절 단위 분할 (3-4글자 최적화)
- **영어**: 공백 기반 정확한 단어 분리
- **일본어**: Kuromoji.js 형태소 분석기 통합
- **마크다운 정제**: 헤더, 링크, 코드 등 읽기 방해 요소 자동 제거

### 📝 **통합 지식 관리 시스템**
- **실시간 마크다운 에디터**: SimpleMDE 기반 WYSIWYG 편집
- **자동 저장**: 작성 중 데이터 손실 방지
- **클라우드 동기화**: 로그인 사용자 데이터 서버 저장
- **실시간 통계**: 글자 수, 단어 수, 예상 읽기 시간 표시

### 🔐 **엔터프라이즈급 보안**
- **JWT 인증**: 24시간 만료 + 자동 갱신 시스템
- **bcryptjs 암호화**: 솔트 포함 비밀번호 해싱
- **Rate Limiting**: API 요청 제한으로 서버 보호
- **보안 헤더**: CSP, XSS, CSRF 등 종합 보안 적용
- **HTTPS 강제**: 모든 통신 암호화 보장

---

## 🛠️ **기술 스택**

### **Frontend**
- **HTML5**: 시멘틱 마크업과 웹 접근성
- **CSS3**: CSS Grid, Flexbox, CSS Variables
- **JavaScript ES6+**: 모듈 시스템, async/await
- **Material Web Components**: Google 공식 웹 컴포넌트
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Rollup**: 모던 번들러로 코드 최적화

### **Backend**
- **Node.js 18+**: 최신 LTS 버전 기반
- **Express.js**: 경량 웹 프레임워크
- **SQLite3**: 임베디드 데이터베이스
- **JWT**: 무상태 인증 시스템
- **bcryptjs**: 비밀번호 암호화

### **External Libraries**
- **SimpleMDE**: 마크다운 에디터
- **Kuromoji.js**: 일본어 형태소 분석
- **Material Icons**: Google 아이콘 세트

---

## 🚀 **설치 및 실행 가이드**

### **1. 시스템 요구사항**
- **Node.js**: v18.0.0 이상
- **npm**: v8.0.0 이상
- **운영체제**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **브라우저**: Chrome 90+, Firefox 88+, Safari 14+

### **2. 로컬 개발 환경 설정**

#### **A. 저장소 클론**
```bash
# GitHub에서 프로젝트 다운로드
git clone https://github.com/kim0040/readmind.git
cd readmind
```

#### **B. 의존성 설치**
```bash
# 프론트엔드 의존성 설치
npm install

# 백엔드 의존성 설치
cd backend
npm install
cd ..
```

#### **C. 환경 변수 설정**
```bash
# 백엔드 환경 변수 파일 생성
cd backend
nano .env
```

`.env` 파일 내용:
```env
# 개발 환경 설정
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# JWT 보안 키 (개발용)
JWT_SECRET=development-secret-key-change-in-production

# 선택사항: reCAPTCHA (개발 시 생략 가능)
# RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

> 로컬 개발 환경에서는 reCAPTCHA 설정 없이도 회원가입/로그인이 동작하도록 기본적으로 우회 처리되어 있습니다.

#### **D. 애플리케이션 빌드 및 실행**
```bash
# 프론트엔드 빌드 (개발용, 빠른 번들)
npm run build

# 프로덕션 번들 (압축 포함)
BUILD_MINIFY=true npm run build

# 백엔드 서버 시작
cd backend
node server.js
```

> Windows PowerShell에서는 `BUILD_MINIFY=true` 대신 `set BUILD_MINIFY=true; npm run build` 형태로 실행하세요. 현 시점에서는 Rollup의 terser 플러그인 호환성 문제로 `BUILD_MINIFY=true` 옵션이 실패할 수 있으며, 배포 시 최신 버전으로 업데이트하거나 별도의 압축 스텝을 활용하는 것을 권장합니다.

#### **E. 원터치 테스트 스크립트**
```bash
# 모든 의존성 설치 → 번들 생성 → 스모크 테스트 실행
npm run local:test
```

> 내부적으로 `scripts/local-test.sh`가 실행되며, 성공 시 `scripts/smoke-test.js`가 백엔드 헬스 체크를 자동으로 수행합니다.

#### **F. 브라우저에서 확인**
- **주소**: http://localhost:3000
- **API 상태**: http://localhost:3000/api/health

### **3. 개발 환경에서 테스트하기**

#### **WebStorm에서 테스트 (macOS)**
1. **프로젝트 열기**: WebStorm에서 `readmind` 폴더 열기
2. **터미널 열기**: View → Tool Windows → Terminal
3. **서버 실행**:
   ```bash
   cd backend && node server.js
   ```
4. **브라우저 테스트**: 내장 브라우저 또는 외부 브라우저에서 http://localhost:3000 접속
5. **실시간 개발**: 코드 수정 후 브라우저 새로고침으로 변경사항 확인

#### **기능 테스트 체크리스트**
- [ ] **UI 테마**: 라이트/다크 모드 전환
- [ ] **언어 변경**: 한국어 ↔ 영어 ↔ 일본어
- [ ] **회원가입/로그인**: 계정 생성 및 인증
- [ ] **텍스트 입력**: 마크다운 에디터에 텍스트 입력
- [ ] **속독 기능**: 플래시/텔레프롬프터 모드 실행
- [ ] **속도 조절**: WPM 슬라이더로 속도 변경
- [ ] **일시정지/재개**: 중단 후 이어서 읽기
- [ ] **통계 확인**: 글자 수, 단어 수, 예상 시간

---

## 🌐 **서버 배포 가이드 (Production)**

이 가이드는 Ubuntu 22.04 LTS 환경을 기준으로 ReadMind 애플리케이션을 실제 운영 서버에 배포하는 과정을 상세히 설명합니다. Caddy 웹서버를 사용하여 HTTPS를 자동으로 설정하고, PM2를 이용해 Node.js 애플리케이션을 안정적으로 관리합니다.

### **사전 요구사항**

- **서버**: Ubuntu 22.04 LTS가 설치된 서버 (가상 머신 또는 물리 서버)
- **도메인**: 서버의 공인 IP 주소를 가리키는 도메인 이름 (예: `yourdomain.com`)
- **기본 패키지**: `git`, `curl`, `nano` 등 기본 명령줄 도구
- **Node.js**: `v18.0.0` 이상
- **npm**: `v8.0.0` 이상

---

### **1단계: Node.js 설치**

서버에 Node.js와 npm이 설치되어 있지 않다면 다음 명령어로 최신 LTS 버전을 설치합니다.

```bash
# Node.js 18.x 버전 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js 설치 (npm 포함)
sudo apt-get install -y nodejs
```

설치 후 버전을 확인하여 정상적으로 설치되었는지 검증합니다.

```bash
node -v  # v18.x.x
npm -v   # 8.x.x 또는 그 이상
```

---

### **2단계: 소스 코드 다운로드 및 설치 경로 설정**

사용자 요청에 따라, `/home/web` 디렉터리 아래에 프로젝트를 설치하는 예시입니다.

```bash
# 설치 디렉터리 생성
sudo mkdir -p /home/web
sudo chown $USER:$USER /home/web

# GitHub에서 소스 코드 클론
git clone https://github.com/kim0040/readmind.git /home/web/readmind

# 프로젝트 디렉터리로 이동
cd /home/web/readmind
```

> **참고**: `sudo chown $USER:$USER /home/web` 명령은 현재 로그인된 사용자에게 `/home/web` 디렉터리의 소유권을 부여하여 `sudo` 없이 파일을 관리할 수 있게 합니다.

---

### **3단계: 의존성 설치 및 프론트엔드 빌드**

프로젝트 실행에 필요한 모든 패키지를 설치하고, 웹 브라우저에 표시될 프론트엔드 파일을 빌드합니다.

```bash
# 루트 디렉터리에서 프론트엔드 관련 개발 의존성 설치
npm install

# 백엔드 디렉터리로 이동하여 운영용 의존성만 설치
cd backend
npm install --production
cd ..

# 프론트엔드 소스 코드 빌드 (최적화 및 압축)
# public/dist 폴더에 결과물이 생성됩니다.
BUILD_MINIFY=true npm run build
```

---

### **4단계: 백엔드 환경 설정**

백엔드 서버에 필요한 환경 변수를 설정합니다. 특히, 보안을 위한 `JWT_SECRET`은 반드시 강력한 무작위 문자열로 생성해야 합니다.

```bash
# 백엔드 디렉터리로 이동
cd backend

# .env 파일 생성
nano .env
```

아래 내용을 `.env` 파일에 붙여넣고, **`yourdomain.com`**과 **`JWT_SECRET`** 값을 반드시 수정하세요.

```env
# 운영 환경 설정
NODE_ENV=production
PORT=3000

# Caddy를 통해 접속할 실제 도메인 주소
CORS_ORIGIN=https://yourdomain.com

# ⚠️ 보안 경고: 아래 명령어로 생성된 강력한 비밀 키로 교체하세요!
JWT_SECRET=매우-긴-랜덤-문자열-최소-64자-이상

# (선택사항) Google reCAPTCHA 사용 시
# RECAPTCHA_SECRET_KEY=your-production-recaptcha-key
```

**새로운 `JWT_SECRET` 생성 방법 (터미널에서 실행):**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

위 명령어를 실행하면 나오는 긴 문자열을 복사하여 `.env` 파일의 `JWT_SECRET` 값으로 사용하세요.

설정이 끝났으면 프로젝트 루트 디렉터리로 다시 이동합니다.
```bash
cd ..
```

---

### **5단계: PM2로 백엔드 서버 실행**

PM2는 Node.js 애플리케이션을 위한 프로세스 관리자로, 서버가 예기치 않게 종료되면 자동으로 재시작하고, 시스템 부팅 시 앱을 실행하는 등 안정적인 운영을 돕습니다.

```bash
# PM2 전역 설치
sudo npm install -g pm2

# ecosystem.config.js 파일을 사용하여 백엔드 서버 시작
pm2 start ecosystem.config.js

# 현재 실행 중인 프로세스 목록 확인
pm2 list

# 시스템 재부팅 시 PM2가 자동으로 서비스를 시작하도록 설정
pm2 save
pm2 startup
```

`pm2 startup` 명령 실행 시 화면에 나타나는 `sudo env ...` 로 시작하는 명령어를 복사하여 그대로 한 번 더 실행해 주세요.

---

### **6단계: Caddy 웹서버 설치 및 설정**

Caddy는 간편한 설정과 자동 HTTPS 기능이 강력한 최신 웹서버입니다.

#### **A. Caddy 설치**

```bash
# Caddy 설치 (Ubuntu/Debian)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

#### **B. Caddyfile 설정**

프로젝트에 포함된 `Caddyfile`을 시스템 설정 위치로 복사한 후, 경로와 도메인에 맞게 수정합니다.

```bash
# 기존 Caddyfile 백업
sudo mv /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak

# 프로젝트의 Caddyfile을 복사
sudo cp /home/web/readmind/Caddyfile /etc/caddy/Caddyfile

# 복사된 Caddyfile 수정
sudo nano /etc/caddy/Caddyfile
```

`nano` 편집기에서 `Caddyfile`의 내용을 아래와 같이 수정합니다. **`yourdomain.com`**을 실제 도메인으로, `root` 경로를 프로젝트 설치 경로에 맞게 변경하는 것이 핵심입니다.

```caddy
# yourdomain.com을 실제 도메인으로 변경하세요.
yourdomain.com {
    # 프론트엔드 파일이 위치한 경로를 정확히 지정합니다.
    # 예시: /home/web/readmind/public
    root * /home/web/readmind/public
    file_server

    # /api/ 로 시작하는 모든 요청을 3000번 포트에서 실행 중인 백엔드 서버로 전달합니다.
    handle /api/* {
        reverse_proxy localhost:3000
    }

    # React, Vue 등 SPA 라우팅을 위한 설정입니다.
    # 모든 요청을 일단 파일 시스템에서 찾고, 없으면 /index.html로 보냅니다.
    try_files {path} /index.html

    # 보안 헤더 (기존 설정 유지)
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }

    # Gzip 압축 활성화
    encode gzip

    # 로그 설정
    log {
        output file /var/log/caddy/access.log
        format json
    }
}
```

#### **C. Caddy 서비스 재시작**

수정한 설정을 적용하기 위해 Caddy 서비스를 재시작합니다.

```bash
# Caddy 설정 파일에 문법 오류가 없는지 확인
sudo caddy fmt --overwrite /etc/caddy/Caddyfile

# Caddy 서비스 재시작하여 설정 적용
sudo systemctl reload caddy

# Caddy 서비스 상태 확인 (오류가 없는지 확인)
sudo systemctl status caddy
```

`status` 확인 시 `active (running)` 메시지가 보이면 정상입니다. 이제 `https://yourdomain.com`으로 접속하여 배포된 ReadMind 애플리케이션을 확인할 수 있습니다. Caddy가 자동으로 Let's Encrypt SSL 인증서를 발급하여 HTTPS 접속이 가능합니다.

### **Option 2: Docker 배포**

#### **Dockerfile 생성**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --only=production
RUN cd backend && npm ci --only=production

# 소스 코드 복사
COPY . .

# 프론트엔드 빌드
RUN npm run build

# 포트 노출
EXPOSE 3000

# 환경 변수
ENV NODE_ENV=production

# 서버 시작
CMD ["node", "backend/server.js"]
```

#### **Docker Compose 설정**
```yaml
# docker-compose.yml
version: '3.8'

services:
  readmind:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    volumes:
      - ./data:/app/backend/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - readmind
    restart: unless-stopped
```

#### **Docker 실행**
```bash
# 환경 변수 설정
echo "JWT_SECRET=$(openssl rand -hex 64)" > .env
echo "CORS_ORIGIN=https://yourdomain.com" >> .env

# 컨테이너 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

---

## 🔧 **운영 및 모니터링**

### **서버 상태 확인**
```bash
# PM2 프로세스 상태
pm2 status
pm2 logs readmind-backend

# 시스템 리소스
htop

# 디스크 사용량
df -h

# Nginx 상태
sudo systemctl status nginx

# 실시간 로그 모니터링
tail -f /var/log/nginx/access.log
```

### **백업 및 복구**
```bash
# 데이터베이스 백업
cp backend/database.sqlite backup/database-$(date +%Y%m%d).sqlite

# 전체 프로젝트 백업
tar -czf readmind-backup-$(date +%Y%m%d).tar.gz readmind/ --exclude=node_modules
```

### **업데이트 방법**
```bash
# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
npm install && cd backend && npm install && cd ..

# 프론트엔드 재빌드
npm run build

# 서버 재시작
pm2 restart readmind-backend
```

### **완전 삭제 방법**

⚠️ **경고: 이 작업은 되돌릴 수 없으며, 모든 사용자 데이터와 문서를 영구적으로 삭제합니다.**

#### **서버에서 완전 제거**
```bash
# 1. 실행 중인 서비스 중지
pm2 stop readmind-backend
pm2 delete readmind-backend

# 2. Nginx 설정 제거 (사용한 경우)
sudo rm /etc/nginx/sites-enabled/readmind
sudo rm /etc/nginx/sites-available/readmind
sudo nginx -t && sudo systemctl reload nginx

# 3. SSL 인증서 제거 (Let's Encrypt 사용한 경우)
sudo certbot delete --cert-name yourdomain.com

# 4. 프로젝트 폴더 완전 삭제
rm -rf /path/to/your/readmind

# 5. 방화벽 규칙 제거 (선택사항)
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp

# 6. 시스템 패키지 제거 (다른 용도로 사용 안 하는 경우)
sudo apt-get purge --autoremove -y nginx nodejs npm
```

#### **로컬에서 완전 제거**
```bash
# 프로젝트 폴더 삭제
rm -rf /Users/당신의사용자명/Documents/readmind-main

# Node.js 전역 패키지 제거 (필요한 경우)
npm uninstall -g pm2

# GitHub 저장소 삭제 (GitHub 웹에서)
# Settings → Danger Zone → Delete this repository
```

---

## 🛡️ **보안 고려사항**

### **⚠️ 중요: 배포 전 보안 체크리스트**

#### **1. 환경 변수 보안**
```bash
# ✅ 안전: 환경 변수 사용
JWT_SECRET=매우-긴-랜덤-키

# ❌ 위험: 코드에 하드코딩
const secret = "abc123"; // 절대 금지!
```

#### **2. GitHub 업로드 금지 파일들**
- ✅ `.env` (이미 .gitignore에 포함)
- ✅ `database.sqlite` (이미 .gitignore에 포함)
- ✅ `*.log` 파일들 (이미 .gitignore에 포함)
- ✅ 개인키, 인증서 파일
- ✅ API 키가 포함된 설정 파일

#### **3. 필수 보안 설정**
1. **JWT_SECRET**: 반드시 64자 이상의 랜덤 문자열 사용
2. **HTTPS**: Caddy 자동 또는 Let's Encrypt 수동 설정
3. **방화벽**: 필요한 포트(80, 443, 22)만 열기
4. **정기 업데이트**: OS 및 Node.js 보안 패치 적용
5. **백업**: 주기적인 데이터베이스 백업

### **추가 보안 강화**
```bash
# 방화벽 설정
sudo ufw enable
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS

# fail2ban 설치 (무차별 대입 공격 방어)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

---

## 📊 **성능 최적화**

### **프론트엔드 최적화**
- **번들 크기**: Rollup으로 JavaScript 최적화
- **이미지 최적화**: WebP 포맷 사용 권장
- **CDN 활용**: 외부 라이브러리 CDN 로드
- **브라우저 캐싱**: 정적 파일 장기 캐싱

### **백엔드 최적화**
- **SQLite 인덱스**: 자주 조회되는 컬럼 인덱싱
- **연결 풀링**: 데이터베이스 연결 관리
- **메모리 제한**: PM2로 메모리 사용량 제한
- **로그 로테이션**: 로그 파일 크기 관리

---

## 🤝 **기여 가이드라인**

### **개발 환경 설정**
1. **Fork**: GitHub에서 저장소 포크
2. **Clone**: 개인 저장소 클론
3. **Branch**: 기능별 브랜치 생성
4. **Test**: 로컬에서 철저한 테스트
5. **PR**: Pull Request 제출

### **코드 스타일**
- **ESLint**: JavaScript 코딩 컨벤션
- **Prettier**: 코드 포맷팅 자동화
- **JSDoc**: 함수 및 클래스 문서화
- **Semantic Versioning**: 버전 관리 규칙

---

## 📈 **로드맵**

### **v1.1 (계획)**
- [ ] **실시간 협업**: 다중 사용자 동시 편집
- [ ] **AI 요약**: GPT 기반 자동 텍스트 요약
- [ ] **읽기 분석**: 개인별 읽기 패턴 분석
- [ ] **모바일 앱**: React Native 기반 네이티브 앱

### **v1.2 (계획)**
- [ ] **음성 인식**: Speech-to-Text 텍스트 입력
- [ ] **다중 언어**: 더 많은 언어 지원 확대
- [ ] **클라우드 연동**: Google Drive, Dropbox 연동
- [ ] **API 제공**: 외부 서비스 연동 API

---

## 📄 **라이선스**

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

```
MIT License

Copyright (c) 2024 ReadMind Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙋‍♂️ **지원 및 문의**

### **문제 신고**
- **GitHub Issues**: [이슈 등록](https://github.com/kim0040/readmind/issues)
- **버그 리포트**: 재현 가능한 상세 정보 포함
- **기능 제안**: Enhancement 라벨로 요청

### **커뮤니티**
- **Discussions**: GitHub Discussions에서 질문과 토론
- **이메일**: hun1234kim@gmail.com
- **문서**: [GitHub Wiki](https://github.com/kim0040/readmind/wiki)

---

## 📚 **참고 자료**

### **기술 문서**
- [Material Design 3](https://m3.material.io/)
- [Express.js 가이드](https://expressjs.com/ko/)
- [SQLite 문서](https://www.sqlite.org/docs.html)
- [JWT 표준](https://tools.ietf.org/html/rfc7519)

### **관련 연구**
- [속독 기법 연구](https://en.wikipedia.org/wiki/Speed_reading)
- [시선 추적 연구](https://en.wikipedia.org/wiki/Eye_tracking)
- [인지 부하 이론](https://en.wikipedia.org/wiki/Cognitive_load)

---

<div align="center">

**🎯 ReadMind로 당신의 읽기 능력을 한 단계 업그레이드하세요! 🚀**

[![GitHub stars](https://img.shields.io/github/stars/kim0040/readmind?style=social)](https://github.com/kim0040/readmind/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/kim0040/readmind?style=social)](https://github.com/kim0040/readmind/network)

Made with ❤️ by ReadMind Team

</div>
