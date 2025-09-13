# ReadMind - 당신의 두뇌를 위한 디지털 헬스장

정보의 홍수 속에서, 당신은 얼마나 효과적으로 읽고 있나요? **ReadMind**는 단순히 글자를 빠르게 보여주는 도구가 아닙니다. 당신의 읽기 능력을 체계적으로 훈련하고, 중요한 정보를 놓치지 않도록 돕는 **개인 맞춤형 속독 트레이너이자 지식 관리 시스템**입니다.

매일 쏟아지는 뉴스 기사, 업무 이메일, 전공 서적까지. ReadMind를 통해 당신의 읽기 습관을 혁신하고, 습득한 지식을 자신만의 노트에 기록하고 관리해보세요. 이 모든 데이터는 당신만이 접근할 수 있는 개인 서버에 안전하게 저장됩니다.

## ✨ 무엇을 할 수 있나요? (주요 기능)

*   **나만의 노트, 나만의 지식 베이스 구축**:
    *   앱 내에 탑재된 **마크다운(Markdown) 에디터**를 사용해 생각을 정리하고, 아이디어를 기록하고, 중요한 정보를 저장하세요.
    *   작성한 모든 문서는 당신의 계정에 안전하게 저장되며, 언제 어디서든 다시 불러와 읽거나 수정할 수 있습니다. 당신만의 강력한 지식 베이스를 만들어보세요.

*   **체계적인 속독 훈련**:
    *   **두 가지 읽기 모드**: 단어를 하나씩 집중해서 보는 '플래시 모드'와, 실제 책처럼 시선을 움직이며 읽는 '텔레프롬프터 모드' 중 원하는 방식을 선택해 훈련할 수 있습니다.
    *   **정밀한 속도 제어**: WPM(분당 단어 수)과 단어 묶음(Chunking) 크기를 조절하며 자신의 한계에 도전하고, 읽기 속도가 향상되는 것을 직접 체감해보세요.

*   **언어의 장벽 없는 읽기**:
    *   **지능형 텍스트 분석**: 영어는 물론, 띄어쓰기가 없는 일본어까지 정확하게 단어 단위로 분석하여 자연스러운 읽기 흐름을 제공합니다.
    *   **방해 요소 자동 제거**: 속독에 방해되는 URL, 이메일 주소, 각종 특수기호를 자동으로 제거하여 핵심 내용에만 집중할 수 있도록 돕습니다.

*   **완벽한 개인화와 보안**:
    *   **설정 동기화**: 당신이 설정한 언어, 테마, 읽기 속도 등 모든 환경이 계정에 동기화되어, 어떤 기기에서 접속하든 동일한 환경에서 훈련을 이어갈 수 있습니다.
    *   **강력한 보안**: 회원가입부터 로그인, 문서 저장까지 모든 과정은 최신 웹 보안 기술(JWT, bcrypt, reCAPTCHA, Rate-Limiting)을 통해 안전하게 보호됩니다. 당신의 데이터는 오직 당신의 것입니다.

## 🛠️ 기술 스택 (Technology Stack)

이 프로젝트는 다음과 같은 무료 오픈소스 기술들을 기반으로 만들어졌습니다.

*   **프론트엔드 (Frontend)**:
    *   `Vanilla JavaScript (ES6 Modules)`: 별도의 프레임워크 없이 순수 JavaScript의 최신 기능을 사용하여 가볍고 빠르게 동작합니다.
    *   `Tailwind CSS`: 유틸리티-우선 CSS 프레임워크를 통해 일관되고 현대적인 디자인을 구현합니다.
    *   `SimpleMDE`: 마크다운 노트 작성을 위한 간단하고 예쁜 에디터입니다.
    *   `Kuromoji.js`: 일본어 텍스트를 의미있는 단어로 분리(형태소 분석)하여 자연스러운 속독을 가능하게 합니다.

*   **백엔드 (Backend)**:
    *   `Node.js` & `Express.js`: JavaScript로 서버를 구축하기 위한 가장 대중적인 조합입니다.
    *   `JSON Web Tokens (JWT)`: 사용자의 로그인 상태를 안전하게 유지하기 위한 토큰 기반 인증 시스템입니다.
    *   `bcryptjs`: 사용자의 비밀번호를 매우 안전한 방식으로 암호화하여 데이터베이스에 저장합니다.
    *   `express-rate-limit`: 비정상적인 API 요청을 차단하여 서버를 보호합니다.

