// reader.js - 속독 엔진 핵심 로직

import { dom, getTranslation, showMessage, updateButtonStates } from './ui.js';
import { updateTextStats } from './text_handler.js';
import { SpeedReaderCore } from './core/reader_core.js';
import { readerState, appState, LS_KEYS } from './state.js';
import { scheduleSave } from './save_manager.js';
import { formatWordWithFixation, updateProgressBar, resolveProgressUnitLabel } from './reader_view.js';

const START_DELAY = 1000;

/**
 * 텔레프롬프터 모드에서 새로운 문장을 추가하고 최신 위치로 스크롤한다.
 */
function displayTeleprompterMode(newWord) {
    if (!dom.currentWordDisplay) return;
    
    const displayArea = dom.currentWordDisplay;
    const currentContent = displayArea.innerHTML;
    
    // 새 단어를 추가하고 스크롤
    displayArea.innerHTML = currentContent + ' ' + newWord;
    
    // 스크롤을 아래로 이동하여 새 단어가 보이도록 함
    displayArea.scrollTop = displayArea.scrollHeight;
}

/**
 * 현재 읽기 모드에 맞춰 다음 단어/청크를 표시하고 진행률을 갱신한다.
 */
function displayNextWord() {
    if (readerState.currentIndex < readerState.words.length) {
        if (dom.currentWordDisplay) {
            let currentChunk = readerState.words[readerState.currentIndex];
            const wordToShow = Array.isArray(currentChunk) ? currentChunk.join(' ') : currentChunk;
            
            if (readerState.readingMode === 'teleprompter') {
                // 텔레프롬프터 모드: 여러 단어를 한 번에 표시하고 스크롤
                displayTeleprompterMode(wordToShow);
            } else {
                // 플래시 모드: 단어를 하나씩 중앙에 표시
                dom.currentWordDisplay.innerHTML = formatWordWithFixation(wordToShow);
            }
        }
        readerState.currentIndex++;
        if (dom.progressInfoDisplay) {
            const unitLabel = resolveProgressUnitLabel(readerState.words.length);
            dom.progressInfoDisplay.textContent = getTranslation('progressLabelFormat', appState.currentLanguage, {
                unit: unitLabel,
                current: readerState.currentIndex,
                total: readerState.words.length,
            });
        }
        updateProgressBar();
    } else {
        completeReadingSession();
    }
}

/**
 * 속독 엔진을 초기화하고 실행한다.
 *
 * @param {boolean} isResuming 일시정지 상태에서 재개하는지 여부
 */
