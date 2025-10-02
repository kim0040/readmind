// ui.js - UI 로직과 DOM 제어, 이벤트 바인딩 담당

import * as auth from './auth.js';
import { appState, readerState, documentState } from './state.js';
import { scheduleSave } from './save_manager.js';

export const dom = {
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
export function refreshDomReferences() {
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
export function setUiHandlers(handlers) {
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

export function showConfirmationModal(titleKey, messageKey, onConfirm) {
    const overlay = document.getElementById('confirmation-modal-overlay');
    const titleEl = document.getElementById('confirmation-modal-title');
    const messageEl = document.getElementById('confirmation-modal-message');
    const confirmBtn = document.getElementById('confirmation-modal-confirm-button');
    const cancelBtn = document.getElementById('confirmation-modal-cancel-button');
    if (!overlay || !titleEl || !messageEl || !confirmBtn || !cancelBtn) return;

    titleEl.textContent = getTranslation(titleKey);
    messageEl.textContent = getTranslation(messageKey);
    confirmBtn.textContent = getTranslation('confirmButton');
    cancelBtn.textContent = getTranslation('cancelButton');

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
export function applyReaderStyles(fontFamily, fontSize) {
    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.style.fontFamily = fontFamily;
        dom.currentWordDisplay.style.fontSize = `${fontSize}px`;
    }
}

/**
 * 테마와 다크 모드 선택을 문서 전역에 반영한다.
 */
export function applyTheme(theme, isDark) {
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
export function getTranslation(key, lang = appState.currentLanguage, params = null) {
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
export function setLanguage(lang, isInitializing = false) {
    appState.currentLanguage = lang;
    if (dom.languageSelector) dom.languageSelector.value = lang;
    document.documentElement.lang = lang;

    // 모든 번역 가능한 요소 업데이트
    document.querySelectorAll("[data-lang-key]").forEach(el => {
        const text = getTranslation(el.dataset.langKey, lang);
        if (text && text !== el.dataset.langKey) {
            el.innerHTML = text;
        }
    });

    document.querySelectorAll('[data-lang-attr]').forEach(el => {
        const attrList = el.dataset.langAttr?.split(',').map(attr => attr.trim()).filter(Boolean) || [];
        if (!attrList.length) return;
        const translationKey = el.dataset.langAttrKey || el.dataset.langKey;
        if (!translationKey) return;
        const translated = getTranslation(translationKey, lang);
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
        const supportingText = getTranslation(supportingKey, lang);
        if (supportingText && supportingText !== supportingKey) {
            el.setAttribute('supporting-text', supportingText);
        }
    });

    const placeholder = getTranslation('textInputPlaceholder', lang);
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

    // 저장은 호출측에서 처리한다 (초기 설정 로드시 중복 저장 방지)
    if (!isInitializing) {
        // no-op placeholder (호출측에서 필요시 후속 처리)
    }
}

/**
 * 사용자 피드백 표시용 임시 토스트 메시지를 출력한다.
 */
export function showMessage(messageKey, type = "info", duration = 2000) {
    const messageBox = document.getElementById("custom-message-box");
    if (!messageBox) return;

    const messageText = messageBox.querySelector('span');
    if (messageText) {
        messageText.textContent = getTranslation(messageKey);
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
export function updateButtonStates(buttonState) {
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
    dom.startButton.textContent = getTranslation(buttonState === 'paused' ? "resumeButton" : "startButton");
    dom.pauseButton.textContent = getTranslation("pauseButton");
    dom.resetButton.textContent = getTranslation("resetButton");
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
        if(dom.fontSizeLabel) dom.fontSizeLabel.textContent = getTranslation('fontSizeLabel', appState.currentLanguage, { size: newSize });
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
export function updateAuthUI() {
    const isLoggedIn = auth.isLoggedIn();
    if (dom.loginButton) dom.loginButton.classList.toggle('hidden', isLoggedIn);
    if (dom.logoutButton) dom.logoutButton.classList.toggle('hidden', !isLoggedIn);
    if (dom.newDocumentButton) dom.newDocumentButton.classList.toggle('hidden', !isLoggedIn);
}

/**
 * 로그인/회원가입 모드를 전환하며 인증 모달을 연다.
 */
export function showAuthModal(isSignup = false) {
    if (dom.authModal) {
        dom.authModal.classList.remove('hidden');
        if (dom.authModalTitle) {
            dom.authModalTitle.textContent = getTranslation(isSignup ? 'signupTitle' : 'loginTitle');
        }
        if (dom.authSubmitButton) {
            dom.authSubmitButton.textContent = getTranslation(isSignup ? 'signupButton' : 'loginButton');
        }
        if (dom.authSwitchButton) {
            dom.authSwitchButton.textContent = getTranslation(isSignup ? 'switchToLogin' : 'switchToSignup');
        }
    }
}

/**
 * 인증 모달을 닫고 입력 값을 초기화한다.
 */
export function hideAuthModal() {
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
            const isCurrentlySignup = dom.authModalTitle?.textContent === getTranslation('signupTitle');
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
            const isSignup = dom.authModalTitle?.textContent === getTranslation('signupTitle');
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
                    ? await auth.signup(email, password, captchaToken)
                    : await auth.login(email, password, captchaToken);

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
export function attachEventListeners() {
    initializeDOMElements();
    setupReaderControls();
    setupGeneralEventListeners();
    setupAuthEventListeners();
    setupSidebarEventListeners();
    setupDocumentEventListeners();
}