*   **데이터베이스 (Database)**:
    *   `SQLite`: 별도의 설치가 필요 없는 파일 기반 데이터베이스로, 가볍고 저사양 서버에 최적화되어 있습니다.

*   **웹 서버 (Web Server)**:
    *   `Caddy`: 복잡한 설정 없이도 자동으로 HTTPS 암호화(SSL 인증서)를 적용해주는 현대적인 웹 서버입니다.

---

## 🚀 ReadMind 서버 배포 가이드 (게임 공략집 Ver.)

이 가이드는 리눅스나 서버를 처음 다루는 분도 쉽게 따라 할 수 있도록 모든 단계를 아주 상세하게 설명합니다. 이대로만 따라 하면 당신만의 ReadMind 서버를 갖게 될 거예요!

**✅ 준비물**:
1.  **Ubuntu 24.04**가 설치된 서버 (가상 머신, 클라우드 서버 등)
2.  서버에 연결할 수 있는 **도메인 이름** (예: `my-readmind.com`)
3.  터미널 프로그램 (Windows의 PowerShell, macOS의 터미널 등)

---

### 🎮 튜토리얼 1단계: 서버 접속 및 기본 준비

가장 먼저, 당신의 서버에 접속해서 모험을 시작할 준비를 합시다.

1.  **서버에 SSH로 접속하기**:
    당신의 터미널을 열고 아래 명령어를 입력하세요.
    ```bash
    # ubuntu는 당신의 서버 사용자 이름, 123.45.67.89는 서버의 IP 주소로 바꾸세요.
    ssh ubuntu@123.45.67.89
    ```

2.  **프로젝트 파일 다운로드 (Git Clone)**:
    ReadMind의 코드를 서버로 가져옵니다.
    ```bash
    # <repository-url>을 실제 Git 주소로 바꾸세요.
    git clone <repository-url>
    ```

3.  **프로젝트 폴더로 이동**:
    이제 막 생성된 따끈따끈한 폴더로 들어갑니다.
    ```bash
    # <repository-directory>는 보통 'readmind'와 같은 이름일 거예요.
    cd <repository-directory>
    ```

4.  **마법의 설치 스크립트 실행!**:
    이 스크립트 하나로 필요한 모든 프로그램(Caddy, Node.js, 기타 등등)이 자동으로 설치됩니다.
    ```bash
    # 스크립트를 실행할 수 있도록 권한을 부여합니다.
    chmod +x setup.sh

    # 이제 스크립트를 실행하세요!
    ./setup.sh
    ```
    *   **ℹ️ 정보**: 이 과정에서 여러 가지 텍스트가 빠르게 올라갈 거예요. 중간에 `[Y/n]` 질문이 나오면 `Y`를 누르고 엔터를 치면 됩니다.

5.  **서버의 방화벽 열기 (UFW)**:
    외부 세계에서 당신의 웹사이트에 접속할 수 있도록 성벽의 문을 열어줍시다.
    ```bash
    # 1. SSH 접속용 문은 항상 열어두어야 합니다. (안 그러면 당신도 못 들어가요!)
    sudo ufw allow ssh

    # 2. 웹사이트의 정문(HTTP)과 비밀통로(HTTPS)를 엽니다.
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp

    # 3. 방화벽을 활성화합니다.
    sudo ufw enable
    ```
    *   **⚠️ 주의**: `Command may disrupt existing ssh connections. Proceed with operation (y|n)?` 라는 메시지가 나오면, 당황하지 말고 `y`를 입력하고 엔터를 누르세요.

---

### 🎮 튜토리얼 2단계: 백엔드 핵심 설정 (보안!)

이제 당신의 서버를 안전하게 만들 가장 중요한 단계입니다. 하나하나 의미를 이해하며 따라오세요.

1.  **`.env` 파일 생성 및 JWT 키 설정**:
    `.env` 파일은 외부로 노출되면 안 되는 중요한 비밀 정보들을 보관하는 장소입니다.
    ```bash
    # 먼저, 백엔드 폴더로 이동합니다.
    cd backend

    # 'echo'와 'openssl' 명령어를 사용해 강력한 무작위 비밀 키를 생성하고 .env 파일에 저장합니다.
    echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
    ```
    *   `JWT_SECRET`이란? 사용자가 로그인할 때 발급되는 '통행증(JWT)'을 암호화하는 데 사용되는 비밀 열쇠입니다. 이 키가 유출되면 누구나 가짜 통행증을 만들어 시스템에 침입할 수 있으니, 절대로 외부에 노출하면 안 됩니다.

