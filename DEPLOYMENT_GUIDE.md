# Git 기반 서버 배포 및 관리 가이드

이 문서는 수동으로 zip 파일을 업로드하는 대신, Git을 사용하여 ReadMind 애플리케이션을 서버에 배포하고 관리하는 방법을 안내합니다.

## 왜 Git을 사용해야 하나요?

- **간편한 업데이트**: `git pull` 명령어 하나로 최신 버전의 코드를 즉시 반영할 수 있습니다.
- **버전 관리**: 모든 변경 이력이 기록되므로, 문제가 발생했을 때 특정 버전으로 쉽게 되돌아갈 수 있습니다.
- **일관성 유지**: 개발 환경과 서버 환경의 코드를 동일하게 유지하여 예기치 않은 오류를 줄입니다.
- **안전한 설정 관리**: 서버의 중요한 설정 파일(DB, API 키 등)을 코드와 분리하여 안전하게 관리할 수 있습니다.

## 사전 요구사항

서버에 다음 프로그램들이 설치되어 있어야 합니다.
- `git`
- `node` 및 `npm`
- `pm2` (현재 `ecosystem.config.js`를 사용하고 있으므로 설치되어 있을 것입니다.)

---

## 1. 최초 배포 (Zip 방식에서 Git 방식으로 전환)

이 과정은 단 한 번만 수행하면 됩니다.

### 1단계: 중요 파일 백업 (가장 중요!)

서버에 SSH로 접속하여, 현재 실행 중인 ReadMind 폴더에서 **설정 파일과 데이터베이스를 안전한 곳에 백업합니다.**

```bash
# 현재 ReadMind 애플리케이션이 설치된 폴더로 이동합니다.
# 예: cd /var/www/readmind

# 홈 디렉터리(~)에 백업 폴더를 만듭니다.
mkdir -p ~/readmind_backup

# .env 파일과 데이터베이스 파일을 백업합니다.
# .env 파일이 없다면 이 단계는 건너뛰어도 됩니다.
cp .env ~/readmind_backup/.env
cp backend/database.sqlite ~/readmind_backup/database.sqlite

echo "중요 파일 백업 완료!"
```

### 2단계: Git으로 애플리케이션 재설치

기존 폴더를 삭제하고 GitHub 리포지토리를 복제(`clone`)합니다.

```bash
# 현재 폴더의 상위 디렉터리로 이동합니다.
# 예: cd /var/www

# 기존 폴더를 삭제합니다. (반드시 1단계 백업을 확인하세요!)
# rm -rf readmind

# GitHub 리포지토리를 clone 합니다.
git clone https://github.com/kim0040/readmind.git readmind

# 새로 생성된 폴더로 이동합니다.
cd readmind
```

### 3단계: 설정 및 데이터베이스 복원

백업해둔 파일을 새로 `clone` 받은 폴더의 제 위치로 복사합니다.

```bash
# 백업한 .env 파일을 복사합니다.
cp ~/readmind_backup/.env .

# 백업한 데이터베이스 파일을 backend 폴더로 복사합니다.
cp ~/readmind_backup/database.sqlite backend/database.sqlite

echo "설정 및 데이터베이스 복원 완료!"
```

### 4단계: 의존성 설치

프로젝트 루트와 `backend` 폴더 양쪽에서 필요한 `npm` 패키지를 설치합니다.

```bash
# 1. 프로젝트 루트에서 설치
npm install

# 2. backend 폴더에서 설치
cd backend
npm install
cd ..

echo "모든 의존성 설치 완료!"
```

### 5단계: 애플리케이션 재시작

`pm2`를 사용하여 애플리케이션을 다시 시작합니다.

```bash
pm2 restart ecosystem.config.js --update-env

echo "애플리케이션이 성공적으로 재시작되었습니다."
```
이제 서버가 Git으로 관리되며, 기존의 설정과 데이터를 그대로 사용하게 됩니다.

---

## 2. 향후 업데이트 방법

앞으로 코드를 수정한 후 업데이트하는 과정은 매우 간단합니다.

### 1단계: 최신 코드 가져오기

서버의 애플리케이션 폴더에서 `git pull` 명령어를 실행하여 GitHub의 최신 변경사항을 가져옵니다.

```bash
# cd /var/www/readmind
git pull origin main
```

### 2단계: 의존성 업데이트 (필요시)

만약 `package.json` 파일에 변경이 있었다면(새로운 라이브러리가 추가된 경우), 의존성을 다시 설치합니다.

```bash
npm install
cd backend
npm install
cd ..
```

### 3단계: 애플리케이션 재시작

`pm2`로 애플리케이션을 재시작하여 변경사항을 적용합니다.

```bash
pm2 restart ecosystem.config.js
```

이것으로 모든 업데이트 과정이 끝납니다.
