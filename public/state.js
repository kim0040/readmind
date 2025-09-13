// state.js - Shared application state, modularized by feature.

// --- Constants ---
export const LS_KEYS = {
    SETTINGS: "readMindSettings_v2", // Combined settings key
    INDEX: "readMindIndex",
    LAST_DOC_ID: "readMindLastDocId",
};

export const CONTACT_EMAIL = "hun1234kim@gmail.com";
export const APP_VERSION = "2.0.0";

// --- Application State ---
// For general app settings like theme, language, etc.
export const appState = {
    currentLanguage: "ko",
    userHasManuallySetTheme: false,
    originalPlaceholderText: "",
    encoder: new TextEncoder(),
};

// --- Reader State ---
// For state directly related to the speed reading engine.
export const readerState = {
    words: [],
    currentIndex: 0,
    intervalId: null,
    currentWpm: 250,
    isPaused: false,
    startDelayTimeoutId: null,
    isFixationPointEnabled: false,
    chunkSize: 1,
    readingMode: 'flash', // 'flash' or 'teleprompter'
    NO_SPACE_LANGUAGES: ["ja", "zh"],
};

// --- Document & Editor State ---
// For state related to document management and the editor.
export const documentState = {
    simplemde: null, // To hold the SimpleMDE instance
    activeDocument: null, // To hold the currently active document object
};
