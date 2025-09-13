// ui.js - UI logic, DOM manipulation, and event listeners.

import * as auth from './auth.js';
import { appState, readerState, documentState } from "./state.js";
import { handleSuccessfulLogin, handleLogout, scheduleSave } from "./main.js";
import { pauseReading, startReadingFlow, updateReadingSpeed } from "./reader.js";
import { updateTextStats, handleTextChange } from "./text_handler.js";

export const dom = {
    // Main containers
    mainCard: document.querySelector(".main-card"),
    documentSidebar: document.getElementById("document-sidebar"),
    sidebarOverlay: document.getElementById("sidebar-overlay"),

    // Text and Reader elements
    textInput: document.getElementById("text-input"),
    currentWordDisplay: document.getElementById("current-word"),
    progressInfoDisplay: document.getElementById("progress-info"),
    progressBarFill: document.getElementById("progress-bar-fill"),

    // Buttons
    startButton: document.getElementById("start-button"),
    pauseButton: document.getElementById("pause-button"),
    resetButton: document.getElementById("reset-button"),
    fullscreenButton: document.getElementById("fullscreen-button"),
    newDocumentButton: document.getElementById("new-document-button"),
    loginButton: document.getElementById("login-button"),
    logoutButton: document.getElementById("logout-button"),
    hamburgerMenuButton: document.getElementById("hamburger-menu-button"),
    closeSidebarButton: document.getElementById("close-sidebar-button"),
    authSwitchButton: document.getElementById("auth-switch-button"),
    authSubmitButton: document.getElementById("auth-submit-button"),

    // Controls and Selectors
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

    // Auth Modal
    authModalOverlay: document.getElementById("auth-modal-overlay"),
    authModal: document.getElementById("auth-modal"),
    closeAuthModalButton: document.getElementById("close-auth-modal"),
    authModalTitle: document.getElementById("auth-modal-title"),
    authForm: document.getElementById("auth-form"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),
    authSwitchText: document.getElementById("auth-switch-text"),

    // Document List
    documentList: document.getElementById("document-list"),
    authStatus: document.getElementById("auth-status"),

    // Detailed Stats
    readabilityScore: document.getElementById("readability-score"),
    avgSentenceLength: document.getElementById("avg-sentence-length"),
    syllableCount: document.getElementById("syllable-count"),
    lexicalDiversity: document.getElementById("lexical-diversity"),
};

function openAuthModal(isLogin = true) {
    if (!dom.authModalOverlay) return;
    dom.authModal.dataset.mode = isLogin ? 'login' : 'signup';
    dom.authForm.reset();
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

    if (isLogin) {
        dom.authModalTitle.dataset.langKey = "loginTitle";
        dom.authSubmitButton.dataset.langKey = "loginButton";
        dom.authSwitchText.dataset.langKey = "signupPrompt";
        dom.authSwitchButton.dataset.langKey = "signupLink";
    } else {
        dom.authModalTitle.dataset.langKey = "signupTitle";
        dom.authSubmitButton.dataset.langKey = "signupButton";
        dom.authSwitchText.dataset.langKey = "loginPrompt";
        dom.authSwitchButton.dataset.langKey = "loginLink";
    }
    setLanguage(appState.currentLanguage, true); // Re-apply translations for the modal
    dom.authModalOverlay.classList.remove('hidden');
    dom.authModalOverlay.style.display = 'flex';
    setTimeout(() => { dom.authModalOverlay.classList.add('show'); }, 10);
}

function closeAuthModal() {
    if (!dom.authModalOverlay) return;
    dom.authModalOverlay.classList.remove('show');
    setTimeout(() => {
        dom.authModalOverlay.classList.add('hidden');
        dom.authModalOverlay.style.display = 'none';
    }, 300);
}

export function showConfirmationModal(titleKey, messageKey, onConfirm) {
    const overlay = document.getElementById('confirmation-modal-overlay');
    const titleEl = document.getElementById('confirmation-modal-title');
    const messageEl = document.getElementById('confirmation-modal-message');
    const confirmBtn = document.getElementById('confirmation-modal-confirm-button');
    const cancelBtn = document.getElementById('confirmation-modal-cancel-button');

    if (!overlay || !titleEl || !messageEl || !confirmBtn || !cancelBtn) {
        console.error('Confirmation modal elements not found');
        return;
    }

    titleEl.textContent = getTranslation(titleKey);
    messageEl.textContent = getTranslation(messageKey);
    confirmBtn.textContent = getTranslation('confirmButton');
    cancelBtn.textContent = getTranslation('cancelButton');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    const close = () => {
        overlay.classList.add('hidden');
    };

    newConfirmBtn.onclick = () => {
        onConfirm();
        close();
    };
    newCancelBtn.onclick = close;
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            close();
        }
    };

    overlay.classList.remove('hidden');
}