2.  **Google reCAPTCHA 키 설정**:
    reCAPTCHA는 사람이 아닌 로봇(Bot)이 자동으로 회원가입하거나 로그인하는 것을 막아주는 고마운 친구입니다.

    *   **A) 키 발급받기 (상세 가이드)**:
        1.  [reCAPTCHA 관리자 콘솔](https://www.google.com/recaptcha/admin/)에 접속하여 구글 계정으로 로그인합니다.
        2.  오른쪽 위의 '+' 버튼 (만들기)을 클릭합니다.
        3.  **라벨**: 'ReadMind' 처럼 알아보기 쉬운 이름을 입력합니다.
        4.  **reCAPTCHA 유형**: **`reCAPTCHA v2`**를 선택하고, 그중에서 **`"로봇이 아닙니다" 체크박스`** 옵션을 선택합니다. (⚠️ **중요:** 다른 유형을 선택하면 작동하지 않습니다!)
        5.  **도메인**: '+ 도메인 추가'를 누르고, 당신의 도메인 이름(예: `my-readmind.com`)을 정확하게 입력합니다.
        6.  '제출' 버튼을 누릅니다.
        7.  다음 화면에 나타나는 **"사이트 키"**와 **"비밀 키"**를 안전한 곳에 복사해두세요.

    *   **B) 백엔드에 '비밀 키' 설정하기**:
        `nano` 에디터로 `.env` 파일을 열어, 복사해둔 '비밀 키'를 추가합니다.
        ```bash
        nano .env
        ```
        파일 맨 아래에 다음 내용을 추가하고 저장하세요 (`Ctrl+X` -> `Y` -> `Enter`).
        ```
        # Google reCAPTCHA v2 Keys
        RECAPTCHA_SECRET_KEY="여기에 당신의 '비밀 키'를 붙여넣으세요"
        ```

    *   **C) 프론트엔드에 '사이트 키' 설정하기**:
        이번엔 사용자의 브라우저에 표시될 '사이트 키'를 설정할 차례입니다.
        ```bash
        # 프로젝트 루트 폴더로 돌아갑니다.
        cd ..

        # public 폴더의 index.html 파일을 엽니다.
        nano public/index.html
        ```
        `Ctrl+W`를 눌러 `g-recaptcha`를 검색하고, `data-sitekey`의 값을 당신의 **'사이트 키'**로 변경한 뒤 저장하세요.
        ```html
        <!-- 이 부분을 찾아서... -->
        <div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY"></div>

        <!-- 이렇게 바꾸세요! -->
        <div class="g-recaptcha" data-sitekey="여기에 당신의 '사이트 키'를 붙여넣으세요"></div>
        ```

3.  **CORS 원본(Origin) 설정**:
    보안을 위해, 당신의 서버가 오직 당신의 프론트엔드 도메인からの 요청만 허용하도록 설정합니다.
    ```bash
    # 다시 백엔드 폴더로 이동합니다.
    cd backend

    # nano 에디터로 .env 파일을 다시 엽니다.
    nano .env
    ```
    파일 맨 아래에 다음 내용을 추가하고 저장하세요. `https://your-domain.com`을 당신의 실제 도메인으로 바꾸는 것을 잊지 마세요!
    ```
    # 허용할 프론트엔드 도메인
    CORS_ORIGIN="https://your-domain.com"
    ```

---

### 🎮 튜토리얼 3단계: 서비스 실행 및 자동화

이제 모든 준비가 끝났습니다. Caddy 웹서버와 우리가 만든 백엔드 서버를 24시간 쉬지 않고 돌아가도록 설정해봅시다.

1.  **Caddy 웹서버 설정**:
    Caddy가 당신의 도메인을 알 수 있도록 설정 파일을 수정해야 합니다.
    ```bash
    # 나노 에디터로 Caddyfile을 엽니다.
    nano Caddyfile
    ```
    *   파일 맨 첫 줄의 `your_domain.com`을 당신의 실제 도메인 이름으로 바꾸세요.
    *   `Ctrl+X` -> `Y` -> `Enter`를 눌러 저장합니다.

