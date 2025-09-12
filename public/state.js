// state.js - Shared application state

export const state = {
    // Constants
    APP_VERSION: "1.0.11",
    LS_KEYS: {
        LANGUAGE: "readMindLanguage",
        THEME: "theme",
        USER_THEME_PREFERENCE: "userThemePreference",
        FIXATION_ENABLED: "fixationPointEnabled",
        WPM: "wpm",
        TEXT: "readMindText",
        INDEX: "readMindIndex",
    },
    NO_SPACE_LANGUAGES: ["ja", "zh"],
    CONTACT_EMAIL: "hun1234kim@gmail.com",

    // State variables
    words: [],
    currentIndex: 0,
    intervalId: null,
    currentWpm: 250,
    isPaused: false,
    startDelayTimeoutId: null,
    isFixationPointEnabled: false,
    currentLanguage: "ko",
    userHasManuallySetTheme: false,
    originalPlaceholderText: "",
    encoder: new TextEncoder(),
    chunkSize: 1,
    readingMode: 'flash', // 'flash' or 'teleprompter'
};
