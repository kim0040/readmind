# ReadMind - 속독 훈련 및 텍스트 분석 도구

**ReadMind**는 사용자가 원하는 텍스트를 원하는 속도로 읽을 수 있도록 도와주는 웹 기반 속독 훈련 및 텍스트 분석 도구입니다. 텍스트를 붙여넣거나 파일을 업로드하면, 설정한 WPM(분당 단어 수)에 맞춰 단어를 하나씩 또는 묶음으로 보여주어 집중력 향상과 빠른 읽기를 돕습니다.

이 프로젝트는 사용자별 설정을 저장하고 학습 기록을 관리할 수 있도록 자체 호스팅이 가능한 백엔드 서버를 포함하고 있습니다.

## ✨ 주요 기능

*   **사용자 인증**:
    *   이메일과 비밀번호를 사용한 안전한 회원가입 및 로그인 기능.
    *   자체 백엔드 서버와 데이터베이스를 통해 사용자 정보를 관리합니다.
*   **속독 훈련**:
    *   **WPM/CPM 조절**: 분당 단어/글자 수(50 ~ 1000)를 자유롭게 설정할 수 있습니다.
    *   **단어 묶어 읽기 (Chunking)**: 1, 2, 또는 3개의 단어를 묶어서 한 번에 볼 수 있는 기능을 제공합니다.
    *   **집중점 (Fixation Point)**: 단어의 특정 지점을 강조하여 시선 이동을 최소화하고 읽기 속도를 높입니다.
*   **텍스트 입력**:
    *   텍스트를 직접 붙여넣거나 `.txt`, `.md` 파일을 불러올 수 있습니다.
    *   **드래그 앤 드롭**: 파일을 텍스트 영역으로 끌어다 놓아 간편하게 업로드할 수 있습니다.
*   **편의 기능**:
    *   **다국어 지원**: 한국어, 영어, 일본어 등 13개 언어를 지원합니다.
    *   **다크 모드**: 사용자의 시각적 편안함을 위한 테마 변경을 지원합니다.
    *   **키보드 접근성**: 모든 주요 기능을 키보드만으로 제어할 수 있습니다. (`Tab` 키, 화살표 키 등)
*   **텍스트 분석**:
    *   글자 수, 단어 수, 문장 수, 예상 읽기 시간 등 다양한 통계 정보를 실시간으로 제공합니다.

## 🛠️ 기술 스택

*   **Frontend**: Vanilla JavaScript (ES6 Modules), Tailwind CSS, HTML5, CSS3
*   **Backend**: Node.js, Express.js
*   **Database**: SQLite
*   **Web Server**: Caddy (자동 HTTPS 기능 포함)

## 🚀 시작하기

이 프로젝트는 Caddy 웹서버를 통해 서비스되도록 설계되었습니다. 제공된 `setup.sh` 스크립트를 사용하면 필요한 모든 종속성을 쉽게 설치할 수 있습니다.

### 사전 요구사항

*   Ubuntu 24.04 또는 유사한 Debian 기반 리눅스 환경
*   `sudo` 권한이 있는 계정

### 설치 및 실행

1.  **저장소 복제(Clone)**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **설치 스크립트 실행 권한 부여**:
    ```bash
    chmod +x setup.sh
    ```

3.  **설치 스크립트 실행**:
    이 스크립트는 Caddy, Node.js, npm 및 백엔드에 필요한 모든 패키지를 자동으로 설치합니다.
    ```bash
    ./setup.sh
    ```

4.  **방화벽 설정 (UFW)**:
    서버에 외부에서 접속할 수 있도록 방화벽을 설정해야 합니다. Ubuntu의 표준 방화벽인 `ufw`를 사용하는 예시입니다.

    ```bash
    # SSH 접속 허용 (필수!)
    sudo ufw allow ssh

    # 웹서버 포트 허용 (HTTP 및 HTTPS)
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp

    # 방화벽 활성화
    sudo ufw enable

    # 상태 확인
    sudo ufw status
    ```

