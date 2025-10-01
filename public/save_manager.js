// save_manager.js - 중앙화된 저장 관리

import { appState, readerState, LS_KEYS } from "./state.js";
import * as auth from './auth.js';

let saveTimeout = null;

/**
 * 설정을 디바운싱하여 로컬/서버에 저장한다.
 */
export function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        const settings = getCurrentSettings();
        
        // 항상 로컬에 저장
        try {
            localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.warn('로컬 저장소에 설정을 저장하지 못했습니다:', error);
        }
        
        // 로그인된 경우 서버에도 저장
        if (auth.isLoggedIn()) {
            try {
                await auth.saveSettings(settings);
                console.log('서버에 설정이 저장되었습니다:', settings);
            } catch (error) {
                console.error('서버에 설정 저장 중 오류가 발생했습니다:', error);
            }
        }
    }, 1500);
}

/**
 * 저장 대상이 되는 UI 설정값을 한데 모은다.
 */
export function getCurrentSettings() {
    return {
        theme: appState.currentTheme,
        colorTheme: appState.currentTheme,
        darkMode: appState.isDarkMode,
        language: appState.currentLanguage,
        wpm: readerState.currentWpm,
        chunkSize: readerState.chunkSize,
        isFixationPointEnabled: readerState.isFixationPointEnabled,
        readingMode: readerState.readingMode,
        fontFamily: appState.fontFamily,
        fontSize: appState.fontSize,
    };
}
