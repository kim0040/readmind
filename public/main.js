// main.js - The entry point of the application.
import * as auth from './auth.js';
import { appState, readerState, documentState, LS_KEYS } from './state.js';
import { dom, applyTheme, setLanguage, attachEventListeners, updateButtonStates, updateAuthUI, showMessage } from './ui.js';
import { updateTextStats } from './text_handler.js';
import { formatWordWithFixation, updateProgressBar } from './reader.js';
import { renderDocumentList, attachDocumentEventListeners } from './document_manager.js';

// --- Settings Management ---

function getCurrentSettings() {
    return {
        language: appState.currentLanguage,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        userHasManuallySetTheme: appState.userHasManuallySetTheme,
        isFixationPointEnabled: readerState.isFixationPointEnabled,
        wpm: readerState.currentWpm,
        chunkSize: readerState.chunkSize,
        readingMode: readerState.readingMode,
        text: documentState.simplemde ? documentState.simplemde.value() : (dom.textInput ? dom.textInput.value : ''),
    };
}

function applySettings(settings) {
    const lang = settings.language || navigator.language.split("-")[0] || "ko";
    appState.currentLanguage = translations[lang] ? lang : "ko";

    appState.userHasManuallySetTheme = settings.userHasManuallySetTheme || false;
    if (settings.theme) {
        applyTheme(settings.theme === "dark");
    } else if (!appState.userHasManuallySetTheme) {
        applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    readerState.isFixationPointEnabled = settings.isFixationPointEnabled || false;
    if (dom.fixationToggle) dom.fixationToggle.checked = readerState.isFixationPointEnabled;

    readerState.currentWpm = parseInt(settings.wpm || "250", 10);
    if (dom.wpmInput) dom.wpmInput.value = readerState.currentWpm;

    readerState.chunkSize = parseInt(settings.chunkSize || "1", 10);
    if (dom.chunkSizeSelector) dom.chunkSizeSelector.value = readerState.chunkSize;

    readerState.readingMode = settings.readingMode || 'flash';
    if (dom.readingModeSelector) dom.readingModeSelector.value = readerState.readingMode;

    if (settings.text && dom.textInput) {
        dom.textInput.value = settings.text;
        if (documentState.simplemde) documentState.simplemde.value(settings.text);
    }
}

let saveTimeout;
export function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        const settings = getCurrentSettings();
        if (auth.isLoggedIn()) {
            try {
                await auth.saveSettings(settings);
            } catch (error) {
                showMessage('msgSettingsSaveError', 'error');
            }
        } else {
            localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
        }
    }, 1000);
}

async function loadAndApplySettings() {
    let settings = {};
    if (auth.isLoggedIn()) {
        try {
            settings = await auth.getSettings();
        } catch (error) {
            showMessage('msgSettingsLoadError', 'error');
            const localSettings = localStorage.getItem(LS_KEYS.SETTINGS);
            settings = localSettings ? JSON.parse(localSettings) : {};
        }
    } else {
        const localSettings = localStorage.getItem(LS_KEYS.SETTINGS);
        settings = localSettings ? JSON.parse(localSettings) : {};
    }
    applySettings(settings);
}

export async function handleSuccessfulLogin() {
    updateAuthUI();
    await loadAndApplySettings();
    await renderDocumentList();
    setLanguage(appState.currentLanguage, true);
    updateTextStats();
}

export function handleLogout() {
    auth.logout();
    documentState.activeDocument = null;
    if (documentState.simplemde) documentState.simplemde.value('');
    updateAuthUI();
    renderDocumentList();
    showMessage('msgLogoutSuccess', 'success');
}

async function initializeApp() {
    updateAuthUI();
    await loadAndApplySettings();
    await renderDocumentList();

    if (document.getElementById("text-input")) {
        documentState.simplemde = new SimpleMDE({
            element: document.getElementById("text-input"),
            spellChecker: false,
            autosave: { enabled: false, uniqueId: "ReadMindContent" },
            toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"],
        });

        if (dom.textInput.value) {
            documentState.simplemde.value(dom.textInput.value);
        }
    }

    updateTextStats();
    setLanguage(appState.currentLanguage, true);

    let initialState = "initial";
    const savedIndex = parseInt(localStorage.getItem(LS_KEYS.INDEX) || "0", 10);

    if (dom.textInput && dom.textInput.value.trim() !== "") {
        if (readerState.words && readerState.words.length > 0 && savedIndex > 0 && savedIndex < readerState.words.length) {
            readerState.currentIndex = savedIndex;
            readerState.isPaused = true;
            initialState = "paused";
        } else {
            initialState = "initial";
        }
    } else {
        initialState = "empty";
    }

    updateButtonStates(initialState);
    updateProgressBar();
    attachEventListeners();
    attachDocumentEventListeners();
}

document.addEventListener("DOMContentLoaded", initializeApp);
