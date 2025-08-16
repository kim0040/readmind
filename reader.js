// reader.js - Core speed-reading engine logic.

import { dom, getTranslation, showMessage, updateButtonStates } from "./ui.js";
import { state } from "./state.js";

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
            const wordToShow = state.words[state.currentIndex];
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
            dom.progressInfoDisplay.textContent = getTranslation(
                "progressLabelFormat",
                state.currentLanguage,
                "en",
                {
                    unit: state.NO_SPACE_LANGUAGES.includes(state.currentLanguage)
                        ? getTranslation("charsLabel")
                        : getTranslation("wordsLabel"),
                    current: state.currentIndex,
                    total: state.words.length,
                },
            );
        }
        updateProgressBar();
    } else {
        completeReadingSession();
    }
}

export function startReadingFlow(isResuming = false) {
    if (state.words.length === 0) {
        showMessage("msgNoWords", "error");
        return;
    }
    if (!isResuming) {
        state.currentIndex = 0;
        if (dom.currentWordDisplay)
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(
                getTranslation("statusPreparing"),
            );
    }
    state.isPaused = false;
    updateButtonStates("reading");

    clearTimeout(state.startDelayTimeoutId);
    state.startDelayTimeoutId = setTimeout(
        () => {
            if (state.intervalId) clearInterval(state.intervalId);
            displayNextWord();
            if (state.currentIndex < state.words.length) {
                state.intervalId = setInterval(displayNextWord, 60000 / state.currentWpm);
            }
        },
        isResuming ? 0 : START_DELAY,
    );
}

function completeReadingSession() {
    clearInterval(state.intervalId);
    state.intervalId = null;
    if (dom.currentWordDisplay)
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(
            getTranslation("statusComplete"),
        );
    showMessage("msgAllWordsRead", "success", 3000);
    updateButtonStates("completed");
    localStorage.setItem(state.LS_KEYS.TEXT, dom.textInput.value);
    localStorage.setItem(state.LS_KEYS.INDEX, state.currentIndex.toString());
}

export function pauseReading() {
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.isPaused = true;
    if (dom.currentWordDisplay)
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(
            getTranslation("statusPaused"),
        );
    updateButtonStates("paused");
    localStorage.setItem(state.LS_KEYS.TEXT, dom.textInput.value);
    localStorage.setItem(state.LS_KEYS.INDEX, state.currentIndex.toString());
}
