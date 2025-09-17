// ui.js - UI logic, DOM manipulation, and event listeners.

import * as auth from './auth.js';
import { appState, readerState, documentState } from "./state.js";
import { handleSuccessfulLogin, handleLogout } from "./main.js";
import { scheduleSave } from "./save_manager.js";
import { pauseReading, startReadingFlow, updateReadingSpeed, updateProgressBar } from "./reader.js";
import { updateTextStats, handleTextChange } from "./text_handler.js";

export const dom = {
    mainCard: document.querySelector(".main-card"),
    documentSidebar: document.getElementById("document-sidebar"),
    sidebarOverlay: document.getElementById("sidebar-overlay"),
    textInput: document.getElementById("text-input"),
    currentWordDisplay: document.getElementById("current-word"),
    progressInfoDisplay: document.getElementById("progress-info"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    startButton: document.getElementById("start-button"),
    pauseButton: document.getElementById("pause-button"),
    resetButton: document.getElementById("reset-button"),
    fullscreenButton: document.getElementById("fullscreen-button"),
    newDocumentButton: document.getElementById("new-document-button"),
    clearTextButton: document.getElementById("clear-text-button"),
    loginButton: document.getElementById("login-button"),
    logoutButton: document.getElementById("logout-button"),
    hamburgerMenuButton: document.getElementById("hamburger-menu-button"),
    closeSidebarButton: document.getElementById("close-sidebar-button"),
    wpmInput: document.getElementById("wpm-input"),
    darkModeToggle: document.getElementById("dark-mode-toggle"),
    themeToggleDarkIcon: document.getElementById("theme-toggle-dark-icon"),
    themeToggleLightIcon: document.getElementById("theme-toggle-light-icon"),
    themeSelector: document.getElementById("theme-selector"),
    fixationToggle: document.getElementById("fixation-toggle"),
    languageSelector: document.getElementById("language-selector"),
    chunkSizeSelector: document.getElementById("chunk-size-selector"),
    readingModeSelector: document.getElementById("reading-mode-selector"),
    fontFamilySelector: document.getElementById("font-family-selector"),
    fontSizeSlider: document.getElementById("font-size-slider"),
    fontSizeLabel: document.getElementById("font-size-label"),
    wordCountDisplay: null,
    charCountDisplay: null,
    readingTimeDisplay: null,
    readabilityScore: document.getElementById("readability-score"),
    avgSentenceLength: document.getElementById("avg-sentence-length"),
    syllableCount: document.getElementById("syllable-count"),
    lexicalDiversity: document.getElementById("lexical-diversity"),
    documentList: document.getElementById("document-list"),
    authModal: document.getElementById("auth-modal"),
    authForm: document.getElementById("auth-form"),
    emailInput: document.getElementById("email-input"),
    passwordInput: document.getElementById("password-input"),
    authSubmitButton: document.getElementById("auth-submit-button"),
    authCancelButton: document.getElementById("auth-cancel-button"),
    authSwitchButton: document.getElementById("auth-switch-button"),
    authModalTitle: document.getElementById("auth-modal-title"),
};

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

export function applyReaderStyles(fontFamily, fontSize) {
    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.style.fontFamily = fontFamily;
        dom.currentWordDisplay.style.fontSize = `${fontSize}px`;
    }
}

export function applyTheme(theme, isDark) {
    // 테마 설정 (전역 데이터 속성)
    if (theme) {
        document.body.setAttribute('data-theme', theme);
        if (dom.themeSelector && dom.themeSelector.value !== theme) {
            dom.themeSelector.value = theme;
        }
    }
    // 다크모드 설정 (html 클래스)
    document.documentElement.classList.toggle('dark', !!isDark);
    // 아이콘 업데이트
    if (dom.themeToggleDarkIcon) dom.themeToggleDarkIcon.style.display = isDark ? 'inline-flex' : 'none';
    if (dom.themeToggleLightIcon) dom.themeToggleLightIcon.style.display = isDark ? 'none' : 'inline-flex';
}

export function getTranslation(key, lang = appState.currentLanguage, params = null) {
    const langToUse = translations[lang] || translations["en"];
    let text = langToUse?.[key] || key;
    if (params && typeof text === 'string') {
        for (const pKey in params) {
            text = text.replaceAll(`{${pKey}}`, params[pKey]);
        }
    }
    return text;
}

