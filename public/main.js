// main.js - The entry point of the application.
import * as auth from './auth.js';
import { appState, readerState, documentState, LS_KEYS } from './state.js';
import { dom, applyTheme, setLanguage, attachEventListeners, updateButtonStates, applyReaderStyles, updateAuthUI, showAuthModal, hideAuthModal } from './ui.js';
import { updateTextStats } from './text_handler.js';
import { updateProgressBar } from './reader.js';
import { renderDocumentList, attachDocumentEventListeners, loadDocument } from './document_manager.js';
import { scheduleSave, getCurrentSettings } from './save_manager.js';


function applySettings(settings) {
    const lang = settings.language || navigator.language.split("-")[0] || "ko";
    appState.currentLanguage = translations[lang] ? lang : "ko";

    const isDark = settings.darkMode ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = settings.colorTheme || 'blue';
    applyTheme(theme, isDark);
    if(dom.themeSelector) dom.themeSelector.value = theme;

    readerState.isFixationPointEnabled = settings.isFixationPointEnabled || false;
    if (dom.fixationToggle) {
        // Material Web Component Switch는 selected 속성 사용
        dom.fixationToggle.selected = readerState.isFixationPointEnabled;
        dom.fixationToggle.checked = readerState.isFixationPointEnabled; // 호환성을 위해 둘 다 설정
    }

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

export async function handleSuccessfulLogin() {
    updateAuthUI();
    await renderDocumentList();
    await loadAndApplySettings();
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

async function loadAndApplySettings() {
    let settings = {};
    
    // 먼저 로컬 설정을 로드
    const localSettings = localStorage.getItem(LS_KEYS.SETTINGS);
    if (localSettings) {
        try {
            settings = JSON.parse(localSettings);
        } catch (error) {
            console.warn('Failed to parse local settings:', error);
        }
    }

    // 로그인된 경우 서버 설정을 로드하고 로컬 설정을 덮어쓰기
    if (auth.isLoggedIn()) {
        try {
            const serverSettings = await auth.getSettings();
            settings = { ...settings, ...serverSettings };
            console.log('Settings loaded from server:', serverSettings);
        } catch (error) {
            console.error('Could not load settings from the server:', error);
        }
    }
    
    applySettings(settings);
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
            
            // SimpleMDE 이벤트 리스너 추가
            documentState.simplemde.codemirror.on('change', () => {
                console.log('SimpleMDE content changed');
                updateTextStats();
                scheduleSave();
            });
            
            // 추가 이벤트 리스너들
            documentState.simplemde.codemirror.on('inputRead', () => {
                console.log('SimpleMDE input read');
                updateTextStats();
            });
            
            documentState.simplemde.codemirror.on('paste', () => {
                console.log('SimpleMDE paste detected');
                setTimeout(() => {
                    updateTextStats();
                    scheduleSave();
                }, 100);
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
