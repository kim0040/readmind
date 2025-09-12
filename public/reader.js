// reader.js - Core speed-reading engine logic.

import { dom, getTranslation, showMessage, updateButtonStates } from "./ui.js";
import { state } from "./state.js";
import { scheduleSave } from "./main.js";

const START_DELAY = 1000;
const ANIMATION_DURATION_NORMAL = 120;
const ANIMATION_DURATION_SUBTLE = 60;
const LOW_WPM_THRESHOLD = 200;
const NO_ANIMATION_THRESHOLD = 400;

export function updateProgressBar() {
    if (!dom.progressBarFill) return;
    const progress = state.words.length > 0 ? (state.currentIndex / state.words.length) * 100 : 0;
    dom.progressBarFill.style.width = `${progress}%`;
}

export function formatWordWithFixation(word) {
    if (!state.isFixationPointEnabled || !word || word.length <= 1) return word;
    const point = Math.max(
      0,
      Math.floor(word.length / 3) - (word.length > 5 ? 1 : 0),
    );
    if (point < 0 || point >= word.length) return word;
    return `${word.substring(0, point)}<span class="fixation-point">${word.charAt(point)}</span>${word.substring(point + 1)}`;
}

function displayNextWord() {
    if (state.currentIndex < state.words.length) {
        if (dom.currentWordDisplay) {
            let currentChunk = state.words[state.currentIndex];
            const wordToShow = Array.isArray(currentChunk) ? currentChunk.join(' ') : currentChunk;

            dom.currentWordDisplay.innerHTML = formatWordWithFixation(wordToShow);
            dom.currentWordDisplay.style.transition = "none";
            dom.currentWordDisplay.style.opacity = "1";
            dom.currentWordDisplay.style.transform = "translateY(0px)";

            if (state.currentWpm < LOW_WPM_THRESHOLD) {
                dom.currentWordDisplay.style.opacity = "0";
                dom.currentWordDisplay.style.transform = "translateY(5px)";
                dom.currentWordDisplay.offsetHeight;
                dom.currentWordDisplay.style.transition = `opacity ${ANIMATION_DURATION_NORMAL / 1000}s ease-out, transform ${ANIMATION_DURATION_NORMAL / 1000}s ease-out`;
                dom.currentWordDisplay.style.opacity = "1";
                dom.currentWordDisplay.style.transform = "translateY(0px)";
            } else if (state.currentWpm < NO_ANIMATION_THRESHOLD) {
                dom.currentWordDisplay.style.opacity = "0.5";
                dom.currentWordDisplay.offsetHeight;
                dom.currentWordDisplay.style.transition = `opacity ${ANIMATION_DURATION_SUBTLE / 1000}s ease-in-out`;
                dom.currentWordDisplay.style.opacity = "1";
            }
        }
        state.currentIndex++;
        if (dom.progressInfoDisplay) {
             let unitLabel;
            if (state.NO_SPACE_LANGUAGES.includes(state.currentLanguage)) {
                unitLabel = getTranslation("charsLabel");
            } else if (state.chunkSize > 1) {
                unitLabel = getTranslation("chunksLabel");
            } else {
                unitLabel = getTranslation("wordsLabel");
            }
            dom.progressInfoDisplay.textContent = getTranslation("progressLabelFormat", state.currentLanguage, "en", { unit: unitLabel, current: state.currentIndex, total: state.words.length });
        }
        updateProgressBar();
    } else {
        completeReadingSession();
    }
}

function startTeleprompter() {
    const displayArea = dom.currentWordDisplay;
    if (!displayArea) return;

    // Prepare UI
    displayArea.innerHTML = ''; // Clear previous content
    displayArea.classList.add('teleprompter-active');

    const scroller = document.createElement('span');
    scroller.id = 'teleprompter-scroller';
    scroller.textContent = state.words.join(state.NO_SPACE_LANGUAGES.includes(state.currentLanguage) ? '' : ' ');
    displayArea.appendChild(scroller);

    // Calculate duration
    const totalChars = scroller.textContent.length;
    const avgCharsPerWord = 5; // A common baseline
    const wpm = state.currentWpm;
    const charsPerMinute = wpm * avgCharsPerWord;
    const charsPerSecond = charsPerMinute / 60;
    const duration = totalChars / charsPerSecond;

    scroller.style.animation = `scroll-left ${duration}s linear`;
    scroller.style.animationPlayState = 'running';

    // Handle completion
    scroller.addEventListener('animationend', () => {
        completeReadingSession();
    }, { once: true });
}

export function startReadingFlow(isResuming = false) {
    if (state.words.length === 0) {
        showMessage("msgNoWords", "error");
        return;
    }
    if (!isResuming) {
        state.currentIndex = 0;
    }

    // Handle teleprompter resume
    if (isResuming && state.readingMode === 'teleprompter') {
        resumeTeleprompter();
        return;
    }

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusPreparing"));
    }

    state.isPaused = false;
    updateButtonStates("reading");

    clearTimeout(state.startDelayTimeoutId);
    state.startDelayTimeoutId = setTimeout(() => {
        if (state.readingMode === 'teleprompter') {
            startTeleprompter();
        } else { // 'flash' mode
            if (state.intervalId) clearInterval(state.intervalId);
            displayNextWord();
            if (state.currentIndex < state.words.length) {
                state.intervalId = setInterval(displayNextWord, 60000 / state.currentWpm);
            }
        }
    }, isResuming ? 0 : START_DELAY);
}

function completeReadingSession() {
    if (state.readingMode === 'teleprompter') {
        const displayArea = dom.currentWordDisplay;
        if (displayArea) {
            displayArea.classList.remove('teleprompter-active');
            const scroller = document.getElementById('teleprompter-scroller');
            if (scroller) scroller.remove();
        }
    } else {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusComplete"));
    }

    showMessage("msgAllWordsRead", "success", 3000);
    updateButtonStates("completed");
    scheduleSave();
    localStorage.setItem(state.LS_KEYS.INDEX, "0"); // Reset index after completion
}

export function pauseReading() {
    if (state.readingMode === 'teleprompter') {
        const scroller = document.getElementById('teleprompter-scroller');
        if (scroller) {
            scroller.style.animationPlayState = 'paused';
        }
    } else {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }

    state.isPaused = true;
    if (dom.currentWordDisplay && state.readingMode === 'flash') {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusPaused"));
    }
    updateButtonStates("paused");
    scheduleSave();
    localStorage.setItem(state.LS_KEYS.INDEX, state.currentIndex.toString());
}

function resumeTeleprompter() {
    const scroller = document.getElementById('teleprompter-scroller');
    if (scroller) {
        scroller.style.animationPlayState = 'running';
        state.isPaused = false;
        updateButtonStates("reading");
    }
}
