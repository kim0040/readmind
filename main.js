// main.js - The entry point of the application.
import { state } from './state.js';
import { dom, applyTheme, setLanguage, attachEventListeners, updateButtonStates, updateAuthUI } from './ui.js';
import { updateTextStats } from './text_handler.js';
import { formatWordWithFixation, updateProgressBar } from './reader.js';
import { onAuthStateChangedListener } from './firebase.js';

function applySavedSettings() {
    const savedLanguage = localStorage.getItem(state.LS_KEYS.LANGUAGE);
    state.currentLanguage = savedLanguage || navigator.language.split("-")[0] || "ko";
    if (!translations[state.currentLanguage]) state.currentLanguage = "ko";

    const savedTheme = localStorage.getItem(state.LS_KEYS.THEME);
    state.userHasManuallySetTheme = localStorage.getItem(state.LS_KEYS.USER_THEME_PREFERENCE) === "true";

    if (savedTheme) {
        applyTheme(savedTheme === "dark");
    } else if (!state.userHasManuallySetTheme) {
        applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    state.isFixationPointEnabled = localStorage.getItem(state.LS_KEYS.FIXATION_ENABLED) === "true";
    if (dom.fixationToggle) dom.fixationToggle.checked = state.isFixationPointEnabled;

    state.currentWpm = parseInt(localStorage.getItem(state.LS_KEYS.WPM) || "250", 10);
    if (dom.wpmInput) dom.wpmInput.value = state.currentWpm;

    const savedText = localStorage.getItem(state.LS_KEYS.TEXT);
    if (savedText && dom.textInput) {
        dom.textInput.value = savedText;
    }
}


function initializeApp() {
    if (dom.currentYearSpan) dom.currentYearSpan.textContent = new Date().getFullYear();

    if (typeof translations === "undefined") {
        console.error("Critical Error: translations.js failed to load.");
        // Basic fallback error message
        if (dom.customMessageBox && dom.messageText) {
            dom.messageText.textContent = "Language file loading error. Please refresh or contact support.";
            dom.customMessageBox.className = "message-box error show";
            dom.customMessageBox.style.opacity = "1";
            dom.customMessageBox.style.visibility = "visible";
            dom.customMessageBox.style.transform = "translateX(-50%) translateY(0)";
        }
        return;
    }

    applySavedSettings();
    updateTextStats();
    setLanguage(state.currentLanguage, true);

    let initialState = "initial";
    const savedIndex = parseInt(localStorage.getItem(state.LS_KEYS.INDEX) || "0", 10);

    if (dom.textInput && dom.textInput.value.trim() !== "") {
        if (state.words && state.words.length > 0 && savedIndex > 0 && savedIndex < state.words.length) {
            state.currentIndex = savedIndex;
            state.isPaused = true;
            initialState = "paused";
            if (dom.currentWordDisplay) {
                dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusPaused"));
            }
        } else {
            state.currentIndex = 0;
            state.isPaused = false;
            initialState = "initial";
            if (dom.currentWordDisplay) {
                dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusReady"));
            }
        }
        if (dom.textInput.placeholder !== "" && dom.textInput.value.trim()) {
            dom.textInput.placeholder = "";
        }
    } else {
        state.currentIndex = 0;
        state.isPaused = false;
        initialState = "empty";
        if (dom.currentWordDisplay) {
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusReady"));
        }
        if (dom.textInput && dom.textInput.placeholder !== state.originalPlaceholderText && state.originalPlaceholderText) {
            dom.textInput.placeholder = state.originalPlaceholderText;
        }
    }

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.style.opacity = "1";
        dom.currentWordDisplay.style.transform = "translateY(0px)";
    }
    updateButtonStates(initialState);
    updateProgressBar();
    attachEventListeners();
    onAuthStateChangedListener(updateAuthUI);
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", initializeApp);
