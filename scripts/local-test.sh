#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "[1/4] 프론트엔드 의존성 설치 중..."
npm install

echo "[2/4] 백엔드 의존성 설치 중..."
(cd backend && npm install)

echo "[3/4] 프론트엔드 번들 생성 중..."
npm run build

echo "[4/4] 백엔드 API 스모크 테스트 실행 중..."
node scripts/smoke-test.js

echo "✅ 로컬 테스트가 모두 통과했습니다."
