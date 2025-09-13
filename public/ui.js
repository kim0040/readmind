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
    fixationToggle: document.getElementById("fixation-toggle"),
    languageSelector: document.getElementById("language-selector"),
    chunkSizeSelector: document.getElementById("chunk-size-selector"),
    readingModeSelector: document.getElementById("reading-mode-selector"),
    fullscreenButton: document.getElementById("fullscreen-button"),

    // Dialogs
    authDialog: document.getElementById("auth-dialog"),
    confirmationDialog: document.getElementById("confirmation-dialog"),

    // Auth Dialog specific
    authModalTitle: document.getElementById("auth-modal-title"),
    authForm: document.getElementById("auth-dialog-form"),
    authSubmitButton: document.getElementById("auth-submit-button"),
    authSwitchButton: document.getElementById("auth-switch-button"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),

    // Confirmation Dialog specific
    confirmationModalTitle: document.getElementById("confirmation-modal-title"),
    confirmationModalMessage: document.getElementById("confirmation-modal-message"),
    confirmationModalConfirmButton: document.getElementById("confirmation-modal-confirm-button"),
    confirmationModalCancelButton: document.getElementById("confirmation-modal-cancel-button"),
    themeSelector: document.getElementById("theme-selector"),
    welcomeDialog: document.getElementById("welcome-dialog"),
    fontFamilySelector: document.getElementById("font-family-selector"),
    fontSizeSlider: document.getElementById("font-size-slider"),
    fontSizeLabel: document.getElementById("font-size-label"),

    // Sidebar
    documentSidebar: document.getElementById("document-sidebar"),
    newDocumentButton: document.getElementById("new-document-button"),
    documentList: document.getElementById("document-list"),
    loginButton: document.getElementById("login-button"),
    logoutButton: document.getElementById("logout-button"),
    authStatus: document.getElementById("auth-status"),
    hamburgerMenuButton: document.getElementById("hamburger-menu-button"),
    closeSidebarButton: document.getElementById("close-sidebar-button"),
    sidebarOverlay: document.getElementById("sidebar-overlay"),
};

function openAuthModal(isLogin = true) {
    if (!dom.authDialog) return;

    dom.authDialog.dataset.mode = isLogin ? 'login' : 'signup';
    if (dom.authForm) dom.authForm.reset();
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

    const titleKey = isLogin ? "loginTitle" : "signupTitle";
    const submitKey = isLogin ? "loginButton" : "signupButton";
    const switchKey = isLogin ? "signupLink" : "loginLink";

    dom.authModalTitle.textContent = getTranslation(titleKey);
    dom.authSubmitButton.innerHTML = getTranslation(submitKey);
    dom.authSwitchButton.innerHTML = getTranslation(switchKey);

    dom.authDialog.show();
}

function closeAuthModal() {
    if (!dom.authDialog) return;
    dom.authDialog.close();
}

