// ui.js - UI logic, DOM manipulation, and event listeners.

import { translations } from './translations.js';
import * as auth from './auth.js';
import { appState, readerState, documentState } from "./state.js";
import { handleSuccessfulLogin, handleLogout, scheduleSave } from "./main.js";
import { pauseReading, startReadingFlow, updateReadingSpeed } from "./reader.js";
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
    readabilityScore: document.getElementById("readability-score"),
    avgSentenceLength: document.getElementById("avg-sentence-length"),
    syllableCount: document.getElementById("syllable-count"),
    lexicalDiversity: document.getElementById("lexical-diversity"),
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
    if (theme) document.body.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", isDark);
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
    appState.currentLanguage = lang;
    if (dom.languageSelector) dom.languageSelector.value = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang-key]").forEach(el => {
        el.innerHTML = getTranslation(el.dataset.langKey, lang);
    });
    if (!isInitializing) {
        updateTextStats();
        updateButtonStates(readerState.isPaused ? "paused" : "initial");
    }
}

export function showMessage(messageKey, type = "info", duration = 3000) {
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
    dom.wpmInput?.addEventListener("input", () => {
        const newWpm = parseInt(dom.wpmInput.value, 10);
        readerState.currentWpm = newWpm;
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
    dom.fixationToggle?.addEventListener("change", () => {
        readerState.isFixationPointEnabled = dom.fixationToggle.checked;
        scheduleSave();
    });
}

function setupGeneralEventListeners() {
    dom.languageSelector?.addEventListener("change", (event) => setLanguage(event.target.value));
    dom.themeSelector?.addEventListener('change', (e) => {
        applyTheme(e.target.value, document.documentElement.classList.contains('dark'));
        scheduleSave();
    });
    dom.darkModeToggle?.addEventListener("click", () => {
        applyTheme(dom.themeSelector?.value, !document.documentElement.classList.contains('dark'));
        scheduleSave();
    });
}

export function attachEventListeners() {
    setupReaderControls();
    setupGeneralEventListeners();
    // Other setup functions can be added here as they are fixed
}
