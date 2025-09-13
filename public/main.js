// main.js - The entry point of the application.
import * as auth from './auth.js';
import { appState, readerState, documentState, LS_KEYS } from './state.js';
import { dom, applyTheme, setLanguage, attachEventListeners, updateButtonStates, applyReaderStyles } from './ui.js';
import { updateTextStats } from './text_handler.js';
import { updateProgressBar } from './reader.js';
import { renderDocumentList, attachDocumentEventListeners, loadDocument } from './document_manager.js';

function getCurrentSettings() {
    return {
        language: appState.currentLanguage,
        colorTheme: document.body.dataset.theme || 'blue',
        darkMode: document.documentElement.classList.contains('dark'),
        isFixationPointEnabled: readerState.isFixationPointEnabled,
        wpm: readerState.currentWpm,
        chunkSize: readerState.chunkSize,
        readingMode: readerState.readingMode,
        fontFamily: appState.fontFamily,
        fontSize: appState.fontSize,
        text: documentState.simplemde ? documentState.simplemde.value() : '',
    };
}

function applySettings(settings) {
    const lang = settings.language || navigator.language.split("-")[0] || "ko";
    appState.currentLanguage = translations[lang] ? lang : "ko";

    const isDark = settings.darkMode ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = settings.colorTheme || 'blue';
    applyTheme(theme, isDark);
    if(dom.themeSelector) dom.themeSelector.value = theme;

    readerState.isFixationPointEnabled = settings.isFixationPointEnabled || false;
    if (dom.fixationToggle) dom.fixationToggle.checked = readerState.isFixationPointEnabled;

    readerState.currentWpm = parseInt(settings.wpm || "250", 10);
    if (dom.wpmInput) dom.wpmInput.value = readerState.currentWpm;

    readerState.chunkSize = parseInt(settings.chunkSize || "1", 10);
    if (dom.chunkSizeSelector) dom.chunkSizeSelector.value = readerState.chunkSize;

    readerState.readingMode = settings.readingMode || 'flash';
    if (dom.readingModeSelector) dom.readingModeSelector.value = readerState.readingMode;

    appState.fontFamily = settings.fontFamily || "'Roboto', sans-serif";
    appState.fontSize = settings.fontSize || 48;
    if (dom.fontFamilySelector) dom.fontFamilySelector.value = appState.fontFamily;
    if (dom.fontSizeSlider) dom.fontSizeSlider.value = appState.fontSize;
    if (dom.fontSizeLabel) dom.fontSizeLabel.textContent = getTranslation('fontSizeLabel', appState.currentLanguage, { size: appState.fontSize });
    applyReaderStyles(appState.fontFamily, appState.fontSize);

    if (settings.text && documentState.simplemde) {
        documentState.simplemde.value(settings.text);
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
                console.error('Failed to save settings to server:', error);
            }
        } else {
            localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
        }
    }, 1500);
}

async function loadAndApplySettings() {
    let settings = {};
    const localSettings = localStorage.getItem(LS_KEYS.SETTINGS);
    if (localSettings) {
        settings = JSON.parse(localSettings);
    }

    if (auth.isLoggedIn()) {
        try {
            const serverSettings = await auth.getSettings();
            settings = { ...settings, ...serverSettings };
        } catch (error) {
            console.error('Could not load settings from the server.', error);
        }
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
}

async function initializeApp() {
    try {
        if (document.getElementById("text-input")) {
            documentState.simplemde = new SimpleMDE({
                element: document.getElementById("text-input"),
                spellChecker: false,
                autosave: { enabled: false },
                toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"],
            });
        }

        await loadAndApplySettings();
        updateAuthUI();
        await renderDocumentList();
        setLanguage(appState.currentLanguage, true);
        updateTextStats();
        updateButtonStates("initial");
        updateProgressBar();

        if (!localStorage.getItem(LS_KEYS.HAS_VISITED)) {
            const welcomeDialog = document.getElementById('welcome-dialog');
            if(welcomeDialog) welcomeDialog.show();
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