export function applyReaderStyles(fontFamily, fontSize) {
    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.style.fontFamily = fontFamily;
        dom.currentWordDisplay.style.fontSize = `${fontSize}px`;
    }
}

export function updateAuthUI() {
    const isLoggedIn = auth.isLoggedIn();
    dom.loginButton?.classList.toggle('hidden', isLoggedIn);
    dom.logoutButton?.classList.toggle('hidden', !isLoggedIn);
    dom.authStatus?.classList.toggle('hidden', !isLoggedIn);
    if(dom.newDocumentButton) dom.newDocumentButton.disabled = !isLoggedIn;
    if (isLoggedIn) {
        const user = auth.getCurrentUser();
        if (dom.authStatus) dom.authStatus.textContent = user.email;
    }
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getTranslation(key, lang = appState.currentLanguage, params = null) {
    const langToUse = translations[lang] || translations["en"];
    let text = langToUse?.[key] || key;
    if (params && typeof text === 'string') {
        for (const pKey in params) {
            const placeholder = `{${pKey}}`;
            text = text.replaceAll(placeholder, params[pKey]);
        }
    }
    return text;
}

export function applyTheme(theme, isDark) {
    if (theme) {
        document.body.dataset.theme = theme;
    }
    document.documentElement.classList.toggle("dark", isDark);

    if (dom.themeToggleDarkIcon) {
        dom.themeToggleDarkIcon.style.display = isDark ? 'inline-flex' : 'none';
    }
    if (dom.themeToggleLightIcon) {
        dom.themeToggleLightIcon.style.display = isDark ? 'none' : 'inline-flex';
    }
}

export function setLanguage(lang, isInitializing = false) {
    appState.currentLanguage = lang;
    if (dom.languageSelector) dom.languageSelector.value = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang-key]").forEach((el) => {
        const key = el.dataset.langKey;
        const translation = getTranslation(key);
        if (el.tagName === 'MD-SLIDER' && key === 'wpm-cpm-label') {
             el.label = translation;
        } else {
             el.innerHTML = translation;
        }
    });
    if (!isInitializing) {
        updateTextStats();
        updateButtonStates(readerState.isPaused ? "paused" : readerState.intervalId ? "reading" : "initial");
    }
}

export function showMessage(messageKey, type = "info", duration = 3000) {
    const messageText = document.getElementById("message-text");
    const messageBox = document.getElementById("custom-message-box");
    if (!messageBox || !messageText) return;
    const translatedMessage = getTranslation(messageKey) || messageKey;
    messageText.textContent = translatedMessage;
    messageBox.className = `message-box ${type}`;
    messageBox.classList.add("show");
    setTimeout(() => { messageBox.classList.remove("show"); }, duration);
}

