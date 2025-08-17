# ReadMind - 속독 훈련 및 텍스트 분석 도구

**ReadMind**는 사용자가 원하는 텍스트를 원하는 속도로 읽을 수 있도록 도와주는 웹 기반 속독 훈련 및 텍스트 분석 도구입니다. 텍스트를 붙여넣거나 파일을 업로드하면, 설정한 WPM(분당 단어 수)에 맞춰 단어를 하나씩 또는 묶음으로 보여주어 집중력 향상과 빠른 읽기를 돕습니다.

이 프로젝트는 사용자별 설정을 저장하고 학습 기록을 관리할 수 있도록 자체 호스팅이 가능한 백엔드 서버를 포함하고 있습니다.

## ✨ 주요 기능

*   **사용자 인증**: 이메일과 비밀번호를 사용한 안전한 회원가입 및 로그인 기능.
*   **속독 훈련**: WPM/CPM 조절, 단어 묶어 읽기 (Chunking), 집중점 표시 기능.
*   **텍스트 입력**: 텍스트 붙여넣기, 파일 업로드, 드래그 앤 드롭 지원.
*   **편의 기능**: 다국어 지원, 다크 모드, 완벽한 키보드 접근성.
*   **텍스트 분석**: 글자 수, 단어 수, 문장 수, 예상 읽기 시간 등 실시간 통계 제공.

## 🛠️ 기술 스택

*   **Frontend**: Vanilla JavaScript (ES6 Modules), Tailwind CSS, HTML5, CSS3
*   **Backend**: Node.js, Express.js
*   **Database**: SQLite
*   **Web Server**: Caddy (자동 HTTPS 기능 포함)

## 🚀 실제 서버 배포 및 실행 가이드

이 가이드는 Ubuntu 24.04와 같은 최신 데비안 계열 리눅스에서 ReadMind 애플리케이션을 실제 운영 서버처럼 안정적으로 구동하는 방법을 안내합니다.

### 1단계: 초기 설정

서버에 접속하여 다음 단계를 따르세요.

1.  **저장소 복제(Clone)**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **설치 스크립트 실행**:
    `setup.sh` 스크립트는 Caddy, Node.js, npm 등 필요한 모든 소프트웨어와 백엔드 종속성을 자동으로 설치합니다.
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

3.  **방화벽 설정 (UFW)**:
    외부에서 서버에 접속할 수 있도록 방화벽을 설정합니다.
    ```bash
    # SSH 접속 허용 (필수!)
    sudo ufw allow ssh

    # 웹서버 포트 허용 (HTTP 및 HTTPS)
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp

    # 방화벽 활성화
    sudo ufw enable
    ```

### 2단계: Caddy 설정

1.  **Caddyfile 수정**:
    Caddy가 자동으로 HTTPS 인증서를 발급받으려면, 실제 도메인 이름이 필요합니다. `Caddyfile`을 열어 맨 첫 줄의 `your_domain.com`을 자신의 도메인으로 수정하세요.
    ```
    nano Caddyfile
    ```

2.  **Caddy 서비스 실행**:
    `setup.sh` 스크립트가 Caddy를 설치하면, `systemd` 서비스가 자동으로 등록됩니다. 아래 명령어로 Caddy를 시작하고, 서버 부팅 시 자동으로 실행되도록 설정합니다.
    ```bash
    # Caddy 서비스 시작
    sudo systemctl start caddy

    # 부팅 시 자동 실행 활성화
    sudo systemctl enable caddy

    # 서비스 상태 확인
    sudo systemctl status caddy
    ```

### 3단계: 백엔드 서버 서비스로 실행하기

터미널을 종료해도 백엔드 서버가 계속 실행되도록 `systemd` 서비스로 등록합니다.

1.  **systemd 서비스 파일 생성**:
    아래 명령어로 서비스 파일을 생성하고 편집기를 엽니다.
    ```bash
    sudo nano /etc/systemd/system/readmind-backend.service
    ```

2.  **서비스 파일 내용 붙여넣기**:
    아래 내용을 그대로 복사하여 붙여넣습니다. `YOUR_PROJECT_PATH`와 `YOUR_USERNAME`은 실제 환경에 맞게 수정해야 합니다.
    *   `YOUR_PROJECT_PATH`: `pwd` 명령어로 현재 프로젝트의 전체 경로를 확인하여 입력하세요.
    *   `YOUR_USERNAME`: `whoami` 명령어로 현재 사용자 이름을 확인하여 입력하세요.

    ```ini
    [Unit]
    Description=ReadMind Backend Server
    After=network.target

    [Service]
    User=YOUR_USERNAME
    Group=YOUR_USERNAME
    WorkingDirectory=YOUR_PROJECT_PATH/backend
    ExecStart=/usr/bin/node YOUR_PROJECT_PATH/backend/server.js
    Restart=always
    RestartSec=10
    StandardOutput=syslog
    StandardError=syslog
    SyslogIdentifier=readmind-backend

    [Install]
    WantedBy=multi-user.target
    ```

3.  **백엔드 서비스 시작**:
    서비스 파일을 저장한 후, 아래 명령어를 순서대로 실행하여 백엔드 서비스를 시작하고, 부팅 시 자동 실행되도록 설정합니다.
    ```bash
    # systemd가 새 서비스 파일을 인식하도록 리로드
    sudo systemctl daemon-reload

    # 백엔드 서비스 시작
    sudo systemctl start readmind-backend

    # 부팅 시 자동 실행 활성화
    sudo systemctl enable readmind-backend

    # 서비스 상태 확인
    sudo systemctl status readmind-backend
    ```

### 4단계: 애플리케이션 접속

이제 모든 설정이 완료되었습니다. 웹 브라우저를 열고 `Caddyfile`에 설정한 **https://your_domain.com** 으로 접속하여 애플리케이션을 확인하세요.

## (선택) 월별 트래픽 제한 설정

`traffic-limiter.sh` 스크립트는 서버의 월별 총 네트워크 트래픽을 제한합니다. `cron` 작업을 통해 주기적으로 실행되도록 설정해야 합니다. 자세한 내용은 스크립트 파일 내의 주석과 이전 `README.md` 섹션을 참고하세요.
