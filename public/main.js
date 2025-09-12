// main.js - The entry point of the application.
import * as auth from './auth.js';
import { state } from './state.js';
import { dom, applyTheme, setLanguage, attachEventListeners, updateButtonStates, updateAuthUI, showMessage } from './ui.js';
import { updateTextStats } from './text_handler.js';
import { formatWordWithFixation, updateProgressBar } from './reader.js';

// --- Settings Management ---

/**
 * Gathers the current settings from the state into a single object.
 * @returns {object} The settings object.
 */
function getCurrentSettings() {
    return {
        language: state.currentLanguage,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        userHasManuallySetTheme: state.userHasManuallySetTheme,
        isFixationPointEnabled: state.isFixationPointEnabled,
        wpm: state.currentWpm,
        chunkSize: state.chunkSize,
        text: dom.textInput ? dom.textInput.value : '',
        // Note: We don't save the reading index (currentIndex) to the server.
        // This remains a client-side convenience.
    };
}

/**
 * Applies settings from an object to the application state and UI.
 * @param {object} settings The settings to apply.
 */
function applySettings(settings) {
    // Language
    const lang = settings.language || navigator.language.split("-")[0] || "ko";
    state.currentLanguage = translations[lang] ? lang : "ko";

    // Theme
    state.userHasManuallySetTheme = settings.userHasManuallySetTheme || false;
    if (settings.theme) {
        applyTheme(settings.theme === "dark");
    } else if (!state.userHasManuallySetTheme) {
        applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    // Reader settings
    state.isFixationPointEnabled = settings.isFixationPointEnabled || false;
    if (dom.fixationToggle) dom.fixationToggle.checked = state.isFixationPointEnabled;

    state.currentWpm = parseInt(settings.wpm || "250", 10);
    if (dom.wpmInput) dom.wpmInput.value = state.currentWpm;

    state.chunkSize = parseInt(settings.chunkSize || "1", 10);
    if (dom.chunkSizeSelector) dom.chunkSizeSelector.value = state.chunkSize;

    // Text
    if (settings.text && dom.textInput) {
        dom.textInput.value = settings.text;
    }
}

// Debounce saving to avoid excessive writes
let saveTimeout;
export function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        const settings = getCurrentSettings();
        if (auth.isLoggedIn()) {
            try {
                await auth.saveSettings(settings);
            } catch (error) {
                console.error("Failed to save settings to server:", error);
                showMessage('msgSettingsSaveError', 'error');
            }
        } else {
            // Save to localStorage for guest users
            localStorage.setItem(state.LS_KEYS.SETTINGS, JSON.stringify(settings));
        }
    }, 1000); // Save 1 second after the last change
}


/**
 * Loads settings from the appropriate source (API or localStorage) and applies them.
 */
async function loadAndApplySettings() {
    let settings = {};
    if (auth.isLoggedIn()) {
        try {
            settings = await auth.getSettings();
        } catch (error) {
            console.error("Could not load settings from server, falling back to local.", error);
            showMessage('msgSettingsLoadError', 'error');
            const localSettings = localStorage.getItem(state.LS_KEYS.SETTINGS);
            settings = localSettings ? JSON.parse(localSettings) : {};
        }
    } else {
        const localSettings = localStorage.getItem(state.LS_KEYS.SETTINGS);
        settings = localSettings ? JSON.parse(localSettings) : {};
    }
    applySettings(settings);
}


async function initializeApp() {
    if (dom.currentYearSpan) dom.currentYearSpan.textContent = new Date().getFullYear();

    if (typeof translations === "undefined") {
        console.error("Critical Error: translations.js failed to load.");
        if (dom.customMessageBox && dom.messageText) {
            dom.messageText.textContent = "Language file loading error. Please refresh or contact support.";
            dom.customMessageBox.className = "message-box error show";
        }
        return;
    }

    updateAuthUI(); // Initial check for logged-in status
    await loadAndApplySettings();

    // Now that settings are loaded, finalize UI
    updateTextStats();
    setLanguage(state.currentLanguage, true);

    let initialState = "initial";
    // Reading position is always loaded from local storage for convenience
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
    } else {
        initialState = "empty";
    }

    updateButtonStates(initialState);
    updateProgressBar();
    attachEventListeners();
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", initializeApp);