export function showConfirmationModal(titleKey, messageKey, onConfirm) {
    if (!dom.confirmationDialog) return;

    dom.confirmationModalTitle.textContent = getTranslation(titleKey);
    dom.confirmationModalMessage.textContent = getTranslation(messageKey);
    dom.confirmationModalConfirmButton.textContent = getTranslation('confirmButton');
    dom.confirmationModalCancelButton.textContent = getTranslation('cancelButton');

    dom.confirmationDialog.show();

    const closeHandler = (event) => {
        if (event.detail.action === 'confirm') {
            onConfirm();
        }
        dom.confirmationDialog.removeEventListener('close', closeHandler);
    };

    dom.confirmationDialog.addEventListener('close', closeHandler);
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

export function applyTheme(theme, isDark) {
    document.body.dataset.theme = theme || 'blue';
    const darkIcon = dom.darkModeToggle?.querySelector('md-icon[id="theme-toggle-dark-icon"]');
    const lightIcon = dom.darkModeToggle?.querySelector('md-icon[id="theme-toggle-light-icon"]');
    document.documentElement.classList.toggle("dark", isDark);
    if (darkIcon && lightIcon) {
        darkIcon.style.display = isDark ? 'block' : 'none';
        lightIcon.style.display = isDark ? 'none' : 'block';
    }
}

export function setLanguage(lang, isInitializing = false) {
    appState.currentLanguage = lang;
    if (dom.languageSelector) dom.languageSelector.value = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang-key]").forEach((el) => {
        const key = el.dataset.langKey;
        const translation = getTranslation(key);
        if (el.tagName.toLowerCase().startsWith('md-') && el.hasAttribute('label')) {
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
    messageText.textContent = getTranslation(messageKey);
    messageBox.className = `message-box ${type}`;
    messageBox.classList.add("show");
    setTimeout(() => { messageBox.classList.remove("show"); }, duration);
}

export function updateButtonStates(buttonState) {
    if (!dom.startButton || !dom.pauseButton || !dom.resetButton) return;

    dom.startButton.innerHTML = getTranslation("startButton");
    dom.pauseButton.innerHTML = getTranslation("pauseButton");
    dom.resetButton.innerHTML = getTranslation("resetButton");

    dom.startButton.disabled = true;
    dom.pauseButton.disabled = true;
    dom.resetButton.disabled = true;

    switch (buttonState) {
        case "initial":
            dom.startButton.disabled = false;
            break;
        case "reading":
            dom.pauseButton.disabled = false;
            dom.resetButton.disabled = false;
            break;
        case "paused":
            dom.startButton.disabled = false;
            dom.resetButton.disabled = false;
            dom.startButton.innerHTML = getTranslation("resumeButton");
            break;
        case "completed":
            dom.resetButton.disabled = false;
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
    dom.wpmInput?.addEventListener("input", (e) => {
        readerState.currentWpm = parseInt(e.target.value, 10);
        updateTextStats();
        scheduleSave();
        if (readerState.intervalId) {
            clearInterval(readerState.intervalId);
            readerState.intervalId = setInterval(displayNextWord, 60000 / readerState.currentWpm);
        }
    });
    dom.fixationToggle?.addEventListener("change", (e) => {
        readerState.isFixationPointEnabled = e.target.selected;
        scheduleSave();
    });

    dom.fontFamilySelector?.addEventListener('change', (e) => {
        const editor = document.querySelector('.CodeMirror');
        if (editor) {
            editor.style.fontFamily = e.target.value;
        }
        scheduleSave();
    });

    dom.fontSizeSlider?.addEventListener('input', (e) => {
        const editor = document.querySelector('.CodeMirror');
        if (editor) {
            editor.style.fontSize = `${e.target.value}px`;
        }
        if (dom.fontSizeLabel) {
            dom.fontSizeLabel.textContent = `Font Size: ${e.target.value}px`;
        }
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

    if (dom.authDialog) {
        dom.authDialog.addEventListener('close', async () => {
            // This event handles form submission via dialog-closing button
            if (dom.authDialog.returnValue !== 'submit') return;

            const email = dom.emailInput.value;
            const password = dom.passwordInput.value;
            const isLogin = dom.authDialog.dataset.mode === 'login';
            const captchaToken = grecaptcha.getResponse();

            if (!captchaToken) {
                showMessage('msgCaptchaRequired', 'error');
                setTimeout(() => dom.authDialog.show(), 1); // Re-open dialog
                return;
            }

            dom.authSubmitButton.disabled = true;

            try {
                const response = await (isLogin ? auth.login(email, password, captchaToken) : auth.signup(email, password, captchaToken));
                grecaptcha.reset();
                if (response.token) {
                    showMessage(isLogin ? "msgLoginSuccess" : "msgSignupSuccess", "success");
                    handleSuccessfulLogin();
                    // No need to call close, it's already closed.
                } else {
                    throw new Error('Unknown authentication error');
                }
            } catch (error) {
                grecaptcha.reset();
                const errorCode = error.response?.data?.error_code || 'UNKNOWN';
                showMessage(`error_${errorCode}`, 'error');
                setTimeout(() => dom.authDialog.show(), 1); // Re-open dialog on error
            } finally {
                dom.authSubmitButton.disabled = false;
            }
        });

        dom.authSwitchButton?.addEventListener("click", () => {
            const isLogin = dom.authDialog.dataset.mode === 'login';
            openAuthModal(!isLogin);
        });
    }
}

function setupGeneralEventListeners() {
    dom.fullscreenButton?.addEventListener('click', toggleFullscreen);
    dom.darkModeToggle?.addEventListener("click", () => {
        const isDark = !document.documentElement.classList.contains('dark');
        const theme = document.body.dataset.theme || 'blue';
        appState.userHasManuallySetTheme = true;
        applyTheme(theme, isDark);
        scheduleSave();
    });
    dom.languageSelector?.addEventListener("change", (event) => {
        setLanguage(event.target.value);
        scheduleSave();
    });

    dom.themeSelector?.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(newTheme, isDark);
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
