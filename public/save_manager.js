// save_manager.js - 중앙화된 저장 관리

import { appState, readerState, LS_KEYS } from "./state.js";
import * as auth from './auth.js';

let saveTimeout = null;

export function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        const settings = getCurrentSettings();
        
        // 항상 로컬에 저장
        try {
            localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save settings locally:', error);
        }
        
        // 로그인된 경우 서버에도 저장
        if (auth.isLoggedIn()) {
            try {
                await auth.saveSettings(settings);
                console.log('Settings saved to server:', settings);
            } catch (error) {
                console.error('Failed to save settings to server:', error);
            }
        }
    }, 1500);
}

export function getCurrentSettings() {
    return {
        theme: appState.currentTheme,
        language: appState.currentLanguage,
        wpm: readerState.currentWpm,
        chunkSize: readerState.chunkSize,
        isFixationPointEnabled: readerState.isFixationPointEnabled,
        readingMode: readerState.readingMode,
        fontFamily: appState.fontFamily,
    };
}