2.  **Caddy 서비스 시작**:
    ```bash
    # Caddy 서비스를 시작합니다.
    sudo systemctl start caddy

    # 서버를 재부팅해도 Caddy가 자동으로 시작되도록 설정합니다.
    sudo systemctl enable caddy

    # Caddy가 잘 실행되고 있는지 상태를 확인합니다.
    sudo systemctl status caddy
    ```
    *   **✅ 성공 확인**: `Active: active (running)` 이라는 초록색 글자가 보이면 성공입니다! `q`를 눌러 상태 보기에서 나옵니다.

3.  **백엔드 서버를 서비스로 등록하기**:
    이 설정을 해두면, 당신이 터미널을 종료해도 백엔드 서버는 계속 살아있게 됩니다.

    *   **A) 내 프로젝트의 전체 경로 확인하기 (매우 중요!)**:
        ```bash
        # 현재 위치의 전체 경로를 보여줍니다. 이 결과값을 복사해두세요!
        pwd
        ```
        *   **출력 예시**: `/home/ubuntu/readmind`

    *   **B) 내 서버 사용자 이름 확인하기**:
        ```bash
        # 현재 로그인된 사용자 이름을 보여줍니다.
        whoami
        ```
        *   **출력 예시**: `ubuntu`

    *   **C) 서비스 파일 생성 및 편집**:
        ```bash
        sudo nano /etc/systemd/system/readmind-backend.service
        ```
        아래의 내용을 전부 복사해서 붙여넣고, `YOUR_PROJECT_PATH`와 `YOUR_USERNAME`을 방금 확인한 당신의 값으로 **반드시** 수정해주세요.
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

    *   **D) 백엔드 서비스 시작**:
        ```bash
        # 변경된 서비스 파일을 시스템에 알립니다.
        sudo systemctl daemon-reload
        # 백엔드 서비스를 시작합니다.
        sudo systemctl start readmind-backend
        # 재부팅 시 자동으로 시작되도록 설정합니다.
        sudo systemctl enable readmind-backend
        # 백엔드 서비스가 잘 실행되는지 최종 확인!
        sudo systemctl status readmind-backend
        ```
        *   **✅ 성공 확인**: 여기서도 `Active: active (running)` 초록색 글자가 보이면 모든 준비가 끝난 겁니다! `q`를 눌러 나오세요.

---

### 🥳 최종 단계: 당신의 ReadMind 접속하기!

모든 여정이 끝났습니다! 이제 웹 브라우저를 열고 주소창에 당신의 도메인(`https://your_domain.com`)을 입력하여 ReadMind를 만나보세요!

---

### 🛡️ 부록: 선택적 고급 기능

#### 1. 서버 모니터링
내 서버가 얼마나 열심히 일하고 있는지, 아픈 곳은 없는지 확인하는 방법입니다.

*   **실시간 리소스 확인 (`htop`)**:
    ```bash
    # htop은 기본 설치가 안되어 있을 수 있습니다.
    # sudo apt update && sudo apt install htop -y
    htop
    ```
    *   CPU, 메모리 사용량을 실시간으로 보여주는 멋진 대시보드입니다. `F10`키나 `q`를 눌러 나올 수 있습니다.

*   **백엔드 로그 확인 (`journalctl`)**:
    백엔드 서버에 문제가 생겼을 때 원인을 찾을 수 있는 가장 중요한 단서입니다.
    ```bash
    # 백엔드 서비스의 모든 로그를 봅니다.
    sudo journalctl -u readmind-backend.service
    # 실시간으로 추가되는 로그를 계속 지켜봅니다. (Ctrl+C로 종료)
    sudo journalctl -u readmind-backend.service -f
    ```

#### 2. 월별 트래픽 제한 설정
서버의 데이터 사용량이 정해진 한도를 넘으면, 자동으로 웹서버를 멈춰서 요금 폭탄을 막아주는 기능입니다.

*   `README.md`의 `(Optional) Advanced: Automatic Traffic Limiter` 섹션을 참고하여 설정하세요. (이전 버전의 설명이 이미 충분히 상세하여 유지합니다.)

---

### 🔍 문제 해결 (Troubleshooting)

서버를 운영하다 보면 예상치 못한 문제들이 발생할 수 있습니다. 다음은 발생할 수 있는 몇 가지 흔한 문제와 해결 방법입니다.

