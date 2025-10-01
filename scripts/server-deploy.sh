#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "[서버] 의존성 설치 중..."
npm install --prefer-offline
(cd backend && npm install --production)

echo "[서버] 프론트엔드 번들 생성 중..."
npm run build

echo "[서버] 백엔드 서버를 실행합니다 (Ctrl+C 로 종료)"
node backend/server.js