export async function startReadingFlow(isResuming = false) {
    // 항상 최신 텍스트 세분화가 반영되도록 보장
    await updateTextStats();
    if (!readerState.words || readerState.words.length === 0) {
        showMessage("msgNoWords", "error");
        return;
    }
    
    // 재시작이 아닌 경우에만 인덱스 초기화
    if (!isResuming) {
        readerState.currentIndex = 0;
        // 텔레프롬프터 모드 초기화
        if (readerState.readingMode === 'teleprompter' && dom.currentWordDisplay) {
            dom.currentWordDisplay.innerHTML = '';
            dom.currentWordDisplay.style.textAlign = 'left';
            dom.currentWordDisplay.style.overflowY = 'auto';
            dom.currentWordDisplay.style.maxHeight = '400px';
        } else if (dom.currentWordDisplay) {
            dom.currentWordDisplay.style.textAlign = 'center';
            dom.currentWordDisplay.style.overflowY = 'visible';
            dom.currentWordDisplay.style.maxHeight = 'none';
        }
    }

    if (dom.currentWordDisplay) {
        if (readerState.readingMode === 'teleprompter') {
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusPreparing"));
        } else {
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusPreparing"));
        }
    }

    // 엔진 초기화 및 실행 (항상 새로 생성하여 최신 설정 반영)
    readerState.engine = new SpeedReaderCore({
            getWords: () => readerState.words,
            getWpm: () => readerState.currentWpm,
            getMode: () => readerState.readingMode,
            onChunk: (text) => {
                if (!dom.currentWordDisplay) return;
                if (readerState.readingMode === 'teleprompter') {
                    const area = dom.currentWordDisplay;
                    area.innerHTML = area.innerHTML + ' ' + text;
                    area.scrollTop = area.scrollHeight;
                } else {
                    // 원본 ReadMindApp 애니메이션 로직
                    const wordArea = dom.currentWordDisplay;
                    const currentWpm = readerState.currentWpm;
                    
                    // 애니메이션 상수 (원본에서 가져온 값들)
                    const ANIMATION_DURATION_NORMAL = 120;
                    const ANIMATION_DURATION_SUBTLE = 60;
                    const LOW_WPM_THRESHOLD = 200;
                    const NO_ANIMATION_THRESHOLD = 400;
                    
                    wordArea.innerHTML = formatWordWithFixation(text);
                    wordArea.style.transition = "none";
                    wordArea.style.opacity = "1";
                    wordArea.style.transform = "translateY(0px)";

                    if (currentWpm < LOW_WPM_THRESHOLD) {
                        // 느린 속도: 부드러운 페이드인 + 위치 이동 애니메이션
                        wordArea.style.opacity = "0";
                        wordArea.style.transform = "translateY(5px)";
                        wordArea.offsetHeight; // Reflow
                        wordArea.style.transition = `opacity ${ANIMATION_DURATION_NORMAL / 1000}s ease-out, transform ${ANIMATION_DURATION_NORMAL / 1000}s ease-out`;
                        wordArea.style.opacity = "1";
                        wordArea.style.transform = "translateY(0px)";
                    } else if (currentWpm < NO_ANIMATION_THRESHOLD) {
                        // 중간 속도: 미묘한 투명도 변화만
                        wordArea.style.opacity = "0.5";
                        wordArea.offsetHeight; // Reflow
                        wordArea.style.transition = `opacity ${ANIMATION_DURATION_SUBTLE / 1000}s ease-in-out`;
                        wordArea.style.opacity = "1";
                    }
                    // 빠른 속도 (400+ WPM): 애니메이션 없음
                }
            },
            onProgress: (idx, total) => {
                readerState.currentIndex = idx;
                if (dom.progressInfoDisplay) {
                    const unitLabel = resolveProgressUnitLabel(total);
                    dom.progressInfoDisplay.textContent = getTranslation('progressLabelFormat', appState.currentLanguage, {
                        unit: unitLabel,
                        current: idx,
                        total,
                    });
                }
                updateProgressBar();
            },
            onStatus: (key) => {
                if (key === 'msgNoWords') showMessage('msgNoWords', 'error');
                else if (dom.currentWordDisplay) dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation(key));
            },
            onComplete: () => {
                updateButtonStates("completed");
                scheduleSave();
                localStorage.setItem(LS_KEYS.INDEX, "0");
            }
        });
    

    readerState.isPaused = false;
    updateButtonStates("reading");
    readerState.engine.start(isResuming, START_DELAY);
}

/**
 * 읽기가 완료되었을 때 타이머를 정리하고 UI/상태를 저장한다.
 */
function completeReadingSession() {
    clearInterval(readerState.intervalId);
    readerState.intervalId = null;

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusComplete"));
    }

    showMessage("msgAllWordsRead", "success", 3000);
    updateButtonStates("completed");
    scheduleSave();
    localStorage.setItem(LS_KEYS.INDEX, "0");
}

/**
 * 엔진을 일시정지하고 현재 위치를 저장한다.
 */
export function pauseReading() {
    if (readerState.engine) readerState.engine.pause();
    readerState.isPaused = true;
    updateButtonStates("paused");
    scheduleSave();
    localStorage.setItem(LS_KEYS.INDEX, readerState.currentIndex.toString());
}

/**
 * 엔진이 실행 중일 때 읽기 속도를 실시간으로 갱신한다.
 *
 * @param {number} newWpm 새로 선택된 분당 단어 수
 */
export function updateReadingSpeed(newWpm) {
    readerState.currentWpm = newWpm;
    if (readerState.engine) {
        readerState.engine.updateSpeed();
    }
}