*   **Q: 사이트에 접속했는데, 화면이 하얗게만 나오고 아무것도 보이지 않아요.**
    *   **A:** 가장 흔한 원인은 Caddy 웹서버가 프론트엔드 파일을 제대로 읽지 못하는 권한 문제입니다. `sudo systemctl status caddy` 명령어로 Caddy의 상태를 확인하고, 로그에 'permission denied'와 같은 오류가 있는지 확인하세요. 만약 권한 문제라면, `sudo chown -R caddy:caddy /path/to/your/project`와 같이 프로젝트 폴더의 소유권을 Caddy 사용자에게 부여해보세요. (이 문제는 초기 `setup.sh`에서 처리되었어야 하지만, 환경에 따라 발생할 수 있습니다.)

*   **Q: 버튼을 눌러도 아무런 반응이 없어요. (버튼 먹통 현상)**
    *   **A:** JavaScript 파일 로딩에 실패했을 가능성이 높습니다. 브라우저의 개발자 도구(F12)를 열어 'Console' 탭에 빨간색으로 표시되는 오류가 있는지 확인하세요. `Failed to load resource`와 같은 오류는 파일 경로 문제일 수 있고, `TypeError`나 `ReferenceError`는 코드 자체의 문제일 수 있습니다.

*   **Q: 데이터베이스에 한글을 저장했는데, API로 불러오니 글자가 깨져서 나와요.**
    *   **A:** 백엔드 API가 응답 헤더에 `Content-Type: application/json; charset=utf-8`을 명시하지 않았을 때 발생하는 문제입니다. 현재 코드는 이 문제가 해결되었지만, 만약 직접 API를 수정할 경우 이 부분을 꼭 확인해야 합니다.

---

### 🔄 업데이트 및 완전 삭제 가이드

#### 애플리케이션 업데이트 방법

새로운 기능이 추가되거나 버그가 수정되었을 때, 다음 단계에 따라 애플리케이션을 안전하게 업데이트할 수 있습니다.

1.  **최신 코드 가져오기**:
    ```bash
    # 프로젝트 폴더로 이동
    cd /path/to/your/project
    # Git 저장소에서 최신 변경사항을 다운로드합니다.
    git pull
    ```
2.  **백엔드 의존성 업데이트**:
    `package.json` 파일에 변경사항이 있을 수 있으니, 항상 `npm install`을 실행하여 새로운 라이브러리를 설치하거나 기존 라이브러리를 업데이트합니다.
    ```bash
    # 백엔드 폴더로 이동
    cd backend
    # 새로운 의존성을 설치합니다.
    npm install
    ```
3.  **서비스 재시작**:
    변경된 코드를 적용하기 위해 Caddy와 백엔드 서비스를 모두 재시작합니다.
    ```bash
    # 프로젝트 루트 폴더로 돌아옵니다.
    cd ..

    # Caddy와 백엔드 서비스를 순서대로 재시작합니다.
    sudo systemctl restart caddy
    sudo systemctl restart readmind-backend

    # 10초 정도 기다린 후, 두 서비스가 모두 정상적으로 실행 중인지 확인합니다.
    sudo systemctl status caddy
    sudo systemctl status readmind-backend
    ```

#### 애플리케이션 완전 삭제 방법

⚠️ **경고: 이 작업은 되돌릴 수 없으며, 당신의 모든 사용자 데이터와 문서를 영구적으로 삭제합니다. 신중하게 진행하세요.**

1.  **실행 중인 서비스 중지 및 비활성화**:
    ```bash
    sudo systemctl stop readmind-backend
    sudo systemctl disable readmind-backend
    sudo systemctl stop caddy
    sudo systemctl disable caddy
    ```
2.  **Systemd 서비스 파일 제거**:
    ```bash
    sudo rm /etc/systemd/system/readmind-backend.service
    sudo systemctl daemon-reload
    ```
3.  **프로젝트 파일 전체 삭제**:
    ```bash
    # 프로젝트가 위치한 상위 폴더로 이동합니다.
    # 예: cd /home/ubuntu

    # 프로젝트 폴더를 통째로 삭제합니다.
    sudo rm -rf /path/to/your/project
    ```
4.  **방화벽 규칙 제거 (선택 사항)**:
    더 이상 웹 서비스를 운영하지 않을 경우, 열어두었던 방화벽 포트를 닫는 것이 안전합니다.
    ```bash
    sudo ufw delete allow 80/tcp
    sudo ufw delete allow 443/tcp
    ```
5.  **Caddy 및 관련 패키지 제거 (선택 사항)**:
    서버에서 Caddy나 Node.js를 더 이상 사용하지 않을 경우, 아래 명령어로 삭제할 수 있습니다.
    ```bash
    sudo apt-get purge --autoremove -y caddy nodejs npm vnstat
    ```
