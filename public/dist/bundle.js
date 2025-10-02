var ReadMind = (function (exports) {
    'use strict';

    const API_URL = '/api'; // Caddy/프록시를 통해 백엔드로 전달되는 상대 경로

    // 단순화를 위해 로컬 스토리지에 토큰을 저장한다.
    // 운영 환경에서는 httpOnly 쿠키 사용을 권장한다.
    const TOKEN_KEY = 'readmind_token';

    /**
     * 신규 사용자를 회원가입 처리한다.
     * @param {string} email 사용자 이메일
     * @param {string} password 사용자 비밀번호
     * @param {string} captchaToken reCAPTCHA 토큰(선택)
     * @returns {Promise<any>} 서버 응답 값
     */
    async function signup(email, password, captchaToken) {
        const payload = { email, password };
        if (captchaToken) {
            payload.captchaToken = captchaToken;
        }
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return response.json();
    }

    /**
     * 사용자를 로그인 처리한다.
     * @param {string} email 사용자 이메일
     * @param {string} password 사용자 비밀번호
     * @param {string} captchaToken reCAPTCHA 토큰(선택)
     * @returns {Promise<any>} 서버 응답 값
     */
    async function login(email, password, captchaToken) {
        const payload = { email, password };
        if (captchaToken) {
            payload.captchaToken = captchaToken;
        }
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok && data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
        }
        return data;
    }

    /**
     * 저장된 토큰을 제거하여 로그아웃한다.
     */
    function logout() {
        localStorage.removeItem(TOKEN_KEY);
    }

    /**
     * 로컬 스토리지에 저장된 토큰을 반환한다.
     * @returns {string|null}
     */
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * 현재 사용자가 로그인된 상태인지 확인한다.
     * @returns {boolean}
     */
    function isLoggedIn() {
        const token = getToken();
        if (!token) return false;

        try {
            // 토큰 페이로드를 디코딩해 만료 여부 판단
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
        } catch (e) {
            return false;
        }
    }

    /**
     * 서버에서 사용자 설정을 조회한다.
     * @returns {Promise<any>}
     */
    async function getSettings() {
        const token = getToken();
        if (!token) return Promise.resolve({}); // 비로그인 상태면 빈 설정 반환

        const response = await fetch(`${API_URL}/settings`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            // 토큰이 만료된 경우 자동 로그아웃
            if (response.status === 401) logout();
            throw new Error('설정을 불러오지 못했습니다');
        }
        return response.json();
    }

    async function getDocument(id) {
        const token = getToken();
        if (!token) return Promise.reject('로그인이 필요합니다');

        const response = await fetch(`${API_URL}/documents/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            if (response.status === 401) logout();
            throw new Error('문서를 불러오지 못했습니다');
        }
        return response.json();
    }

    async function createDocument(title, content = '') {
        const token = getToken();
        if (!token) return Promise.reject('로그인이 필요합니다');

        const response = await fetch(`${API_URL}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title, content }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || '문서를 생성하지 못했습니다');
        }
        return response.json();
    }

    async function updateDocument(id, title, content) {
        const token = getToken();
        if (!token) return Promise.reject('로그인이 필요합니다');

        const response = await fetch(`${API_URL}/documents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title, content }),
        });
        if (!response.ok) {
            throw new Error('문서를 수정하지 못했습니다');
        }
        return response.json();
    }

    async function deleteDocument(id) {
        const token = getToken();
        if (!token) return Promise.reject('로그인이 필요합니다');

        const response = await fetch(`${API_URL}/documents/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('문서를 삭제하지 못했습니다');
        }
        return response.json();
    }

    /**
     * 로그인 사용자의 문서 목록을 조회한다.
     * @returns {Promise<any>}
     */
    async function getDocuments() {
        const token = getToken();
        if (!token) return Promise.resolve([]);

        const response = await fetch(`${API_URL}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            if (response.status === 401) logout();
            throw new Error('문서 목록을 불러오지 못했습니다');
        }
        return response.json();
    }

    /**
     * 사용자 설정을 서버에 저장한다.
     * @param {object} settings 저장할 설정 값
     * @returns {Promise<any>}
     */
    async function saveSettings(settings) {
        const token = getToken();
        if (!token) return Promise.resolve(); // Do nothing if not logged in

        const response = await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ settings }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, try to refresh
                try {
                    await refreshToken();
                    // Retry with new token
                    const newToken = getToken();
                    const retryResponse = await fetch(`${API_URL}/settings`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: JSON.stringify({ settings }),
                    });
                    if (!retryResponse.ok) throw new Error('Could not save settings after token refresh');
                    return await retryResponse.json();
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    logout();
                    throw new Error('Session expired. Please login again.');
                }
            }
            throw new Error('Could not save settings');
        }
        return response.json();
    }

    async function refreshToken() {
        const token = getToken();
        if (!token) throw new Error('No token available');

        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.token);
        return data.token;
    }

    // state.js - 기능별로 분리된 공용 애플리케이션 상태 정의

    // --- Constants ---
    const LS_KEYS = {
        SETTINGS: "readMindSettings_v2", // Combined settings key
        INDEX: "readMindIndex",
        LAST_DOC_ID: "readMindLastDocId",
        HAS_VISITED: "readMindHasVisited",
    };

    // --- Application State ---
    // For general app settings like theme, language, etc.
    const appState = {
        currentLanguage: "ko",
        currentTheme: "blue",
        isDarkMode: false,
        userHasManuallySetTheme: false,
        originalPlaceholderText: "",
        encoder: new TextEncoder(),
        fontFamily: "'Roboto', sans-serif",
        fontSize: 48,
    };

    // --- Reader State ---
    // For state directly related to the speed reading engine.
    const readerState = {
        words: [],
        currentIndex: 0,
        currentWpm: 250,
        isPaused: false,
        isFixationPointEnabled: false,
        chunkSize: 1,
        readingMode: 'flash', // 'flash' or 'teleprompter'
        NO_SPACE_LANGUAGES: ["ja", "zh", "ko"],
        engine: null, // SpeedReaderCore 인스턴스 참조
    };

    // --- Document & Editor State ---
    // For state related to document management and the editor.
    const documentState = {
        simplemde: null, // To hold the SimpleMDE instance
        activeDocument: null, // To hold the currently active document object
    };

    // save_manager.js - 중앙화된 저장 관리


    let saveTimeout$1 = null;

    /**
     * 설정을 디바운싱하여 로컬/서버에 저장한다.
     */
    function scheduleSave() {
        clearTimeout(saveTimeout$1);
        saveTimeout$1 = setTimeout(async () => {
            const settings = getCurrentSettings();
            
            // 항상 로컬에 저장
            try {
                localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
            } catch (error) {
                console.warn('로컬 저장소에 설정을 저장하지 못했습니다:', error);
            }
            
            // 로그인된 경우 서버에도 저장
            if (isLoggedIn()) {
                try {
                    await saveSettings(settings);
                    console.log('서버에 설정이 저장되었습니다:', settings);
                } catch (error) {
                    console.error('서버에 설정 저장 중 오류가 발생했습니다:', error);
                }
            }
        }, 1500);
    }

    /**
     * 저장 대상이 되는 UI 설정값을 한데 모은다.
     */
    function getCurrentSettings() {
        return {
            theme: appState.currentTheme,
            colorTheme: appState.currentTheme,
            darkMode: appState.isDarkMode,
            language: appState.currentLanguage,
            wpm: readerState.currentWpm,
            chunkSize: readerState.chunkSize,
            isFixationPointEnabled: readerState.isFixationPointEnabled,
            readingMode: readerState.readingMode,
            fontFamily: appState.fontFamily,
            fontSize: appState.fontSize,
        };
    }

    // ui.js - UI 로직과 DOM 제어, 이벤트 바인딩 담당


    const dom = {
        mainCard: null,
        documentSidebar: null,
        sidebarOverlay: null,
        textInput: null,
        currentWordDisplay: null,
        progressInfoDisplay: null,
        progressBarFill: null,
        startButton: null,
        pauseButton: null,
        resetButton: null,
        fullscreenButton: null,
        newDocumentButton: null,
        clearTextButton: null,
        loginButton: null,
        logoutButton: null,
        hamburgerMenuButton: null,
        closeSidebarButton: null,
        wpmInput: null,
        darkModeToggle: null,
        themeToggleDarkIcon: null,
        themeToggleLightIcon: null,
        themeSelector: null,
        fixationToggle: null,
        languageSelector: null,
        chunkSizeSelector: null,
        readingModeSelector: null,
        fontFamilySelector: null,
        fontSizeSlider: null,
        fontSizeLabel: null,
        wordCountDisplay: null,
        charCountDisplay: null,
        readingTimeDisplay: null,
        readabilityScore: null,
        avgSentenceLength: null,
        syllableCount: null,
        lexicalDiversity: null,
        documentList: null,
        authModal: null,
        authForm: null,
        emailInput: null,
        passwordInput: null,
        authSubmitButton: null,
        authCancelButton: null,
        authSwitchButton: null,
        authModalTitle: null,
    };

    /**
     * DOM 요소 참조를 최신 상태로 갱신한다.
     */
    function refreshDomReferences() {
        dom.mainCard = document.querySelector('.main-card');
        dom.documentSidebar = document.getElementById('document-sidebar');
        dom.sidebarOverlay = document.getElementById('sidebar-overlay');
        dom.textInput = document.getElementById('text-input');
        dom.currentWordDisplay = document.getElementById('current-word');
        dom.progressInfoDisplay = document.getElementById('progress-info');
        dom.progressBarFill = document.getElementById('progress-bar-fill');
        dom.startButton = document.getElementById('start-button');
        dom.pauseButton = document.getElementById('pause-button');
        dom.resetButton = document.getElementById('reset-button');
        dom.fullscreenButton = document.getElementById('fullscreen-button');
        dom.newDocumentButton = document.getElementById('new-document-button');
        dom.clearTextButton = document.getElementById('clear-text-button');
        dom.loginButton = document.getElementById('login-button');
        dom.logoutButton = document.getElementById('logout-button');
        dom.hamburgerMenuButton = document.getElementById('hamburger-menu-button');
        dom.closeSidebarButton = document.getElementById('close-sidebar-button');
        dom.wpmInput = document.getElementById('wpm-input');
        dom.darkModeToggle = document.getElementById('dark-mode-toggle');
        dom.themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        dom.themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
        dom.themeSelector = document.getElementById('theme-selector');
        dom.fixationToggle = document.getElementById('fixation-toggle');
        dom.languageSelector = document.getElementById('language-selector');
        dom.chunkSizeSelector = document.getElementById('chunk-size-selector');
        dom.readingModeSelector = document.getElementById('reading-mode-selector');
        dom.fontFamilySelector = document.getElementById('font-family-selector');
        dom.fontSizeSlider = document.getElementById('font-size-slider');
        dom.fontSizeLabel = document.getElementById('font-size-label');
        dom.readabilityScore = document.getElementById('readability-score');
        dom.avgSentenceLength = document.getElementById('avg-sentence-length');
        dom.syllableCount = document.getElementById('syllable-count');
        dom.lexicalDiversity = document.getElementById('lexical-diversity');
        dom.documentList = document.getElementById('document-list');
        dom.authModal = document.getElementById('auth-modal');
        dom.authForm = document.getElementById('auth-form');
        dom.emailInput = document.getElementById('email-input');
        dom.passwordInput = document.getElementById('password-input');
        dom.authSubmitButton = document.getElementById('auth-submit-button');
        dom.authCancelButton = document.getElementById('auth-cancel-button');
        dom.authSwitchButton = document.getElementById('auth-switch-button');
        dom.authModalTitle = document.getElementById('auth-modal-title');
    }

    const noop = () => {};

    const MESSAGE_TYPES = ['info', 'success', 'error', 'warning'];
    let messageHideTimeout = null;

    /**
     * 순환 참조를 피하면서 UI 이벤트를 앱 전역 동작과 연결하는 콜백 집합.
     */
    let uiHandlers = {
        onStartReading: noop,
        onPauseReading: noop,
        onResetReader: noop,
        onWpmChange: noop,
        onChunkSizeChange: noop,
        onFixationToggle: noop,
        onReadingModeChange: noop,
        onAuthSuccess: noop,
        onAuthFailure: noop,
        onLogout: noop,
    };

    /**
     * 외부에서 전달된 콜백들을 현재 핸들러 목록과 병합한다.
     */
    function setUiHandlers(handlers) {
        uiHandlers = { ...uiHandlers, ...handlers };
    }

    /**
     * 비동기 UI 핸들러 실행 시 오류를 포착하고 안전하게 처리한다.
     */
    async function runAsyncHandler(name, ...args) {
        const handler = uiHandlers[name];
        if (typeof handler !== 'function') return;
        try {
            await handler(...args);
        } catch (error) {
            console.error(`UI 핸들러 ${name} 실행 중 오류가 발생했습니다:`, error);
        }
    }

    function showConfirmationModal(titleKey, messageKey, onConfirm) {
        const overlay = document.getElementById('confirmation-modal-overlay');
        const titleEl = document.getElementById('confirmation-modal-title');
        const messageEl = document.getElementById('confirmation-modal-message');
        const confirmBtn = document.getElementById('confirmation-modal-confirm-button');
        const cancelBtn = document.getElementById('confirmation-modal-cancel-button');
        if (!overlay || !titleEl || !messageEl || !confirmBtn || !cancelBtn) return;

        titleEl.textContent = getTranslation$1(titleKey);
        messageEl.textContent = getTranslation$1(messageKey);
        confirmBtn.textContent = getTranslation$1('confirmButton');
        cancelBtn.textContent = getTranslation$1('cancelButton');

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        const close = () => overlay.classList.add('hidden');
        newConfirmBtn.onclick = () => { onConfirm(); close(); };
        newCancelBtn.onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
        overlay.classList.remove('hidden');
    }

    /**
     * 읽기 영역에 선택된 폰트 스타일을 적용한다.
     */
    function applyReaderStyles(fontFamily, fontSize) {
        if (dom.currentWordDisplay) {
            dom.currentWordDisplay.style.fontFamily = fontFamily;
            dom.currentWordDisplay.style.fontSize = `${fontSize}px`;
        }
    }

    /**
     * 테마와 다크 모드 선택을 문서 전역에 반영한다.
     */
    function applyTheme(theme, isDark) {
        // 테마 설정 (전역 데이터 속성)
        if (theme) {
            appState.currentTheme = theme;
            document.body.setAttribute('data-theme', theme);
            if (dom.themeSelector && dom.themeSelector.value !== theme) {
                dom.themeSelector.value = theme;
            }
        }
        // 다크모드 설정 (html/body 클래스)
        const shouldUseDark = typeof isDark === 'boolean' ? isDark : appState.isDarkMode;
        appState.isDarkMode = shouldUseDark;
        document.documentElement.classList.toggle('dark', shouldUseDark);
        document.body.classList.toggle('dark', shouldUseDark);
        // 아이콘 업데이트
        if (dom.themeToggleDarkIcon) dom.themeToggleDarkIcon.style.display = shouldUseDark ? 'inline-flex' : 'none';
        if (dom.themeToggleLightIcon) dom.themeToggleLightIcon.style.display = shouldUseDark ? 'none' : 'inline-flex';
    }

    /**
     * 언어와 치환 파라미터에 맞춰 번역 문자열을 반환한다.
     */
    function getTranslation$1(key, lang = appState.currentLanguage, params = null) {
        const langToUse = translations[lang] || translations['en'];
        const englishPack = translations['en'] || {};
        let text = langToUse?.[key];
        if (text === undefined) {
            text = englishPack[key] ?? key;
        }
        if (params && typeof text === 'string') {
            for (const pKey in params) {
                text = text.replaceAll(`{${pKey}}`, params[pKey]);
            }
        }
        return text;
    }

    /**
     * 현재 언어를 변경하고 번역 대상 DOM을 갱신한다.
     */
    function setLanguage(lang, isInitializing = false) {
        appState.currentLanguage = lang;
        if (dom.languageSelector) dom.languageSelector.value = lang;
        document.documentElement.lang = lang;

        // 모든 번역 가능한 요소 업데이트
        document.querySelectorAll("[data-lang-key]").forEach(el => {
            const text = getTranslation$1(el.dataset.langKey, lang);
            if (text && text !== el.dataset.langKey) {
                el.innerHTML = text;
            }
        });

        document.querySelectorAll('[data-lang-attr]').forEach(el => {
            const attrList = el.dataset.langAttr?.split(',').map(attr => attr.trim()).filter(Boolean) || [];
            if (!attrList.length) return;
            const translationKey = el.dataset.langAttrKey || el.dataset.langKey;
            if (!translationKey) return;
            const translated = getTranslation$1(translationKey, lang);
            if (!translated || translated === translationKey) return;
            attrList.forEach(attrName => {
                if (attrName === 'textContent') {
                    el.textContent = translated;
                } else {
                    el.setAttribute(attrName, translated);
                }
            });
        });

        document.querySelectorAll('[data-lang-supporting]').forEach(el => {
            const supportingKey = el.dataset.langSupporting;
            if (!supportingKey) return;
            const supportingText = getTranslation$1(supportingKey, lang);
            if (supportingText && supportingText !== supportingKey) {
                el.setAttribute('supporting-text', supportingText);
            }
        });

        const placeholder = getTranslation$1('textInputPlaceholder', lang);
        if (placeholder) {
            if (dom.textInput) {
                dom.textInput.setAttribute('placeholder', placeholder);
            }
            if (documentState.simplemde && documentState.simplemde.codemirror) {
                const inputField = documentState.simplemde.codemirror.getInputField?.();
                if (inputField) {
                    inputField.setAttribute('placeholder', placeholder);
                }
            }
        }

        // 버튼 상태 업데이트
        updateButtonStates(readerState.isPaused ? "paused" : "initial");
    }

    /**
     * 사용자 피드백 표시용 임시 토스트 메시지를 출력한다.
     */
    function showMessage(messageKey, type = "info", duration = 2000) {
        const messageBox = document.getElementById("custom-message-box");
        if (!messageBox) return;

        const messageText = messageBox.querySelector('span');
        if (messageText) {
            messageText.textContent = getTranslation$1(messageKey);
        }

        if (messageHideTimeout) {
            clearTimeout(messageHideTimeout);
        }

        MESSAGE_TYPES.forEach((cls) => messageBox.classList.remove(cls));
        messageBox.classList.remove('hidden');
        messageBox.classList.add(type);
        messageBox.classList.add('show');

        messageHideTimeout = setTimeout(() => {
            messageBox.classList.remove('show');
            messageBox.classList.remove(type);
            messageBox.classList.add('hidden');
        }, duration);
    }

    /**
     * 읽기 제어 버튼을 지정된 상태에 맞춰 활성/비활성화한다.
     */
    function updateButtonStates(buttonState) {
        if (!dom.startButton || !dom.pauseButton || !dom.resetButton) {
            return;
        }

        const editorText = documentState.simplemde ? documentState.simplemde.value() : '';
        const fallbackText = dom.textInput?.value || '';
        const hasText = (editorText || fallbackText).trim().length > 0;

        const setDisabled = (el, disabled) => {
            if (!el) return;
            el.disabled = disabled;
            if (disabled) {
                el.setAttribute('disabled', '');
            } else {
                el.removeAttribute('disabled');
            }
        };

        setDisabled(dom.startButton, true);
        setDisabled(dom.pauseButton, true);
        setDisabled(dom.resetButton, true);

        switch (buttonState) {
            case "initial":
                if (hasText) setDisabled(dom.startButton, false);
                break;
            case "reading":
                setDisabled(dom.pauseButton, false);
                setDisabled(dom.resetButton, false);
                break;
            case "paused":
                if (hasText) setDisabled(dom.startButton, false);
                setDisabled(dom.resetButton, false);
                break;
            case "completed":
                setDisabled(dom.resetButton, false);
                break;
        }
        dom.startButton.textContent = getTranslation$1(buttonState === 'paused' ? "resumeButton" : "startButton");
        dom.pauseButton.textContent = getTranslation$1("pauseButton");
        dom.resetButton.textContent = getTranslation$1("resetButton");
    }

    /**
     * 읽기 제어 버튼과 대응하는 핸들러를 바인딩한다.
     */
    function setupReaderControls() {
        // 시작 버튼
        dom.startButton?.addEventListener("click", () => {
            const isResuming = readerState.isPaused && readerState.currentIndex > 0;
            runAsyncHandler('onStartReading', isResuming);
        });
        
        // 일시정지 버튼
        dom.pauseButton?.addEventListener("click", () => {
            runAsyncHandler('onPauseReading');
        });
        
        // 리셋 버튼
        dom.resetButton?.addEventListener("click", () => {
            runAsyncHandler('onResetReader');
        });
        
        dom.wpmInput?.addEventListener("input", () => {
            const newWpm = parseInt(dom.wpmInput.value, 10);
            if (Number.isNaN(newWpm)) {
                return;
            }
            readerState.currentWpm = newWpm;
            runAsyncHandler('onWpmChange', newWpm);
            scheduleSave();
        });
        dom.fontFamilySelector?.addEventListener('change', (e) => {
            appState.fontFamily = e.target.value;
            applyReaderStyles(appState.fontFamily, appState.fontSize);
            scheduleSave();
        });
        dom.fontSizeSlider?.addEventListener('input', (e) => {
            const newSize = parseInt(e.target.value, 10);
            if (Number.isNaN(newSize)) {
                return;
            }
            appState.fontSize = newSize;
            if(dom.fontSizeLabel) dom.fontSizeLabel.textContent = getTranslation$1('fontSizeLabel', appState.currentLanguage, { size: newSize });
            applyReaderStyles(appState.fontFamily, appState.fontSize);
            scheduleSave();
        });
        dom.chunkSizeSelector?.addEventListener('change', async (e) => {
            readerState.chunkSize = parseInt(e.target.value, 10);
            runAsyncHandler('onChunkSizeChange', readerState.chunkSize);
            scheduleSave();
        });
        dom.fixationToggle?.addEventListener("change", (e) => {
            // Material Web Component Switch는 selected 속성 사용
            const isEnabled = e.target.selected !== undefined ? e.target.selected : e.target.checked;
            readerState.isFixationPointEnabled = isEnabled;
            runAsyncHandler('onFixationToggle', isEnabled);
            scheduleSave();
        });
        dom.readingModeSelector?.addEventListener('change', async (e) => {
            readerState.readingMode = e.target.value;
            runAsyncHandler('onReadingModeChange', readerState.readingMode);
            scheduleSave();
        });
    }

    /**
     * 언어/테마 등 UI 설정 요소에 이벤트를 연결한다.
     */
    function setupGeneralEventListeners() {
        const handleLanguageChange = (event) => {
            const lang = event.target.value;
            if (!lang || lang === appState.currentLanguage) {
                return;
            }
            setLanguage(lang);
            scheduleSave();
            // 강제 표시 동기화
            setTimeout(() => {
                if (dom.languageSelector && dom.languageSelector.value !== lang) {
                    dom.languageSelector.value = lang;
                }
            }, 100);
        };
        dom.languageSelector?.addEventListener("input", handleLanguageChange);
        dom.languageSelector?.addEventListener("change", handleLanguageChange);
        const handleThemeChange = (e) => {
            const theme = e.target.value;
            applyTheme(theme, appState.isDarkMode);
            scheduleSave();
            // 강제 표시 동기화
            setTimeout(() => {
                if (dom.themeSelector && dom.themeSelector.value !== theme) {
                    dom.themeSelector.value = theme;
                }
            }, 100);
        };
        dom.themeSelector?.addEventListener('input', handleThemeChange);
        dom.themeSelector?.addEventListener('change', handleThemeChange);
        dom.darkModeToggle?.addEventListener("click", () => {
            const isDark = !appState.isDarkMode;
            applyTheme(dom.themeSelector?.value || appState.currentTheme || 'blue', isDark);
            dom.darkModeToggle.setAttribute('aria-pressed', isDark.toString());
            scheduleSave();
        });
    }

    /**
     * 로그인 상태에 따라 인증 관련 UI를 토글한다.
     */
    function updateAuthUI() {
        const isLoggedIn$1 = isLoggedIn();
        if (dom.loginButton) dom.loginButton.classList.toggle('hidden', isLoggedIn$1);
        if (dom.logoutButton) dom.logoutButton.classList.toggle('hidden', !isLoggedIn$1);
        if (dom.newDocumentButton) dom.newDocumentButton.classList.toggle('hidden', !isLoggedIn$1);
    }

    /**
     * 로그인/회원가입 모드를 전환하며 인증 모달을 연다.
     */
    function showAuthModal(isSignup = false) {
        if (dom.authModal) {
            dom.authModal.classList.remove('hidden');
            if (dom.authModalTitle) {
                dom.authModalTitle.textContent = getTranslation$1(isSignup ? 'signupTitle' : 'loginTitle');
            }
            if (dom.authSubmitButton) {
                dom.authSubmitButton.textContent = getTranslation$1(isSignup ? 'signupButton' : 'loginButton');
            }
            if (dom.authSwitchButton) {
                dom.authSwitchButton.textContent = getTranslation$1(isSignup ? 'switchToLogin' : 'switchToSignup');
            }
        }
    }

    /**
     * 인증 모달을 닫고 입력 값을 초기화한다.
     */
    function hideAuthModal() {
        if (dom.authModal) {
            dom.authModal.classList.add('hidden');
            if (dom.authForm) {
                dom.authForm.reset();
            }
        }
    }

    /**
     * 인증 모달 버튼과 API 호출/핸들러를 연결한다.
     */
    function setupAuthEventListeners() {
        if (dom.loginButton) {
            dom.loginButton.addEventListener('click', () => showAuthModal(false));
        }
        
        if (dom.logoutButton) {
            dom.logoutButton.addEventListener('click', () => {
                runAsyncHandler('onLogout');
            });
        }
        
        if (dom.authCancelButton) {
            dom.authCancelButton.addEventListener('click', hideAuthModal);
        }
        
        if (dom.authSwitchButton) {
            dom.authSwitchButton.addEventListener('click', (e) => {
                e.preventDefault();
                const isCurrentlySignup = dom.authModalTitle?.textContent === getTranslation$1('signupTitle');
                showAuthModal(!isCurrentlySignup);
            });
        }
        
        if (dom.authForm) {
            dom.authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = dom.emailInput?.value || dom.emailInput?.input?.value;
                const password = dom.passwordInput?.value || dom.passwordInput?.input?.value;
                const captchaElement = document.querySelector('.g-recaptcha');
                const siteKey = captchaElement?.dataset?.sitekey || '';
                const captchaEnabled = typeof grecaptcha !== 'undefined' && !!siteKey && !siteKey.includes('YOUR_RECAPTCHA_SITE_KEY');
                const captchaToken = captchaEnabled ? grecaptcha.getResponse() : undefined;
                
                if (!email || !password) {
                    showMessage('msgEmailPasswordRequired', 'error');
                    return;
                }
                
                // 비밀번호 정책 검사 (회원가입 시에만)
                const isSignup = dom.authModalTitle?.textContent === getTranslation$1('signupTitle');
                if (isSignup) {
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;
                    if (!passwordRegex.test(password)) {
                        showMessage('error_WEAK_PASSWORD', 'error');
                        return;
                    }
                }
                
                if (captchaEnabled && !captchaToken) {
                    showMessage('msgCaptchaRequired', 'error');
                    return;
                }
                
                try {
                    const response = isSignup
                        ? await signup(email, password, captchaToken)
                        : await login(email, password, captchaToken);

                    if (response.token) {
                        if (captchaEnabled) {
                            grecaptcha.reset();
                        }
                        hideAuthModal();
                        await runAsyncHandler('onAuthSuccess', { isSignup, token: response.token });
                        showMessage(isSignup ? 'msgSignupSuccess' : 'msgLoginSuccess', 'success');
                    } else {
                        const errorKey = response?.error_code
                            ? (response.error_code.startsWith('error_') ? response.error_code : `error_${response.error_code}`)
                            : 'msgAuthError';
                        showMessage(errorKey, 'error');
                        runAsyncHandler('onAuthFailure', response);
                    }
                } catch (error) {
                    console.error('Auth error:', error);
                    if (captchaEnabled && typeof grecaptcha !== 'undefined') {
                        grecaptcha.reset();
                    }
                    showMessage('msgAuthError', 'error');
                    runAsyncHandler('onAuthFailure', error);
                }
            });
        }
    }

    /**
     * 사이드바 네비게이션을 열고 닫는 동작을 제어한다.
     */
    function setupSidebarEventListeners() {
        if (dom.hamburgerMenuButton) {
            dom.hamburgerMenuButton.addEventListener('click', () => {
                if (dom.documentSidebar) {
                    dom.documentSidebar.classList.remove('-translate-x-full');
                    dom.hamburgerMenuButton.setAttribute('aria-expanded', 'true');
                }
                if (dom.sidebarOverlay) {
                    dom.sidebarOverlay.classList.remove('hidden');
                }
            });
        }
        
        if (dom.closeSidebarButton) {
            dom.closeSidebarButton.addEventListener('click', () => {
                if (dom.documentSidebar) {
                    dom.documentSidebar.classList.add('-translate-x-full');
                    dom.hamburgerMenuButton.setAttribute('aria-expanded', 'false');
                }
                if (dom.sidebarOverlay) {
                    dom.sidebarOverlay.classList.add('hidden');
                }
            });
        }
        
        if (dom.sidebarOverlay) {
            dom.sidebarOverlay.addEventListener('click', () => {
                if (dom.documentSidebar) {
                    dom.documentSidebar.classList.add('-translate-x-full');
                    dom.hamburgerMenuButton.setAttribute('aria-expanded', 'false');
                }
                dom.sidebarOverlay.classList.add('hidden');
            });
        }
    }

    /**
     * 문서 관련 버튼에 생성/초기화 동작을 연결한다.
     */
    function setupDocumentEventListeners() {
        if (dom.clearTextButton) {
            dom.clearTextButton.addEventListener('click', () => {
                if (dom.textInput) {
                    dom.textInput.value = '';
                    if (documentState.simplemde) {
                        documentState.simplemde.value('');
                    }
                    updateTextStats();
                    scheduleSave();
                }
            });
        }
    }

    /**
     * 동적으로 초기화되는 주요 DOM 요소를 캐시한다.
     */
    function initializeDOMElements() {
        refreshDomReferences();
        // 통계 요소들을 동적으로 할당
        dom.wordCountDisplay = document.querySelector("[data-stat='word-count']");
        dom.charCountDisplay = document.querySelector("[data-stat='char-count']");
        dom.readingTimeDisplay = document.querySelector("[data-stat='reading-time']");

        // 셀렉트 기본값을 상태로 보정
        if (dom.languageSelector && appState.currentLanguage) {
            dom.languageSelector.value = appState.currentLanguage;
        }
        if (dom.themeSelector && document.body.getAttribute('data-theme')) {
            dom.themeSelector.value = document.body.getAttribute('data-theme');
        }
        
    }

    /**
     * 모든 UI 이벤트 리스너를 등록한다. DOM 로드 이후 1회 호출한다.
     */
    function attachEventListeners() {
        initializeDOMElements();
        setupReaderControls();
        setupGeneralEventListeners();
        setupAuthEventListeners();
        setupSidebarEventListeners();
        setupDocumentEventListeners();
    }

    // reader_view.js - 읽기 화면 표시용 보조 함수 모음


    /**
     * 읽기 상태에 따라 진행률 바와 ARIA 정보를 갱신한다.
     */
    function updateProgressBar() {
        if (!dom.progressBarFill) return;
        const progress = readerState.words.length > 0
            ? (readerState.currentIndex / readerState.words.length) * 100
            : 0;
        dom.progressBarFill.style.width = `${progress}%`;

        const progressBar = dom.progressBarFill.parentElement;
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', Math.round(progress).toString());
        }
    }

    /**
     * 시선 고정점 기능이 활성화된 경우 단어 내 초점을 강조한다.
     *
     * @param {string} word 현재 표시 중인 단어 또는 청크
     * @returns {string} 고정점 마크업이 적용된 HTML 문자열
     */
    function formatWordWithFixation(word) {
        if (!readerState.isFixationPointEnabled || !word || word.length <= 1) {
            return word;
        }

        const fixationIndex = Math.max(0, Math.floor(word.length / 3) - (word.length > 5 ? 1 : 0));
        if (fixationIndex < 0 || fixationIndex >= word.length) {
            return word;
        }

        const prefix = word.substring(0, fixationIndex);
        const fixationChar = word.charAt(fixationIndex);
        const suffix = word.substring(fixationIndex + 1);
        return `${prefix}<span class="fixation-point">${fixationChar}</span>${suffix}`;
    }

    /**
     * 언어 및 청크 크기에 맞춰 진행률 단위 라벨을 결정한다.
     *
     * @param {number} total 전체 읽기 단위 수
     * @returns {string} 진행률 메시지에 사용할 번역 문자열
     */
    function resolveProgressUnitLabel(total) {
        if (readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
            return getTranslation$1('charsLabel', appState.currentLanguage, { total });
        }
        if (readerState.chunkSize > 1) {
            return getTranslation$1('chunksLabel', appState.currentLanguage, { total });
        }
        return getTranslation$1('wordsLabel', appState.currentLanguage, { total });
    }

    // text_core.js - framework-agnostic text normalization and segmentation

    function cleanText(raw) {
        if (!raw) return '';
        
        let text = String(raw);
        
        // 마크다운 헤더 제거 (# ## ### 등)
        text = text.replace(/^#{1,6}\s+/gm, '');
        
        // 마크다운 링크 제거 [텍스트](URL) → 텍스트만 유지
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        // 이미지 링크 완전 제거 ![alt](src)
        text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
        
        // 인라인 코드 제거 `code`
        text = text.replace(/`([^`]+)`/g, '$1');
        
        // 코드 블록 제거 ```code```
        text = text.replace(/```[\s\S]*?```/g, '');
        
        // 볼드/이탤릭 마크다운 제거 **text** *text* __text__ _text_
        text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
        text = text.replace(/(\*|_)(.*?)\1/g, '$2');
        
        // 취소선 제거 ~~text~~
        text = text.replace(/~~(.*?)~~/g, '$1');
        
        // 인용문 제거 > text
        text = text.replace(/^\s*>\s*/gm, '');
        
        // 리스트 마커 제거 - * + 1. 2. 등
        text = text.replace(/^\s*[-*+]\s+/gm, '');
        text = text.replace(/^\s*\d+\.\s+/gm, '');
        
        // 수평선 제거 --- *** ___
        text = text.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '');
        
        // 테이블 구분자 제거 | --- |
        text = text.replace(/^\|.*\|$/gm, '');
        text = text.replace(/^\|?\s*:?-+:?\s*\|.*$/gm, '');
        
        // HTML 태그 제거
        text = text.replace(/<[^>]*>/g, '');
        
        // 남은 특수문자들 제거
        text = text.replace(/[\[\]"""'()（）<>【】『』「」`~@^|=+\\]/g, '');
        
        // 여러 공백을 하나로 통합하고 줄바꿈 정리
        text = text.replace(/\s+/g, ' ');
        text = text.replace(/\n\s*\n/g, '\n');
        
        return text.trim();
    }

    async function segmentJapaneseWithKuromoji(text, getTokenizer) {
        try {
            const tokenizer = await getTokenizer();
            return tokenizer.tokenize(text).map(t => t.surface_form);
        } catch {
            return text.split('');
        }
    }

    function chunkIfNeeded(words, chunkSize, noSpaceLanguage) {
        if (!Array.isArray(words)) return [];
        if (chunkSize > 1 && !noSpaceLanguage) {
            const chunks = [];
            for (let i = 0; i < words.length; i += chunkSize) {
                chunks.push(words.slice(i, i + chunkSize).join(' '));
            }
            return chunks;
        }
        return words;
    }

    // text_handler.js - 텍스트 통계 계산 및 입력 변화 감지 처리


    let kuromojiTokenizer = null;

    async function getTokenizer() {
        if (kuromojiTokenizer) return kuromojiTokenizer;
        console.log("일본어 사전을 로딩합니다...");
        return new Promise((resolve, reject) => {
            kuromoji.builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji/dict/" }).build((err, tokenizer) => {
                if (err) {
                    console.error("Kuromoji 사전 생성 실패:", err);
                    reject(err);
                } else {
                    kuromojiTokenizer = tokenizer;
                    console.log("일본어 사전 로딩 완료.");
                    resolve(tokenizer);
                }
            });
        });
    }

    /**
     * 브라우저 Intl Segmenter API를 활용해 텍스트를 분절한다.
     */
    function segmentTextWithBrowserAPI(text) {
        try {
            const segmenter = new Intl.Segmenter(appState.currentLanguage, { granularity: 'word' });
            return Array.from(segmenter.segment(text)).map(s => s.segment);
        } catch (error) {
            console.warn('Intl.Segmenter를 지원하지 않아 문자 단위 분할로 대체합니다');
            return text.split('');
        }
    }

    /**
     * 한국어 문장을 속독에 적합한 길이로 분할한다.
     */
    function segmentKoreanText(text) {
        // 한국어는 기본적으로 어절 단위로 처리 (자연스러운 읽기)
        const words = [];
        const segments = text.split(/\s+/);
        
        for (const segment of segments) {
            if (segment.trim()) {
                // 한글이 포함된 경우
                if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(segment)) {
                    // 어절이 너무 길면(6글자 이상) 적절히 분리, 아니면 그대로 유지
                    if (segment.length > 6) {
                        const koreanWords = [];
                        let currentWord = '';
                        
                        for (let i = 0; i < segment.length; i++) {
                            const char = segment[i];
                            currentWord += char;
                            
                            // 3-4글자 단위로 자연스럽게 분리
                            if (currentWord.length >= 3 || i === segment.length - 1) {
                                if (currentWord.trim()) {
                                    koreanWords.push(currentWord);
                                }
                                currentWord = '';
                            }
                        }
                        
                        words.push(...koreanWords);
                    } else {
                        // 어절이 적당한 길이면 그대로 유지 (자연스러운 읽기)
                        words.push(segment);
                    }
                } else {
                    // 영문이나 숫자는 그대로 유지
                    words.push(segment);
                }
            }
        }
        
        return words.filter(word => word.length > 0);
    }

    /**
     * 편집기 내용을 기반으로 통계와 단어 청크를 재계산한다.
     */
    async function updateTextStats$1() {
        const currentText = documentState.simplemde ? documentState.simplemde.value() : (dom.textInput?.value || '');
        const cleanedText = cleanText(currentText);

        // 텍스트가 비어있으면 초기화
        if (!cleanedText.trim()) {
            readerState.words = [];
            readerState.currentIndex = 0;
            if (dom.wordCountDisplay) dom.wordCountDisplay.textContent = '0';
            if (dom.charCountDisplay) dom.charCountDisplay.textContent = '0';
            if (dom.readingTimeDisplay) dom.readingTimeDisplay.textContent = '0';
            if (dom.progressInfoDisplay) dom.progressInfoDisplay.textContent = '';
            updateProgressBar();
            updateButtonStates('initial');
            return;
        }

        let words;
        if (appState.currentLanguage === 'ja') {
            words = await segmentJapaneseWithKuromoji(cleanedText, getTokenizer);
        } else if (appState.currentLanguage === 'ko') {
            words = segmentKoreanText(cleanedText);
        } else if (readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
            words = segmentTextWithBrowserAPI(cleanedText);
        } else {
            words = cleanedText.trim().split(/\s+/).filter(Boolean);
        }

        const wordCount = words.length;

        readerState.words = chunkIfNeeded(
            words,
            readerState.chunkSize,
            readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)
        );

        // 통계 업데이트
        if (dom.wordCountDisplay) dom.wordCountDisplay.textContent = wordCount;
        if (dom.charCountDisplay) dom.charCountDisplay.textContent = cleanedText.length;
        if (dom.readingTimeDisplay) {
            const readingTime = Math.ceil(wordCount / (readerState.currentWpm / 60));
            dom.readingTimeDisplay.textContent = readingTime;
        }
        
        updateProgressBar();
        updateDetailedStats(cleanedText);
        updateButtonStates(readerState.isPaused ? 'paused' : 'initial');
    }

    /**
     * 외부 의존성 없이 경량 가독성 지표를 계산한다.
     */
    function updateDetailedStats(text) {
        // 외부 라이브러리 없이 경량 통계 산출
        const stats = {
            readabilityScore: "-",
            avgSentenceLength: "-",
            syllableCount: "-",
            lexicalDiversity: "-",
        };

        if (text && text.trim() !== "") {
            try {
                const sentences = text.split(/[.!?\n]+/).filter(Boolean);
                const words = (text.match(/\b\w+\b/g) || []).map(w => w.toLowerCase());
                const vowels = (text.match(/[aeiouAEIOU가-힣]/g) || []).length; // 간이 음절수
                const uniqueWords = new Set(words).size;
                const wordCount = words.length;
                const sentenceCount = sentences.length || 1;
                stats.avgSentenceLength = (wordCount / sentenceCount).toFixed(1);
                stats.syllableCount = vowels;
                stats.lexicalDiversity = wordCount > 0 ? `${((uniqueWords / wordCount) * 100).toFixed(1)}%` : "0%";
                stats.readabilityScore = (0.39 * (wordCount / sentenceCount) + 11.8 * (vowels / Math.max(wordCount,1)) - 15.59).toFixed(1);
            } catch (error) {
                console.error("경량 통계 계산 중 오류가 발생했습니다:", error);
            }
        }

        if (dom.readabilityScore) dom.readabilityScore.textContent = String(stats.readabilityScore);
        if (dom.avgSentenceLength) dom.avgSentenceLength.textContent = String(stats.avgSentenceLength);
        if (dom.syllableCount) dom.syllableCount.textContent = String(stats.syllableCount);
        if (dom.lexicalDiversity) dom.lexicalDiversity.textContent = String(stats.lexicalDiversity);
    }

    /**
     * 새로운 텍스트를 적용하고 읽기 상태를 처음부터 재시작한다.
     */
    async function handleTextChange(newTextSourceOrEvent) {
        const newText = (typeof newTextSourceOrEvent === "string") ? newTextSourceOrEvent : (documentState.simplemde ? documentState.simplemde.value() : '');

        if (documentState.simplemde) {
            documentState.simplemde.value(newText);
        }
        readerState.isPaused = false;
        readerState.currentIndex = 0;

        await updateTextStats$1();
        updateButtonStates("initial");

        if (dom.currentWordDisplay) {
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation$1("statusReady"));
        }

        scheduleSave();
        localStorage.setItem(LS_KEYS.INDEX, "0");
    }

    // reader_core.js - framework-agnostic speed reading core
    // This module contains the minimal engine logic (no DOM knowledge)

    class SpeedReaderCore {
        constructor(options) {
            this.getWords = options.getWords; // () => string[] | string[][]
            this.onChunk = options.onChunk;   // (chunkText: string) => void
            this.onProgress = options.onProgress; // (index, total) => void
            this.onStatus = options.onStatus; // (statusKey: string) => void
            this.onComplete = options.onComplete; // () => void
            this.getWpm = options.getWpm;     // () => number
            this.getMode = options.getMode;   // () => 'flash' | 'teleprompter'

            this.index = 0;
            this.timer = null;
            this.startDelayId = null;
            this.isPaused = false;
        }

        get intervalMs() {
            const wpm = Math.max(50, Math.min(500, Number(this.getWpm?.() || 250)));
            return 60000 / wpm;
        }

        // 단어 길이와 복잡도에 따른 적응형 속도 계산
        getAdaptiveInterval(word) {
            const baseInterval = this.intervalMs;
            
            if (!word) return baseInterval;
            
            const wordText = Array.isArray(word) ? word.join(' ') : String(word);
            const length = wordText.length;
            
            // 한국어 친화적 길이별 시간 조정
            let multiplier = 1;
            if (length <= 2) {
                multiplier = 0.9; // 짧은 단어는 약간 빠르게 (한국어 특성 고려)
            } else if (length >= 5) {
                multiplier = 1.2; // 긴 단어는 적당히 느리게
            } else if (length >= 4) {
                multiplier = 1.05; // 중간 단어는 미세 조정
            }
            
            // 특수 문자나 숫자가 포함된 경우 시간 추가
            if (/[0-9]/.test(wordText)) {
                multiplier *= 1.2; // 숫자는 처리 시간 추가
            }
            if (/[^\w\s가-힣]/.test(wordText)) {
                multiplier *= 1.1; // 특수문자 처리 시간 추가
            }
            
            return Math.round(baseInterval * multiplier);
        }

        resetToStart() {
            this.index = 0;
        }

        start(isResuming = false, delayMs = 1000) {
            const words = this.getWords?.() || [];
            const total = Array.isArray(words) ? words.length : 0;
            if (total === 0) {
                this.onStatus?.('msgNoWords');
                return;
            }
            if (!isResuming) this.resetToStart();

            this.isPaused = false;
            this.onStatus?.('statusPreparing');

            clearTimeout(this.startDelayId);
            this.startDelayId = setTimeout(() => {
                clearInterval(this.timer);
                this.tick();
                this.scheduleNextTick();
            }, isResuming ? 0 : delayMs);
        }

        tick() {
            const words = this.getWords?.() || [];
            const total = words.length;
            if (this.index >= total) {
                this.complete();
                return;
            }
            const chunk = words[this.index];
            const chunkText = Array.isArray(chunk) ? chunk.join(' ') : String(chunk);
            this.onChunk?.(chunkText);
            this.index += 1;
            this.onProgress?.(this.index, total);
            
            // 다음 단어 예약
            this.scheduleNextTick();
        }

        scheduleNextTick() {
            const words = this.getWords?.() || [];
            if (this.index < words.length && !this.isPaused) {
                const currentWord = words[this.index];
                const nextInterval = this.getAdaptiveInterval(currentWord);
                this.timer = setTimeout(() => this.tick(), nextInterval);
            }
        }

        pause() {
            clearTimeout(this.timer);
            this.timer = null;
            this.isPaused = true;
            this.onStatus?.('statusPaused');
        }

        complete() {
            clearTimeout(this.timer);
            this.timer = null;
            this.onStatus?.('statusComplete');
            this.onComplete?.();
        }

        updateSpeed() {
            // 실행 중인 경우에만 타이머 재설정
            if (this.timer && !this.isPaused) {
                clearTimeout(this.timer);
                this.scheduleNextTick();
            }
        }
    }

    // reader.js - 속독 엔진 핵심 로직


    const START_DELAY = 1000;

    /**
     * 속독 엔진을 초기화하고 실행한다.
     *
     * @param {boolean} isResuming 일시정지 상태에서 재개하는지 여부
     */
    async function startReadingFlow(isResuming = false) {
        // 항상 최신 텍스트 세분화가 반영되도록 보장
        await updateTextStats$1();
        if (!readerState.words || readerState.words.length === 0) {
            showMessage("msgNoWords", "error");
            return;
        }
        
        // 재시작이 아닌 경우에만 인덱스 초기화
        if (!isResuming) {
            readerState.currentIndex = 0;
            // 텔레프롬프터 모드 초기화
            if (readerState.readingMode === 'teleprompter' && dom.currentWordDisplay) {
                dom.currentWordDisplay.innerHTML = '';
                dom.currentWordDisplay.style.textAlign = 'left';
                dom.currentWordDisplay.style.overflowY = 'auto';
                dom.currentWordDisplay.style.maxHeight = '400px';
            } else if (dom.currentWordDisplay) {
                dom.currentWordDisplay.style.textAlign = 'center';
                dom.currentWordDisplay.style.overflowY = 'visible';
                dom.currentWordDisplay.style.maxHeight = 'none';
            }
        }

        if (dom.currentWordDisplay) {
            if (readerState.readingMode === 'teleprompter') {
                dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation$1("statusPreparing"));
            } else {
                dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation$1("statusPreparing"));
            }
        }

        // 엔진 초기화 및 실행 (항상 새로 생성하여 최신 설정 반영)
        readerState.engine = new SpeedReaderCore({
                getWords: () => readerState.words,
                getWpm: () => readerState.currentWpm,
                getMode: () => readerState.readingMode,
                onChunk: (text) => {
                    if (!dom.currentWordDisplay) return;
                    if (readerState.readingMode === 'teleprompter') {
                        const area = dom.currentWordDisplay;
                        area.innerHTML = area.innerHTML + ' ' + text;
                        area.scrollTop = area.scrollHeight;
                    } else {
                        // 원본 ReadMindApp 애니메이션 로직
                        const wordArea = dom.currentWordDisplay;
                        const currentWpm = readerState.currentWpm;
                        
                        // 애니메이션 상수 (원본에서 가져온 값들)
                        const ANIMATION_DURATION_NORMAL = 120;
                        const ANIMATION_DURATION_SUBTLE = 60;
                        const LOW_WPM_THRESHOLD = 200;
                        const NO_ANIMATION_THRESHOLD = 400;
                        
                        wordArea.innerHTML = formatWordWithFixation(text);
                        wordArea.style.transition = "none";
                        wordArea.style.opacity = "1";
                        wordArea.style.transform = "translateY(0px)";

                        if (currentWpm < LOW_WPM_THRESHOLD) {
                            // 느린 속도: 부드러운 페이드인 + 위치 이동 애니메이션
                            wordArea.style.opacity = "0";
                            wordArea.style.transform = "translateY(5px)";
                            wordArea.offsetHeight; // Reflow
                            wordArea.style.transition = `opacity ${ANIMATION_DURATION_NORMAL / 1000}s ease-out, transform ${ANIMATION_DURATION_NORMAL / 1000}s ease-out`;
                            wordArea.style.opacity = "1";
                            wordArea.style.transform = "translateY(0px)";
                        } else if (currentWpm < NO_ANIMATION_THRESHOLD) {
                            // 중간 속도: 미묘한 투명도 변화만
                            wordArea.style.opacity = "0.5";
                            wordArea.offsetHeight; // Reflow
                            wordArea.style.transition = `opacity ${ANIMATION_DURATION_SUBTLE / 1000}s ease-in-out`;
                            wordArea.style.opacity = "1";
                        }
                        // 빠른 속도 (400+ WPM): 애니메이션 없음
                    }
                },
                onProgress: (idx, total) => {
                    readerState.currentIndex = idx;
                    if (dom.progressInfoDisplay) {
                        const unitLabel = resolveProgressUnitLabel(total);
                        dom.progressInfoDisplay.textContent = getTranslation$1('progressLabelFormat', appState.currentLanguage, {
                            unit: unitLabel,
                            current: idx,
                            total,
                        });
                    }
                    updateProgressBar();
                },
                onStatus: (key) => {
                    if (key === 'msgNoWords') showMessage('msgNoWords', 'error');
                    else if (dom.currentWordDisplay) dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation$1(key));
                },
                onComplete: () => {
                    updateButtonStates("completed");
                    scheduleSave();
                    localStorage.setItem(LS_KEYS.INDEX, "0");
                }
            });
        

        readerState.isPaused = false;
        updateButtonStates("reading");
        readerState.engine.start(isResuming, START_DELAY);
    }

    /**
     * 엔진을 일시정지하고 현재 위치를 저장한다.
     */
    function pauseReading() {
        if (readerState.engine) readerState.engine.pause();
        readerState.isPaused = true;
        updateButtonStates("paused");
        scheduleSave();
        localStorage.setItem(LS_KEYS.INDEX, readerState.currentIndex.toString());
    }

    /**
     * 엔진이 실행 중일 때 읽기 속도를 실시간으로 갱신한다.
     *
     * @param {number} newWpm 새로 선택된 분당 단어 수
     */
    function updateReadingSpeed(newWpm) {
        readerState.currentWpm = newWpm;
        if (readerState.engine) {
            readerState.engine.updateSpeed();
        }
    }

    /**
     * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
     * since the last time the debounced function was invoked.
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @returns {Function} Returns the new debounced function.
     */
    function debounce$1(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    let saveTimeout;

    /**
     * Loads a document into the editor.
     * @param {object} doc The document object to load.
     */
    function loadDocument(doc) {
        documentState.activeDocument = doc;
        localStorage.setItem(LS_KEYS.LAST_DOC_ID, doc.id);
        if (documentState.simplemde) {
            documentState.simplemde.value(doc.content);
        }
        // Also update the hidden textarea for other parts of the app
        if (dom.textInput) {
            dom.textInput.value = doc.content;
        }
        handleTextChange(doc.content).catch((error) => {
            console.error('문서 로딩 중 텍스트 갱신 오류:', error);
        });
        // Highlight the active document in the list
        document.querySelectorAll('#document-list > div').forEach(el => {
            el.classList.toggle('bg-sky-100', el.dataset.id === String(doc.id));
            el.classList.toggle('dark:bg-sky-900', el.dataset.id === String(doc.id));
        });
    }

    /**
     * Handles saving the currently active document.
     */
    function scheduleDocumentSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
            if (documentState.activeDocument) {
                const newContent = documentState.simplemde
                    ? documentState.simplemde.value()
                    : (dom.textInput?.value ?? '');
                // Only save if content has changed
                if (newContent !== documentState.activeDocument.content) {
                    try {
                        await updateDocument(documentState.activeDocument.id, documentState.activeDocument.title, newContent);
                        documentState.activeDocument.content = newContent; // Update local state
                    } catch (error) {
                        showMessage('msgSettingsSaveError', 'error'); // Re-use settings save error message
                    }
                }
            }
        }, 1500);
    }

    /**
     * Fetches documents and renders them in the sidebar.
     */
    async function renderDocumentList() {
        if (!isLoggedIn()) {
            dom.documentList.innerHTML = `<p class="text-sm text-slate-500 p-4 text-center" data-lang-key="loginToSeeDocs"></p>`;
            const el = dom.documentList.querySelector('[data-lang-key="loginToSeeDocs"]');
            if (el) el.textContent = getTranslation$1("loginToSeeDocs");
            return;
        }

        try {
            const documents = await getDocuments();
            const docListContainer = dom.documentList;
            docListContainer.innerHTML = '';

            if (documents.length === 0) {
                docListContainer.innerHTML = `<p class="text-sm text-slate-500 p-4 text-center" data-lang-key="noDocuments"></p>`;
                const el = docListContainer.querySelector('[data-lang-key="noDocuments"]');
                if (el) el.textContent = getTranslation$1("noDocuments");
                return;
            }

            documents.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.className = 'document-item p-3 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 flex justify-between items-center';
                docElement.dataset.id = doc.id;

                const textContainer = document.createElement('div');
                const title = document.createElement('h3');
                title.className = 'font-semibold text-sm text-slate-800 dark:text-slate-200';
                title.textContent = doc.title;
                const date = document.createElement('p');
                date.className = 'text-xs text-slate-500 dark:text-slate-400';
                date.textContent = `Updated: ${new Date(doc.updated_at).toLocaleDateString()}`;
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-doc-btn p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-full';
                deleteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
                deleteBtn.dataset.id = doc.id;
                deleteBtn.title = "Delete document";

                textContainer.appendChild(title);
                textContainer.appendChild(date);
                docElement.appendChild(textContainer);
                docElement.appendChild(deleteBtn);
                docListContainer.appendChild(docElement);
            });

        } catch (error) {
            console.error("Failed to render document list:", error);
            dom.documentList.innerHTML = `<p class="text-sm text-red-500 p-4 text-center" data-lang-key="errorLoadDocs"></p>`;
            const el = dom.documentList.querySelector('[data-lang-key="errorLoadDocs"]');
            if (el) el.textContent = getTranslation$1("errorLoadDocs");
        }
    }

    function attachDocumentEventListeners() {
        dom.documentList.addEventListener('click', async (e) => {
            const docElement = e.target.closest('.document-item');
            const deleteButton = e.target.closest('.delete-doc-btn');

            if (deleteButton) {
                e.stopPropagation();
                const docId = deleteButton.dataset.id;
                showConfirmationModal('confirmDeleteDocTitle', 'confirmDeleteDocMessage', async () => {
                    try {
                        await deleteDocument(docId);
                        showMessage('msgDocDeleted', 'success');
                        if (documentState.activeDocument && documentState.activeDocument.id == docId) {
                            documentState.activeDocument = null;
                            if (documentState.simplemde) {
                                documentState.simplemde.value('');
                            }
                        }
                        await renderDocumentList();
                    } catch (error) {
                        showMessage('msgDocDeleteError', 'error');
                    }
                });
            } else if (docElement) {
                const docId = docElement.dataset.id;
                try {
                    const document = await getDocument(docId);
                    loadDocument(document);
                } catch (error) {
                    showMessage('msgDocLoadError', 'error');
                }
            }
        });

        dom.newDocumentButton.addEventListener('click', async () => {
            if (!isLoggedIn()) {
                showMessage('loginToSeeDocs', 'info');
                showAuthModal(false);
                return;
            }

            const promptMessage = getTranslation$1('newDocumentPrompt');
            const defaultTitle = getTranslation$1('newDocumentDefaultTitle');
            const title = prompt(promptMessage || 'Enter a title for your new document:', defaultTitle || 'New Document');
            if (title) {
                try {
                    const newDoc = await createDocument(title, `# ${title}\n\n`);
                    showMessage('msgDocCreated', 'success');
                    await renderDocumentList();
                    loadDocument(newDoc);
                } catch (error) {
                    const errorMessage = typeof error === 'string' ? error : error?.message;
                    showMessage(errorMessage || 'error_UNKNOWN', 'error');
                }
            }
        });

        if (documentState.simplemde) {
            documentState.simplemde.codemirror.on("change", debounce$1(() => {
                if (documentState.activeDocument) {
                    scheduleDocumentSave();
                }
                if (dom.textInput) {
                    dom.textInput.value = documentState.simplemde.value();
                }
            }, 500));
        } else if (dom.textInput) {
            const debounced = debounce$1(() => {
                if (documentState.activeDocument) {
                    scheduleDocumentSave();
                }
            }, 600);
            dom.textInput.addEventListener('input', debounced);
            dom.textInput.addEventListener('change', debounced);
        }

        if(dom.startButton) {
            dom.startButton.addEventListener('click', () => {
                if(documentState.simplemde && dom.textInput.value !== documentState.simplemde.value()) {
                     handleTextChange(documentState.simplemde.value());
                }
            }, true);
        }
    }

    // main.js - 애플리케이션 초기 구동 스크립트

    /**
     * 잦은 호출을 완화하기 위한 디바운스 유틸리티.
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function applySettings(settings) {
        const lang = settings.language || navigator.language.split("-")[0] || "ko";
        appState.currentLanguage = translations[lang] ? lang : "ko";

        const isDark = settings.darkMode ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = settings.colorTheme || settings.theme || 'blue';
        applyTheme(theme, isDark);
        appState.isDarkMode = isDark;
        appState.currentTheme = theme;
        if(dom.themeSelector) dom.themeSelector.value = theme;
        if(dom.darkModeToggle) dom.darkModeToggle.setAttribute('aria-pressed', String(isDark));

        readerState.isFixationPointEnabled = settings.isFixationPointEnabled || false;
        if (dom.fixationToggle) {
            // Material Web Component Switch는 selected 속성 사용
            dom.fixationToggle.selected = readerState.isFixationPointEnabled;
            dom.fixationToggle.checked = readerState.isFixationPointEnabled; // 호환성을 위해 둘 다 설정
        }

        const parsedWpm = parseInt(settings.wpm || "250", 10);
        readerState.currentWpm = Number.isNaN(parsedWpm) ? 250 : parsedWpm;
        if (dom.wpmInput) dom.wpmInput.value = readerState.currentWpm;

        readerState.chunkSize = parseInt(settings.chunkSize || "1", 10);
        if (dom.chunkSizeSelector) dom.chunkSizeSelector.value = readerState.chunkSize;

        readerState.readingMode = settings.readingMode || 'flash';
        if (dom.readingModeSelector) dom.readingModeSelector.value = readerState.readingMode;

        appState.fontFamily = settings.fontFamily || "'Roboto', sans-serif";
        const parsedFontSize = parseInt(settings.fontSize || "48", 10);
        appState.fontSize = Number.isNaN(parsedFontSize) ? 48 : parsedFontSize;
        if (dom.fontFamilySelector) dom.fontFamilySelector.value = appState.fontFamily;
        if (dom.fontSizeSlider) dom.fontSizeSlider.value = appState.fontSize;
        if (dom.fontSizeLabel) dom.fontSizeLabel.textContent = getTranslation('fontSizeLabel', appState.currentLanguage, { size: appState.fontSize });
        applyReaderStyles(appState.fontFamily, appState.fontSize);

        if (settings.text && documentState.simplemde) {
            documentState.simplemde.value(settings.text);
        }
    }

    /**
     * 마크다운 에디터 혹은 예비 텍스트 영역의 최신 내용을 반환한다.
     */
    function getEditorContent() {
        if (documentState.simplemde) {
            return documentState.simplemde.value();
        }
        return dom.textInput?.value || '';
    }

    /**
     * 현재 편집 중인 텍스트를 다시 분석하도록 강제한다.
     */
    async function refreshEditorContent() {
        await handleTextChange(getEditorContent());
    }

    /**
     * 읽기 영역과 진행률 정보를 초기 상태로 되돌린다.
     */
    function resetReaderViewport() {
        readerState.currentIndex = 0;
        readerState.isPaused = false;
        if (dom.currentWordDisplay) {
            dom.currentWordDisplay.innerHTML = '';
        }
        if (dom.progressInfoDisplay) {
            dom.progressInfoDisplay.textContent = '';
        }
        updateProgressBar();
        updateButtonStates('initial');
    }

    /**
     * UI 모듈에 앱 전반의 동작을 연결하는 콜백을 주입한다.
     */
    function registerUiEventHandlers() {
        setUiHandlers({
            onStartReading: async (isResuming) => {
                await startReadingFlow(isResuming);
            },
            onPauseReading: () => {
                pauseReading();
            },
            onResetReader: () => {
                resetReaderViewport();
            },
            onWpmChange: async (newWpm) => {
                updateReadingSpeed(newWpm);
                await updateTextStats$1();
            },
            onChunkSizeChange: async () => {
                await refreshEditorContent();
            },
            onFixationToggle: () => {
                // UI 단에서 스케줄된 저장만 수행하면 충분하다.
            },
            onReadingModeChange: async () => {
                await refreshEditorContent();
            },
            onAuthSuccess: async () => {
                await handleSuccessfulLogin();
            },
            onAuthFailure: (error) => {
                console.warn('인증 처리 중 오류가 감지되었습니다:', error);
            },
            onLogout: () => {
                handleLogout();
            },
        });
    }

    registerUiEventHandlers();

    /**
     * 인증이 성공한 후 UI와 상태를 동기화한다.
     */
    async function handleSuccessfulLogin() {
        updateAuthUI();
        await renderDocumentList();
        await loadAndApplySettings();
        setLanguage(appState.currentLanguage, true);
        updateTextStats$1();
    }

    /**
     * 사용자 컨텍스트를 정리하고 로그아웃 상태로 되돌린다.
     */
    function handleLogout() {
        logout();
        documentState.activeDocument = null;
        if (documentState.simplemde) documentState.simplemde.value('');
        updateAuthUI();
        renderDocumentList();
    }

    /**
     * 로컬/서버 설정을 순차적으로 로드하고 병합한다.
     */
    async function loadAndApplySettings() {
        let settings = {};
        
        // 먼저 로컬 설정을 로드
        const localSettings = localStorage.getItem(LS_KEYS.SETTINGS);
        if (localSettings) {
            try {
                settings = JSON.parse(localSettings);
            } catch (error) {
                console.warn('로컬 설정을 파싱할 수 없습니다:', error);
            }
        }

        // 로그인된 경우 서버 설정을 로드하고 로컬 설정을 덮어쓰기
        if (isLoggedIn()) {
            try {
                const serverSettings = await getSettings();
                settings = { ...settings, ...serverSettings };
            } catch (error) {
                console.error('서버에서 설정을 가져오지 못했습니다:', error);
            }
        }
        
        applySettings(settings);
    }


    /**
     * DOM 준비 이후 SPA 초기화를 진행한다.
     */
    async function initializeApp() {
        try {
            refreshDomReferences();
            const textInputEl = document.getElementById("text-input");
            if (textInputEl && typeof SimpleMDE === 'function') {
                documentState.simplemde = new SimpleMDE({
                    element: textInputEl,
                    spellChecker: false,
                    autosave: { enabled: false },
                    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"],
                });

                const debouncedUpdate = debounce(() => {
                    updateTextStats$1();
                    scheduleSave();
                }, 500); // 500ms delay

                // 통합된 이벤트 리스너
                documentState.simplemde.codemirror.on('change', () => {
                    debouncedUpdate();
                });
            } else if (textInputEl) {
                const debouncedUpdate = debounce(() => {
                    updateTextStats$1();
                    scheduleSave();
                }, 400);
                textInputEl.addEventListener('input', debouncedUpdate);
                textInputEl.addEventListener('change', debouncedUpdate);
            }

            await loadAndApplySettings();
            updateAuthUI();
            await renderDocumentList();
            setLanguage(appState.currentLanguage, true);
            updateTextStats$1();
            updateButtonStates("initial");
            updateProgressBar();

            if (!localStorage.getItem(LS_KEYS.HAS_VISITED)) {
                const welcomeDialog = document.getElementById('welcome-dialog');
                if(welcomeDialog) welcomeDialog.classList.remove('hidden');
                localStorage.setItem(LS_KEYS.HAS_VISITED, 'true');
            }

        } catch (error) {
            console.error("Error during app initialization:", error);
        } finally {
            attachEventListeners();
            attachDocumentEventListeners();
        }
    }

    document.addEventListener("DOMContentLoaded", initializeApp);

    exports.handleLogout = handleLogout;
    exports.handleSuccessfulLogin = handleSuccessfulLogin;

    return exports;

})({});
//# sourceMappingURL=bundle.js.map