export function setLanguage(lang, isInitializing = false) {
    console.log('setLanguage called with:', lang, 'initializing:', isInitializing);
    
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
    
    // 버튼 상태 업데이트
    updateButtonStates(readerState.isPaused ? "paused" : "initial");
    
    // 초기화가 아닐 때만 통계 업데이트 (순환 호출 방지)
    if (!isInitializing) {
        // scheduleSave() 호출 제거
    }
    
    console.log('Language changed to:', lang);
}

export function showMessage(messageKey, type = "info", duration = 2000) {
    const messageBox = document.getElementById("custom-message-box");
    if (!messageBox) return;
    messageBox.querySelector('span').textContent = getTranslation(messageKey);
    messageBox.className = `message-box fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-md shadow-lg z-[1000] ${type}`;
    messageBox.classList.add("show");
    setTimeout(() => messageBox.classList.remove("show"), duration);
}

export function updateButtonStates(buttonState) {
    const hasText = dom.textInput && dom.textInput.value.trim().length > 0;
    dom.startButton.disabled = true;
    dom.pauseButton.disabled = true;
    dom.resetButton.disabled = true;

    switch (buttonState) {
        case "initial":
            if (hasText) dom.startButton.disabled = false;
            break;
        case "reading":
            dom.pauseButton.disabled = false;
            dom.resetButton.disabled = false;
            break;
        case "paused":
            if (hasText) dom.startButton.disabled = false;
            dom.resetButton.disabled = false;
            break;
        case "completed":
            dom.resetButton.disabled = false;
            break;
    }
    dom.startButton.textContent = getTranslation(buttonState === 'paused' ? "resumeButton" : "startButton");
    dom.pauseButton.textContent = getTranslation("pauseButton");
    dom.resetButton.textContent = getTranslation("resetButton");
}

function setupReaderControls() {
    // 시작 버튼
    dom.startButton?.addEventListener("click", () => {
        const isResuming = readerState.isPaused && readerState.currentIndex > 0;
        startReadingFlow(isResuming);
    });
    
    // 일시정지 버튼
    dom.pauseButton?.addEventListener("click", () => {
        pauseReading();
    });
    
    // 리셋 버튼
    dom.resetButton?.addEventListener("click", () => {
        if (dom.currentWordDisplay) {
            dom.currentWordDisplay.innerHTML = '';
        }
        readerState.currentIndex = 0;
        updateProgressBar();
        updateButtonStates();
    });
    
    dom.wpmInput?.addEventListener("input", () => {
        const newWpm = parseInt(dom.wpmInput.value, 10);
        readerState.currentWpm = newWpm;
        // 통계 및 세분화 즉시 갱신
        updateTextStats();
        scheduleSave();
        updateReadingSpeed(newWpm);
    });
    dom.fontFamilySelector?.addEventListener('change', (e) => {
        appState.fontFamily = e.target.value;
        applyReaderStyles(appState.fontFamily, appState.fontSize);
        scheduleSave();
    });
    dom.fontSizeSlider?.addEventListener('input', (e) => {
        const newSize = e.target.value;
        appState.fontSize = newSize;
        if(dom.fontSizeLabel) dom.fontSizeLabel.textContent = getTranslation('fontSizeLabel', appState.currentLanguage, { size: newSize });
        applyReaderStyles(appState.fontFamily, appState.fontSize);
        scheduleSave();
    });
    dom.chunkSizeSelector?.addEventListener('change', async (e) => {
        readerState.chunkSize = parseInt(e.target.value, 10);
        if (dom.textInput.value) await handleTextChange(dom.textInput.value);
        scheduleSave();
    });
    dom.fixationToggle?.addEventListener("change", (e) => {
        // Material Web Component Switch는 selected 속성 사용
        const isEnabled = e.target.selected !== undefined ? e.target.selected : e.target.checked;
        readerState.isFixationPointEnabled = isEnabled;
        console.log('Fixation point toggled:', readerState.isFixationPointEnabled, 'Event target:', e.target);
        scheduleSave();
    });
    dom.readingModeSelector?.addEventListener('change', async (e) => {
        readerState.readingMode = e.target.value;
        // 읽기 모드 변경 시 텍스트 다시 처리
        if (dom.textInput.value) await handleTextChange(dom.textInput.value);
        scheduleSave();
    });
}

