// reader_view.js - 읽기 화면 표시용 보조 함수 모음

import { dom, getTranslation } from './ui.js';
import { readerState, appState } from './state.js';

/**
 * 읽기 상태에 따라 진행률 바와 ARIA 정보를 갱신한다.
 */
export function updateProgressBar() {
    if (!dom.progressBarFill) return;
    const progress = readerState.words.length > 0
        ? (readerState.currentIndex / readerState.words.length) * 100
        : 0;
    dom.progressBarFill.style.width = `${progress}%`;

    const progressBar = dom.progressBarFill.parentElement;
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', Math.round(progress).toString());
    }
}

/**
 * 시선 고정점 기능이 활성화된 경우 단어 내 초점을 강조한다.
 *
 * @param {string} word 현재 표시 중인 단어 또는 청크
 * @returns {string} 고정점 마크업이 적용된 HTML 문자열
 */
export function formatWordWithFixation(word) {
    if (!readerState.isFixationPointEnabled || !word || word.length <= 1) {
        return word;
    }

    const fixationIndex = Math.max(0, Math.floor(word.length / 3) - (word.length > 5 ? 1 : 0));
    if (fixationIndex < 0 || fixationIndex >= word.length) {
        return word;
    }

    const prefix = word.substring(0, fixationIndex);
    const fixationChar = word.charAt(fixationIndex);
    const suffix = word.substring(fixationIndex + 1);
    return `${prefix}<span class="fixation-point">${fixationChar}</span>${suffix}`;
}

/**
 * 언어 및 청크 크기에 맞춰 진행률 단위 라벨을 결정한다.
 *
 * @param {number} total 전체 읽기 단위 수
 * @returns {string} 진행률 메시지에 사용할 번역 문자열
 */
export function resolveProgressUnitLabel(total) {
    if (readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
        return getTranslation('charsLabel', appState.currentLanguage, { total });
    }
    if (readerState.chunkSize > 1) {
        return getTranslation('chunksLabel', appState.currentLanguage, { total });
    }
    return getTranslation('wordsLabel', appState.currentLanguage, { total });
}
