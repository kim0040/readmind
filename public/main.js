// main.js - The entry point of the application.
import * as auth from './auth.js';
import { appState, readerState, documentState, LS_KEYS } from './state.js';
import { dom, applyTheme, setLanguage, attachEventListeners, updateButtonStates, updateAuthUI, showMessage } from './ui.js';
import { updateTextStats } from './text_handler.js';
import { formatWordWithFixation, updateProgressBar } from './reader.js';
import { renderDocumentList, attachDocumentEventListeners, loadDocument } from './document_manager.js';

// --- Settings Management ---

function getCurrentSettings() {
    const editor = document.querySelector('.CodeMirror');
    return {
        language: appState.currentLanguage,
        colorTheme: document.body.dataset.theme || 'blue',
        darkMode: document.documentElement.classList.contains('dark'),
        userHasManuallySetTheme: appState.userHasManuallySetTheme,
        isFixationPointEnabled: readerState.isFixationPointEnabled,
        wpm: readerState.currentWpm,
        chunkSize: readerState.chunkSize,
        readingMode: readerState.readingMode,
        fontFamily: editor?.style.fontFamily || "'Roboto', sans-serif",
        fontSize: editor?.style.fontSize ? parseInt(editor.style.fontSize, 10) : 16,
        text: documentState.simplemde ? documentState.simplemde.value() : (dom.textInput ? dom.textInput.value : ''),
    };
}

function applySettings(settings) {
    const lang = settings.language || navigator.language.split("-")[0] || "ko";
    appState.currentLanguage = translations[lang] ? lang : "ko";

    appState.userHasManuallySetTheme = settings.userHasManuallySetTheme || false;

    const isDark = settings.darkMode ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = settings.colorTheme || 'blue';
    applyTheme(theme, isDark);


    readerState.isFixationPointEnabled = settings.isFixationPointEnabled || false;
    if (dom.fixationToggle) dom.fixationToggle.checked = readerState.isFixationPointEnabled;

    readerState.currentWpm = parseInt(settings.wpm || "250", 10);
    if (dom.wpmInput) dom.wpmInput.value = readerState.currentWpm;

    readerState.chunkSize = parseInt(settings.chunkSize || "1", 10);
    if (dom.chunkSizeSelector) dom.chunkSizeSelector.value = readerState.chunkSize;

    readerState.readingMode = settings.readingMode || 'flash';
    if (dom.readingModeSelector) dom.readingModeSelector.value = readerState.readingMode;

    const editor = document.querySelector('.CodeMirror');
    if (editor) {
        editor.style.fontFamily = settings.fontFamily || "'Roboto', sans-serif";
        editor.style.fontSize = `${settings.fontSize || 16}px`;
    }
    if (dom.fontFamilySelector) dom.fontFamilySelector.value = settings.fontFamily || "'Roboto', sans-serif";
    if (dom.fontSizeSlider) dom.fontSizeSlider.value = settings.fontSize || 16;
    if (dom.fontSizeLabel) dom.fontSizeLabel.textContent = `Font Size: ${settings.fontSize || 16}px`;


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

    // Restore last opened document
    const lastDocId = localStorage.getItem(LS_KEYS.LAST_DOC_ID);
    if (lastDocId) {
        // Check if the document element exists in the newly rendered list
        const docElement = dom.documentList.querySelector(`.document-item[data-id="${lastDocId}"]`);
        if (docElement) {
            try {
                const documentToLoad = await auth.getDocument(lastDocId);
                if (documentToLoad) {
                    loadDocument(documentToLoad);
                }
            } catch (error) {
                console.error("Failed to load last opened document:", error);
                localStorage.removeItem(LS_KEYS.LAST_DOC_ID); // Clean up if doc is invalid
            }
        }
    }
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
    try {
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

        const hasVisited = localStorage.getItem(LS_KEYS.HAS_VISITED);
        if (!hasVisited) {
            dom.welcomeDialog?.show();
            localStorage.setItem(LS_KEYS.HAS_VISITED, 'true');
        }

    } catch (error) {
        console.error("Error during app initialization:", error);
        // Even if initialization fails, we must attach event listeners so the user can try to log in, etc.
    } finally {
        attachEventListeners();
        attachDocumentEventListeners();
    }
}

document.addEventListener("DOMContentLoaded", initializeApp);