function setupGeneralEventListeners() {
    dom.languageSelector?.addEventListener("change", (event) => {
        const lang = event.target.value;
        console.log('Language changed to:', lang);
        setLanguage(lang);
        // 강제 표시 동기화
        setTimeout(() => {
            if (dom.languageSelector.value !== lang) {
                dom.languageSelector.value = lang;
                console.log('Language selector value forcibly synced to:', lang);
            }
        }, 100);
    });
    dom.themeSelector?.addEventListener('change', (e) => {
        const theme = e.target.value;
        console.log('Theme changed to:', theme);
        applyTheme(theme, document.documentElement.classList.contains('dark'));
        scheduleSave();
        // 강제 표시 동기화
        setTimeout(() => {
            if (dom.themeSelector.value !== theme) {
                dom.themeSelector.value = theme;
                console.log('Theme selector value forcibly synced to:', theme);
            }
        }, 100);
    });
    dom.darkModeToggle?.addEventListener("click", () => {
        const isDark = !document.documentElement.classList.contains('dark');
        console.log('Dark mode toggle clicked, isDark:', isDark);
        document.documentElement.classList.toggle('dark', isDark);
        applyTheme(dom.themeSelector?.value || 'blue', isDark);
        dom.darkModeToggle.setAttribute('aria-pressed', isDark.toString());
        scheduleSave();
    });
}

export function updateAuthUI() {
    const isLoggedIn = auth.isLoggedIn();
    if (dom.loginButton) dom.loginButton.classList.toggle('hidden', isLoggedIn);
    if (dom.logoutButton) dom.logoutButton.classList.toggle('hidden', !isLoggedIn);
    if (dom.newDocumentButton) dom.newDocumentButton.classList.toggle('hidden', !isLoggedIn);
}

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

export function hideAuthModal() {
    if (dom.authModal) {
        dom.authModal.classList.add('hidden');
        if (dom.authForm) {
            dom.authForm.reset();
        }
    }
}

function setupAuthEventListeners() {
    if (dom.loginButton) {
        dom.loginButton.addEventListener('click', () => showAuthModal(false));
    }
    
    if (dom.logoutButton) {
        dom.logoutButton.addEventListener('click', () => {
            handleLogout();
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
            const captchaToken = grecaptcha?.getResponse();
            
            if (!email || !password) {
                showMessage('msgEmailPasswordRequired', 'error');
                return;
            }
            
            // 비밀번호 정책 검사 (회원가입 시에만)
            const isSignup = dom.authModalTitle?.textContent === getTranslation('signupTitle');
            if (isSignup) {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
                if (!passwordRegex.test(password)) {
                    showMessage('error_WEAK_PASSWORD', 'error');
                    return;
                }
            }
            
            if (!captchaToken) {
                showMessage('msgCaptchaRequired', 'error');
                return;
            }
            
            try {
                let response;
                if (isSignup) {
                    response = await auth.signup(email, password, captchaToken);
                } else {
                    response = await auth.login(email, password, captchaToken);
                }
                
                if (response.token) {
                    hideAuthModal();
                    await handleSuccessfulLogin();
                    showMessage(isSignup ? 'msgSignupSuccess' : 'msgLoginSuccess', 'success');
                } else {
                    showMessage(response.error_code || 'msgAuthError', 'error');
                }
            } catch (error) {
                console.error('Auth error:', error);
                showMessage('msgAuthError', 'error');
            }
        });
    }
}

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

function setupDocumentEventListeners() {
    if (dom.newDocumentButton) {
        dom.newDocumentButton.addEventListener('click', () => {
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

function initializeDOMElements() {
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
    
    console.log('DOM elements initialized:', {
        wordCount: !!dom.wordCountDisplay,
        charCount: !!dom.charCountDisplay,
        readingTime: !!dom.readingTimeDisplay,
        darkModeToggle: !!dom.darkModeToggle,
        themeSelector: !!dom.themeSelector,
        languageSelector: !!dom.languageSelector
    });
}

export function attachEventListeners() {
    initializeDOMElements();
    setupReaderControls();
    setupGeneralEventListeners();
    setupAuthEventListeners();
    setupSidebarEventListeners();
    setupDocumentEventListeners();
}
