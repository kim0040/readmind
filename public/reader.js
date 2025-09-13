// reader.js - Core speed-reading engine logic.

import { dom, getTranslation, showMessage, updateButtonStates } from "./ui.js";
import { readerState, appState, LS_KEYS } from "./state.js";
import { scheduleSave } from "./main.js";

const START_DELAY = 1000;

export function updateProgressBar() {
    if (!dom.progressBarFill) return;
    const progress = readerState.words.length > 0 ? (readerState.currentIndex / readerState.words.length) * 100 : 0;
    dom.progressBarFill.style.width = `${progress}%`;
}

export function formatWordWithFixation(word) {
    if (!readerState.isFixationPointEnabled || !word || word.length <= 1) return word;
    const point = Math.max(0, Math.floor(word.length / 3) - (word.length > 5 ? 1 : 0));
    if (point < 0 || point >= word.length) return word;
    return `${word.substring(0, point)}<span class="fixation-point">${word.charAt(point)}</span>${word.substring(point + 1)}`;
}

function displayNextWord() {
    if (readerState.currentIndex < readerState.words.length) {
        if (dom.currentWordDisplay) {
            let currentChunk = readerState.words[readerState.currentIndex];
            const wordToShow = Array.isArray(currentChunk) ? currentChunk.join(' ') : currentChunk;
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(wordToShow);
        }
        readerState.currentIndex++;
        if (dom.progressInfoDisplay) {
             let unitLabel;
            if (readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
                unitLabel = getTranslation("charsLabel");
            } else if (readerState.chunkSize > 1) {
                unitLabel = getTranslation("chunksLabel");
            } else {
                unitLabel = getTranslation("wordsLabel");
            }
            dom.progressInfoDisplay.textContent = getTranslation("progressLabelFormat", appState.currentLanguage, { unit: unitLabel, current: readerState.currentIndex, total: readerState.words.length });
        }
        updateProgressBar();
    } else {
        completeReadingSession();
    }
}

export function startReadingFlow(isResuming = false) {
    if (readerState.words.length === 0) {
        showMessage("msgNoWords", "error");
        return;
    }
    if (!isResuming) {
        readerState.currentIndex = 0;
    }

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusPreparing"));
    }

    readerState.isPaused = false;
    updateButtonStates("reading");

    clearTimeout(readerState.startDelayTimeoutId);
    readerState.startDelayTimeoutId = setTimeout(() => {
        if (readerState.intervalId) clearInterval(readerState.intervalId);
        displayNextWord();
        if (readerState.currentIndex < readerState.words.length) {
            readerState.intervalId = setInterval(displayNextWord, 60000 / readerState.currentWpm);
        }
    }, isResuming ? 0 : START_DELAY);
}

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

export function pauseReading() {
    clearInterval(readerState.intervalId);
    readerState.intervalId = null;
    readerState.isPaused = true;
    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusPaused"));
    }
    updateButtonStates("paused");
    scheduleSave();
    localStorage.setItem(LS_KEYS.INDEX, readerState.currentIndex.toString());
}

export function updateReadingSpeed(newWpm) {
    readerState.currentWpm = newWpm;
    if (readerState.intervalId) {
        clearInterval(readerState.intervalId);
        readerState.intervalId = setInterval(displayNextWord, 60000 / newWpm);
    }
}
