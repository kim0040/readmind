// main.js - 애플리케이션 초기 구동 스크립트
import * as auth from './auth.js';
import { appState, readerState, documentState, LS_KEYS } from './state.js';
import { dom, applyTheme, setLanguage, attachEventListeners, updateButtonStates, applyReaderStyles, updateAuthUI, setUiHandlers, refreshDomReferences } from './ui.js';
import { updateTextStats, handleTextChange } from './text_handler.js';
import { startReadingFlow, pauseReading, updateReadingSpeed } from './reader.js';
import { updateProgressBar } from './reader_view.js';
import { renderDocumentList, attachDocumentEventListeners, loadDocument } from './document_manager.js';
import { scheduleSave } from './save_manager.js';

/**
 * 잦은 호출을 완화하기 위한 디바운스 유틸리티.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function applySettings(settings) {
    const lang = settings.language || navigator.language.split("-")[0] || "ko";
    appState.currentLanguage = translations[lang] ? lang : "ko";

    const isDark = settings.darkMode ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = settings.colorTheme || settings.theme || 'blue';
    applyTheme(theme, isDark);
    appState.isDarkMode = isDark;
    appState.currentTheme = theme;
    if(dom.themeSelector) dom.themeSelector.value = theme;
    if(dom.darkModeToggle) dom.darkModeToggle.setAttribute('aria-pressed', String(isDark));

    readerState.isFixationPointEnabled = settings.isFixationPointEnabled || false;
    if (dom.fixationToggle) {
        // Material Web Component Switch는 selected 속성 사용
        dom.fixationToggle.selected = readerState.isFixationPointEnabled;
        dom.fixationToggle.checked = readerState.isFixationPointEnabled; // 호환성을 위해 둘 다 설정
    }

    const parsedWpm = parseInt(settings.wpm || "250", 10);
    readerState.currentWpm = Number.isNaN(parsedWpm) ? 250 : parsedWpm;
    if (dom.wpmInput) dom.wpmInput.value = readerState.currentWpm;

    readerState.chunkSize = parseInt(settings.chunkSize || "1", 10);
    if (dom.chunkSizeSelector) dom.chunkSizeSelector.value = readerState.chunkSize;

    readerState.readingMode = settings.readingMode || 'flash';
    if (dom.readingModeSelector) dom.readingModeSelector.value = readerState.readingMode;

    appState.fontFamily = settings.fontFamily || "'Roboto', sans-serif";
    const parsedFontSize = parseInt(settings.fontSize || "48", 10);
    appState.fontSize = Number.isNaN(parsedFontSize) ? 48 : parsedFontSize;
    if (dom.fontFamilySelector) dom.fontFamilySelector.value = appState.fontFamily;
    if (dom.fontSizeSlider) dom.fontSizeSlider.value = appState.fontSize;
    if (dom.fontSizeLabel) dom.fontSizeLabel.textContent = getTranslation('fontSizeLabel', appState.currentLanguage, { size: appState.fontSize });
    applyReaderStyles(appState.fontFamily, appState.fontSize);

    if (settings.text && documentState.simplemde) {
        documentState.simplemde.value(settings.text);
    }
}

/**
 * 마크다운 에디터 혹은 예비 텍스트 영역의 최신 내용을 반환한다.
 */
function getEditorContent() {
    if (documentState.simplemde) {
        return documentState.simplemde.value();
    }
    return dom.textInput?.value || '';
}

/**
 * 현재 편집 중인 텍스트를 다시 분석하도록 강제한다.
 */
async function refreshEditorContent() {
    await handleTextChange(getEditorContent());
}

/**
 * 읽기 영역과 진행률 정보를 초기 상태로 되돌린다.
 */
function resetReaderViewport() {
    readerState.currentIndex = 0;
    readerState.isPaused = false;
    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = '';
    }
    if (dom.progressInfoDisplay) {
        dom.progressInfoDisplay.textContent = '';
    }
    updateProgressBar();
    updateButtonStates('initial');
}

/**
 * UI 모듈에 앱 전반의 동작을 연결하는 콜백을 주입한다.
 */
function registerUiEventHandlers() {
    setUiHandlers({
        onStartReading: async (isResuming) => {
            await startReadingFlow(isResuming);
        },
        onPauseReading: () => {
            pauseReading();
        },
        onResetReader: () => {
            resetReaderViewport();
        },
        onWpmChange: async (newWpm) => {
            updateReadingSpeed(newWpm);
            await updateTextStats();
        },
        onChunkSizeChange: async () => {
            await refreshEditorContent();
        },
        onFixationToggle: () => {
            // UI 단에서 스케줄된 저장만 수행하면 충분하다.
        },
        onReadingModeChange: async () => {
            await refreshEditorContent();
        },
        onAuthSuccess: async () => {
            await handleSuccessfulLogin();
        },
        onAuthFailure: (error) => {
            console.warn('인증 처리 중 오류가 감지되었습니다:', error);
        },
        onLogout: () => {
            handleLogout();
        },
    });
}

registerUiEventHandlers();

/**
 * 인증이 성공한 후 UI와 상태를 동기화한다.
 */
export async function handleSuccessfulLogin() {
    updateAuthUI();
    await renderDocumentList();
    await loadAndApplySettings();
    setLanguage(appState.currentLanguage, true);
    updateTextStats();
}

/**
 * 사용자 컨텍스트를 정리하고 로그아웃 상태로 되돌린다.
 */
export function handleLogout() {
    auth.logout();
    documentState.activeDocument = null;
    if (documentState.simplemde) documentState.simplemde.value('');
    updateAuthUI();
    renderDocumentList();
}

/**
 * 로컬/서버 설정을 순차적으로 로드하고 병합한다.
 */
async function loadAndApplySettings() {
    let settings = {};
    
    // 먼저 로컬 설정을 로드
    const localSettings = localStorage.getItem(LS_KEYS.SETTINGS);
    if (localSettings) {
        try {
            settings = JSON.parse(localSettings);
        } catch (error) {
            console.warn('로컬 설정을 파싱할 수 없습니다:', error);
        }
    }

    // 로그인된 경우 서버 설정을 로드하고 로컬 설정을 덮어쓰기
    if (auth.isLoggedIn()) {
        try {
            const serverSettings = await auth.getSettings();
            settings = { ...settings, ...serverSettings };
        } catch (error) {
            console.error('서버에서 설정을 가져오지 못했습니다:', error);
        }
    }
    
    applySettings(settings);
}


/**
 * DOM 준비 이후 SPA 초기화를 진행한다.
 */
async function initializeApp() {
    try {
        refreshDomReferences();
        const textInputEl = document.getElementById("text-input");
        if (textInputEl && typeof SimpleMDE === 'function') {
            documentState.simplemde = new SimpleMDE({
                element: textInputEl,
                spellChecker: false,
                autosave: { enabled: false },
                toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"],
            });

            const debouncedUpdate = debounce(() => {
                updateTextStats();
                scheduleSave();
            }, 500); // 500ms delay

            // 통합된 이벤트 리스너
            documentState.simplemde.codemirror.on('change', () => {
                debouncedUpdate();
            });
        } else if (textInputEl) {
            const debouncedUpdate = debounce(() => {
                updateTextStats();
                scheduleSave();
            }, 400);
            textInputEl.addEventListener('input', debouncedUpdate);
            textInputEl.addEventListener('change', debouncedUpdate);
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
            if(welcomeDialog) welcomeDialog.classList.remove('hidden');
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