5.  **서버 실행**:
    설치와 방화벽 설정이 완료되면, 두 개의 터미널 창을 열어 각각 백엔드 서버와 Caddy 서버를 실행해야 합니다.

    *   **터미널 1: 백엔드 서버 시작**
        ```bash
        cd backend
        node server.js
        ```
        서버가 `http://localhost:3000`에서 실행되는 것을 확인합니다.

    *   **터미널 2: Caddy 서버 시작** (프로젝트 루트 디렉토리에서 실행)
        ```bash
        sudo caddy run
        ```
        Caddy는 `Caddyfile`의 설정을 읽어 자동으로 HTTPS 인증서를 발급하고 웹서버를 시작합니다.

6.  **애플리케이션 접속**:
    웹 브라우저를 열고 **https://서버_IP_주소** 또는 **https://도메인_이름** 으로 접속합니다. Caddy가 자동으로 HTTPS 인증서를 처리합니다.

## 📂 프로젝트 구조

```
readmind/
│
├── Caddyfile            # Caddy 웹서버 설정 파일
├── backend/             # Node.js 백엔드 서버 디렉토리
│   ├── database.js      # SQLite 데이터베이스 설정 및 관리
│   ├── package.json     # 백엔드 종속성 및 스크립트 정의
│   └── server.js        # Express 기반 API 서버 메인 파일
│
├── public/              # 모든 프론트엔드 정적 파일 디렉토리
│   ├── index.html       # 메인 HTML 파일
│   ├── style.css        # CSS 스타일시트
│   ├── script.js        # (리팩토링 후 삭제됨)
│   ├── main.js          # 프론트엔드 메인 JavaScript 모듈
│   ├── ui.js            # UI 및 이벤트 핸들러 모듈
│   ├── reader.js        # 속독 엔진 로직 모듈
│   ├── state.js         # 상태 관리 모듈
│   ├── text_handler.js  # 텍스트 처리 및 분석 모듈
│   └── translations.js  # 다국어 텍스트 모듈
│
├── setup.sh             # Ubuntu 서버 자동 설치 스크립트
├── traffic-limiter.sh   # (선택) 월별 트래픽 제한 스크립트
└── README.md            # 프로젝트 설명서
```

## (선택) 월별 트래픽 제한 설정

이 프로젝트에는 `vnStat`과 `iptables`를 사용하여 서버의 월별 총 네트워크 트래픽을 제한하는 스크립트가 포함되어 있습니다. 설정한 사용량을 초과하면 웹 트래픽(포트 80, 443)이 자동으로 차단됩니다.

### 설정 방법

1.  **스크립트 실행 권한 부여**:
    ```bash
    chmod +x traffic-limiter.sh
    ```

2.  **네트워크 인터페이스 확인 및 수정**:
    스크립트 상단의 `INTERFACE` 변수를 자신의 서버에 맞는 네트워크 인터페이스 이름으로 변경해야 할 수 있습니다. `ip a` 또는 `ifconfig` 명령어로 확인하세요. (예: `eth0`, `ens3`)

3.  **Cron 작업 등록**:
    이 스크립트가 주기적으로 실행되도록 `cron`에 등록해야 합니다. 아래는 매시간 실행되도록 등록하는 예시입니다.

    *   `crontab -e` 명령어로 편집기를 엽니다.
    *   아래 내용을 파일 맨 끝에 추가하고 저장합니다. `YOUR_PROJECT_PATH`는 이 프로젝트의 전체 경로로 변경해주세요.

    ```crontab
    0 * * * * /usr/bin/sudo /bin/bash YOUR_PROJECT_PATH/traffic-limiter.sh >> YOUR_PROJECT_PATH/traffic-limiter.log 2>&1
    ```
    이 설정은 매시간 0분에 스크립트를 실행하고, 실행 결과를 `traffic-limiter.log` 파일에 기록합니다.
