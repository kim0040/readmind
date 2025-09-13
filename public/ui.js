// ui.js - UI logic, DOM manipulation, and event listeners.

import * as auth from './auth.js';
import { appState, readerState, documentState, LS_KEYS, APP_VERSION, CONTACT_EMAIL } from "./state.js";
import { scheduleSave, handleSuccessfulLogin, handleLogout } from "./main.js";
import { formatWordWithFixation, pauseReading, startReadingFlow } from "./reader.js";
import { handleTextChange, updateTextStats } from "./text_handler.js";

export const dom = {
    mainCard: document.querySelector(".main-card"),
    textInput: document.getElementById("text-input"),
    wpmInput: document.getElementById("wpm-input"),
    startButton: document.getElementById("start-button"),
    pauseButton: document.getElementById("pause-button"),
    resetButton: document.getElementById("reset-button"),
    currentWordDisplay: document.getElementById("current-word"),
    progressInfoDisplay: document.getElementById("progress-info"),
    darkModeToggle: document.getElementById("dark-mode-toggle"),
    themeToggleDarkIcon: document.getElementById("theme-toggle-dark-icon"),
    themeToggleLightIcon: document.getElementById("theme-toggle-light-icon"),
    fixationToggle: document.getElementById("fixation-toggle"),
    languageSelector: document.getElementById("language-selector"),
    chunkSizeSelector: document.getElementById("chunk-size-selector"),
    readingModeSelector: document.getElementById("reading-mode-selector"),
    fullscreenButton: document.getElementById("fullscreen-button"),
    authModalOverlay: document.getElementById("auth-modal-overlay"),
    authModal: document.getElementById("auth-modal"),
    closeAuthModalButton: document.getElementById("close-auth-modal"),
    authModalTitle: document.getElementById("auth-modal-title"),
    authForm: document.getElementById("auth-form"),
    authSubmitButton: document.getElementById("auth-submit-button"),
    authSwitchButton: document.getElementById("auth-switch-button"),
    authSwitchText: document.getElementById("auth-switch-text"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),
    documentSidebar: document.getElementById("document-sidebar"),
    newDocumentButton: document.getElementById("new-document-button"),
    documentList: document.getElementById("document-list"),
    loginButton: document.getElementById("login-button"),
    logoutButton: document.getElementById("logout-button"),
    authStatus: document.getElementById("auth-status"),
    hamburgerMenuButton: document.getElementById("hamburger-menu-button"),
    closeSidebarButton: document.getElementById("close-sidebar-button"),
    sidebarOverlay: document.getElementById("sidebar-overlay"),
    confirmationModalOverlay: document.getElementById("confirmation-modal-overlay"),
    confirmationModalTitle: document.getElementById("confirmation-modal-title"),
    confirmationModalMessage: document.getElementById("confirmation-modal-message"),
    confirmationModalConfirmButton: document.getElementById("confirmation-modal-confirm-button"),
    confirmationModalCancelButton: document.getElementById("confirmation-modal-cancel-button"),
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
    setLanguage(appState.currentLanguage, true);
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

function closeConfirmationModal() {
    if (!dom.confirmationModalOverlay) return;
    dom.confirmationModalOverlay.classList.add('hidden');
}

export function showConfirmationModal(titleKey, messageKey, onConfirm) {
    if (!dom.confirmationModalOverlay) return;

    dom.confirmationModalTitle.textContent = getTranslation(titleKey);
    dom.confirmationModalMessage.textContent = getTranslation(messageKey);
    dom.confirmationModalConfirmButton.textContent = getTranslation('confirmButton');
    dom.confirmationModalCancelButton.textContent = getTranslation('cancelButton');

    dom.confirmationModalOverlay.classList.remove('hidden');

    // Use a variable to ensure cleanup happens only once
    let isHandled = false;

    const confirmHandler = () => {
        if (isHandled) return;
        isHandled = true;
        onConfirm();
        closeConfirmationModal();
        cleanup();
    };

    const cancelHandler = () => {
        if (isHandled) return;
        isHandled = true;
        closeConfirmationModal();
        cleanup();
    };

    const overlayClickHandler = (e) => {
        if (e.target === dom.confirmationModalOverlay) {
            cancelHandler();
        }
    };

    const cleanup = () => {
        dom.confirmationModalConfirmButton.removeEventListener('click', confirmHandler);
        dom.confirmationModalCancelButton.removeEventListener('click', cancelHandler);
        dom.confirmationModalOverlay.removeEventListener('click', overlayClickHandler);
    };

    dom.confirmationModalConfirmButton.addEventListener('click', confirmHandler);
    dom.confirmationModalCancelButton.addEventListener('click', cancelHandler);
    dom.confirmationModalOverlay.addEventListener('click', overlayClickHandler);
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

export function getTranslation(key, lang = appState.currentLanguage, params = null) {
    const langToUse = translations[lang] || translations["en"];
    let text = langToUse?.[key] || key;
    if (params) {
        for (const pKey in params) {
            text = text.replace(new RegExp(`{${pKey}}`, "g"), params[pKey]);
        }
    }
    return text;
}

export function applyTheme(isDark) {
    document.documentElement.classList.toggle("dark", isDark);
    dom.themeToggleDarkIcon?.classList.toggle("hidden", !isDark);
    dom.themeToggleLightIcon?.classList.toggle("hidden", isDark);
}

export function setLanguage(lang, isInitializing = false) {
    appState.currentLanguage = lang;
    if (dom.languageSelector) dom.languageSelector.value = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang-key]").forEach((el) => {
        el.innerHTML = getTranslation(el.dataset.langKey);
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
    messageText.textContent = getTranslation(messageKey);
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
    switch (buttonState) {
        case "initial": dom.startButton.disabled = false; break;
        case "reading": dom.pauseButton.disabled = false; dom.resetButton.disabled = false; break;
        case "paused": dom.startButton.disabled = false; dom.resetButton.disabled = false; dom.startButton.textContent = getTranslation("resumeButton"); break;
        case "completed": dom.resetButton.disabled = false; break;
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
        readerState.currentWpm = parseInt(dom.wpmInput.value, 10);
        updateTextStats();
        scheduleSave();
        if (readerState.intervalId) {
            clearInterval(readerState.intervalId);
            readerState.intervalId = setInterval(displayNextWord, 60000 / readerState.currentWpm);
        }
    });
    dom.fixationToggle?.addEventListener("change", () => {
        readerState.isFixationPointEnabled = dom.fixationToggle.checked;
        scheduleSave();
    });
}