export function updateButtonStates(buttonState) {
    if (!dom.startButton || !dom.pauseButton || !dom.resetButton) return;
    dom.startButton.textContent = getTranslation("startButton");
    dom.pauseButton.textContent = getTranslation("pauseButton");
    dom.resetButton.textContent = getTranslation("resetButton");
    dom.startButton.disabled = true;
    dom.pauseButton.disabled = true;
    dom.resetButton.disabled = true;

    const hasText = dom.textInput && dom.textInput.value.trim().length > 0;

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
            dom.startButton.textContent = getTranslation("resumeButton");
            break;
        case "completed":
            dom.resetButton.disabled = false;
            break;
        case "empty":
            break;
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        dom.mainCard?.requestFullscreen().catch(err => {
            alert(`Error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function setupReaderControls() {
    dom.readingModeSelector?.addEventListener('change', (e) => {
        readerState.readingMode = e.target.value;
        scheduleSave();
    });
    dom.chunkSizeSelector?.addEventListener('change', async (e) => {
        readerState.chunkSize = parseInt(e.target.value, 10);
        if (dom.textInput.value) await handleTextChange(dom.textInput.value);
        scheduleSave();
    });
    dom.wpmInput?.addEventListener("input", () => {
        const newWpm = parseInt(dom.wpmInput.value, 10);
        readerState.currentWpm = newWpm;
        updateTextStats();
        scheduleSave();
        updateReadingSpeed(newWpm);
    });
    dom.fixationToggle?.addEventListener("change", () => {
        readerState.isFixationPointEnabled = dom.fixationToggle.checked;
        scheduleSave();
    });
    dom.fontFamilySelector?.addEventListener('change', (e) => {
        appState.fontFamily = e.target.value;
        applyReaderStyles(appState.fontFamily, appState.fontSize);
        scheduleSave();
    });
    dom.fontSizeSlider?.addEventListener('input', (e) => {
        const newSize = e.target.value;
        appState.fontSize = newSize;
        if(dom.fontSizeLabel) {
            dom.fontSizeLabel.textContent = getTranslation('fontSizeLabel', appState.currentLanguage, { size: newSize });
        }
        applyReaderStyles(appState.fontFamily, appState.fontSize);
        scheduleSave();
    });
}

function setupActionButtons() {
    dom.startButton?.addEventListener("click", () => startReadingFlow(readerState.isPaused));
    dom.pauseButton?.addEventListener("click", pauseReading);
    dom.resetButton?.addEventListener("click", () => {
        if (documentState.simplemde) {
            handleTextChange(documentState.simplemde.value());
        } else {
            handleTextChange(dom.textInput.value);
        }
    });
}

function setupAuthEventListeners() {
    dom.loginButton?.addEventListener("click", () => openAuthModal(true));
    dom.logoutButton?.addEventListener("click", handleLogout);
    dom.closeAuthModalButton?.addEventListener("click", closeAuthModal);
    dom.authModalOverlay?.addEventListener("click", (e) => {
        if (e.target === dom.authModalOverlay) closeAuthModal();
    });
    dom.authSwitchButton?.addEventListener("click", () => {
        openAuthModal(dom.authModal.dataset.mode !== 'signup');
    });
    dom.authForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = dom.emailInput.value;
        const password = dom.passwordInput.value;
        const isLogin = dom.authModal.dataset.mode === 'login';
        const captchaToken = grecaptcha.getResponse();

        if (!captchaToken) {
            showMessage('msgCaptchaRequired', 'error');
            return;
        }

        dom.authSubmitButton.disabled = true;
        const originalButtonText = dom.authSubmitButton.textContent;
        dom.authSubmitButton.textContent = getTranslation('loading');

        try {
            const response = await (isLogin ? auth.login(email, password, captchaToken) : auth.signup(email, password, captchaToken));

            if (response.token) {
                showMessage(isLogin ? "msgLoginSuccess" : "msgSignupSuccess", "success");
                handleSuccessfulLogin();
                closeAuthModal();
            } else {
                const errorCode = response.error_code;
                const messageKey = errorCode ? `error_${errorCode}` : (response.message || 'msgAuthError');
                throw new Error(messageKey);
            }
        } catch (error) {
            showMessage(error.message, "error");
        } finally {
            grecaptcha.reset();
            dom.authSubmitButton.disabled = false;
            dom.authSubmitButton.textContent = originalButtonText;
            setLanguage(appState.currentLanguage, true);
        }
    });
}

function setupGeneralEventListeners() {
    dom.fullscreenButton?.addEventListener('click', toggleFullscreen);
    dom.darkModeToggle?.addEventListener("click", () => {
        const isDark = !document.documentElement.classList.contains('dark');
        const currentTheme = dom.themeSelector?.value || 'blue';
        appState.userHasManuallySetTheme = true;
        applyTheme(currentTheme, isDark);
        scheduleSave();
    });
    dom.themeSelector?.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(newTheme, isDark);
        scheduleSave();
    });
    dom.languageSelector?.addEventListener("change", (event) => {
        setLanguage(event.target.value);
        scheduleSave();
    });
}

function setupSidebarEventListeners() {
    if (!dom.hamburgerMenuButton) return;
    const openSidebar = () => {
        dom.documentSidebar?.classList.remove('-translate-x-full');
        dom.sidebarOverlay?.classList.remove('hidden');
    };
    const closeSidebar = () => {
        dom.documentSidebar?.classList.add('-translate-x-full');
        dom.sidebarOverlay?.classList.add('hidden');
    };
    dom.hamburgerMenuButton.addEventListener('click', openSidebar);
    dom.closeSidebarButton?.addEventListener('click', closeSidebar);
    dom.sidebarOverlay?.addEventListener('click', closeSidebar);
}

export function attachEventListeners() {
    setupReaderControls();
    setupActionButtons();
    setupAuthEventListeners();
    setupGeneralEventListeners();
    setupSidebarEventListeners();
}
