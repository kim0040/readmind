# 🚀 ReadMind 서버 배포 가이드

## 📋 배포 전 체크리스트

### 1. 필수 환경 변수 설정
서버에 `backend/.env` 파일을 생성하세요:

```bash
# ReadMind Backend Environment Variables

# Server Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# Security - IMPORTANT: 반드시 변경하세요!
JWT_SECRET=매우-긴-랜덤-문자열-최소-64자-이상-권장
RECAPTCHA_SECRET_KEY=구글-리캡차-시크릿-키-선택사항

# Database (SQLite - 자동 생성됨)
# 추가 설정 불필요
```

### 2. 보안 설정 확인

**중요: JWT_SECRET 반드시 변경**
```bash
# 안전한 랜덤 키 생성 방법
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. 파일 권한 설정
```bash
# 실행 권한 부여
chmod +x setup.sh
chmod +x traffic-limiter.sh

# 로그 파일 디렉토리 생성
mkdir -p logs
chmod 755 logs
```

## 🖥️ 서버 배포 방법

### Option A: 단순 복사 배포 (작은 서버용)

1. **전체 폴더 복사**
```bash
# 로컬에서 서버로 복사
scp -r readmind-main user@your-server:/var/www/
```

2. **서버에서 설정**
```bash
cd /var/www/readmind-main

# .env 파일 생성 (위 내용 참고)
nano backend/.env

# 의존성 설치
cd backend && npm install --production
cd .. && npm install --production

# 빌드
npm run build

# 서버 시작
cd backend && node server.js
```

### Option B: PM2 사용 (권장)

1. **PM2 설치**
```bash
npm install -g pm2
```

2. **PM2 설정 파일 생성**
`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'readmind-backend',
    script: 'backend/server.js',
    cwd: '/var/www/readmind-main',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

3. **PM2로 실행**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option C: Docker 사용

**Dockerfile** 생성:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --production
RUN cd backend && npm install --production

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "backend/server.js"]
```

## 🌐 웹서버 설정 (Nginx/Apache)

### Nginx 설정 예시
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 정적 파일 직접 서빙
    location / {
        root /var/www/readmind-main/public;
        try_files $uri $uri/ /index.html;
    }
    
    # API 요청은 백엔드로 프록시
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

## 🔒 SSL/HTTPS 설정

### Let's Encrypt 사용 (무료)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo crontab -e
# 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 모니터링 설정

### 1. 로그 로테이션
```bash
# logrotate 설정
sudo nano /etc/logrotate.d/readmind

/var/www/readmind-main/backend*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    copytruncate
}
```

### 2. 시스템 모니터링
```bash
# 서버 상태 확인
pm2 status
pm2 logs readmind-backend

# 리소스 사용량 확인
htop
df -h
```

## 🎯 성능 최적화

### 1. Gzip 압축 (Nginx)
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. 캐싱 설정
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔧 문제 해결

### 일반적인 문제들

1. **포트 이미 사용 중**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

2. **파일 권한 오류**
```bash
sudo chown -R www-data:www-data /var/www/readmind-main
sudo chmod -R 755 /var/www/readmind-main
```

3. **메모리 부족**
```bash
# 스왑 파일 생성
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🎉 배포 완료 확인

1. **브라우저에서 확인**: `https://yourdomain.com`
2. **API 상태 확인**: `https://yourdomain.com/api/health`
3. **기능 테스트**: 회원가입, 로그인, 속독 기능

---

## ⚠️ 중요 보안 참고사항

- JWT_SECRET은 반드시 복잡한 랜덤 문자열로 변경
- 정기적인 보안 업데이트 적용
- 백업 계획 수립 (특히 SQLite 데이터베이스)
- 방화벽 설정으로 불필요한 포트 차단

## 💡 추가 개선사항

- CDN 사용으로 전 세계 속도 개선
- 데이터베이스를 PostgreSQL/MySQL로 확장
- Redis 캐싱 추가
- 에러 추적 시스템 (Sentry 등) 도입
