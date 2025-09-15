# 🧠 ReadMind - 차세대 속독 & 지식 관리 플랫폼

> **당신의 읽기 능력을 혁신하는 AI 기반 속독 트레이너**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🎯 **프로젝트 개요**

ReadMind는 현대인의 정보 과부하 문제를 해결하기 위해 설계된 **종합적인 속독 훈련 및 지식 관리 시스템**입니다. 단순한 속독 도구를 넘어서, 개인화된 학습 경험과 안전한 데이터 관리를 제공하는 완전한 웹 애플리케이션입니다.

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

#### **D. 애플리케이션 빌드 및 실행**
```bash
# 프론트엔드 빌드
npm run build

# 백엔드 서버 시작
cd backend
node server.js
```

#### **E. 브라우저에서 확인**
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

## 🌐 **서버 배포 가이드**

### **Option 1: Caddy 웹서버 배포 (HTTPS 자동, 권장)**

#### **Caddy 장점**
- 🔒 **자동 HTTPS**: Let's Encrypt 인증서 자동 발급 및 갱신
- ⚡ **간단한 설정**: Caddyfile 하나로 모든 설정 완료
- 🛡️ **보안**: 기본적으로 안전한 설정 적용

#### **Caddy 설치 및 설정**
```bash
# Caddy 설치 (Ubuntu/Debian)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Caddyfile 설정 (프로젝트에 포함된 파일 사용)
sudo cp Caddyfile /etc/caddy/Caddyfile

# 도메인 수정 (yourdomain.com을 실제 도메인으로 변경)
sudo nano /etc/caddy/Caddyfile

# Caddy 시작
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

### **Option 2: Nginx 수동 배포**

#### **1단계: 서버 준비**
```bash
# Ubuntu/Debian 서버에서
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm git -y

# Node.js 최신 LTS 설치
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### **2단계: 프로젝트 배포**
```bash
# 프로젝트 클론
git clone https://github.com/kim0040/readmind.git
cd readmind

# 프로덕션 의존성 설치 및 빌드
npm run deploy:full

# 프로덕션 환경변수 설정
cd backend
sudo nano .env
```

**프로덕션 .env 설정**:
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# 보안: 강력한 JWT 키 생성 필수!
JWT_SECRET=매우-긴-랜덤-문자열-최소-64자-이상

# 선택: reCAPTCHA
RECAPTCHA_SECRET_KEY=your-production-recaptcha-key
```

**안전한 JWT 키 생성**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **3단계: PM2로 프로세스 관리**
```bash
# PM2 전역 설치
sudo npm install -g pm2

# PM2로 서버 시작
pm2 start ecosystem.config.js

# 시스템 부팅 시 자동 시작
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

#### **4단계: Nginx 리버스 프록시 설정**
```bash
# Nginx 설치
sudo apt install nginx -y

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/readmind
```

**Nginx 설정**:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 정적 파일 직접 서빙
    location / {
        root /home/ubuntu/readmind/public;
        try_files $uri $uri/ /index.html;
        
        # 브라우저 캐싱
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 요청 프록시
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/readmind /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### **5단계: SSL 인증서 설정 (Let's Encrypt)**
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 설정
sudo crontab -e
# 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

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