function setupActionButtons() {
    dom.startButton?.addEventListener("click", () => startReadingFlow(readerState.isPaused));
    dom.pauseButton?.addEventListener("click", pauseReading);
    dom.resetButton?.addEventListener("click", () => handleTextChange(dom.textInput.value));
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
        if (!captchaToken) return showMessage('msgCaptchaRequired', 'error');
        dom.authSubmitButton.disabled = true;
        dom.authSubmitButton.textContent = getTranslation('loading');
        try {
            const response = await (isLogin ? auth.login(email, password, captchaToken) : auth.signup(email, password, captchaToken));
            grecaptcha.reset();
            if (response.token) {
                showMessage(isLogin ? "msgLoginSuccess" : "msgSignupSuccess", "success");
                handleSuccessfulLogin();
                closeAuthModal();
            } else {
                // This else block might not be necessary if server always returns error status for failures.
                // However, as a fallback, we can handle it.
                throw new Error('Unknown authentication error');
            }
        } catch (error) {
            grecaptcha.reset();
            const errorCode = error.response?.data?.error_code || 'UNKNOWN';
            showMessage(`error_${errorCode}`, 'error');
        } finally {
            dom.authSubmitButton.disabled = false;
        }
    });
}

function setupGeneralEventListeners() {
    dom.fullscreenButton?.addEventListener('click', toggleFullscreen);
    dom.darkModeToggle?.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        appState.userHasManuallySetTheme = true;
        applyTheme(isDark);
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
        dom.documentSidebar.classList.remove('-translate-x-full');
        dom.sidebarOverlay.classList.remove('hidden');
    };

    const closeSidebar = () => {
        dom.documentSidebar.classList.add('-translate-x-full');
        dom.sidebarOverlay.classList.add('hidden');
    };

    dom.hamburgerMenuButton.addEventListener('click', openSidebar);
    dom.closeSidebarButton.addEventListener('click', closeSidebar);
    dom.sidebarOverlay.addEventListener('click', closeSidebar);
}

export function attachEventListeners() {
    setupReaderControls();
    setupActionButtons();
    setupAuthEventListeners();
    setupGeneralEventListeners();
    setupSidebarEventListeners();
}
