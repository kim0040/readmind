// text_handler.js - Handles text statistics and input changes

import { dom, getTranslation, updateButtonStates } from "./ui.js";
import { state } from "./state.js";
import { scheduleSave } from "./main.js";
import { formatWordWithFixation, updateProgressBar } from "./reader.js";

export function updateTextStats() {
    if (!dom.textInput) return;
    const currentText = dom.textInput.value;

    let words;
    if (state.NO_SPACE_LANGUAGES.includes(state.currentLanguage)) {
        words = currentText.replace(/\s+/g, "").split("");
    } else {
        words = currentText
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0);
    }

    const wordCount = words.length;

    if (state.chunkSize > 1 && !state.NO_SPACE_LANGUAGES.includes(state.currentLanguage)) {
        const chunkedWords = [];
        for (let i = 0; i < wordCount; i += state.chunkSize) {
            chunkedWords.push(words.slice(i, i + state.chunkSize));
        }
        state.words = chunkedWords;
    } else {
        state.words = words;
    }

    if (dom.charCountWithSpaceDisplay)
        dom.charCountWithSpaceDisplay.textContent = currentText.length;
    const textWithoutSpaces = currentText.replace(/\s+/g, "");
    if (dom.charCountWithoutSpaceDisplay)
        dom.charCountWithoutSpaceDisplay.textContent = textWithoutSpaces.length;
    if (dom.byteCountDisplay)
        dom.byteCountDisplay.textContent = state.encoder.encode(currentText).length;
    if (dom.wordCountDisplay) dom.wordCountDisplay.textContent = wordCount;

    const sentences = currentText.match(/[^\.!\?]+[\.!\?]+/g);
    if (dom.sentenceCountDisplay)
        dom.sentenceCountDisplay.textContent = sentences ? sentences.length : 0;
    const paragraphs =
        currentText === ""
            ? 0
            : currentText.split(/\n\s*\n/).filter((p) => p.trim() !== "").length;
    if (dom.paragraphCountDisplay)
        dom.paragraphCountDisplay.textContent =
            paragraphs || (currentText.trim() !== "" ? 1 : 0);

    if (dom.statsWpmValueDisplay) dom.statsWpmValueDisplay.textContent = state.currentWpm;
    if (dom.statsUnitLabel)
        dom.statsUnitLabel.textContent = state.NO_SPACE_LANGUAGES.includes(state.currentLanguage)
            ? "CPM"
            : "WPM";

    if (wordCount > 0 && state.currentWpm > 0) {
        const minutes = wordCount / state.currentWpm;
        const totalSeconds = Math.floor(minutes * 60);
        const displayMinutes = Math.floor(totalSeconds / 60);
        const displaySeconds = totalSeconds % 60;
        if (dom.estimatedReadingTimeDisplay) {
            dom.estimatedReadingTimeDisplay.textContent = getTranslation(
                "timeFormat",
                state.currentLanguage,
                "en",
                {
                    min: displayMinutes,
                    sec: (displaySeconds < 10 ? "0" : "") + displaySeconds,
                },
            );
        }
    } else {
        if (dom.estimatedReadingTimeDisplay)
            dom.estimatedReadingTimeDisplay.textContent =
                getTranslation("timeFormatZero");
    }
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
                total: state.words.length, // Total is now the number of chunks
            },
        );
    }
    updateProgressBar();
}

export function handleTextChange(newTextSourceOrEvent) {
    if (typeof newTextSourceOrEvent === "string") {
        dom.textInput.value = newTextSourceOrEvent;
    }
    const currentText = dom.textInput.value;

    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
        state.isPaused = false;
    }
    state.currentIndex = 0;

    updateTextStats();

    updateButtonStates(currentText.trim().length > 0 ? "initial" : "empty");

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(
            getTranslation("statusReady"),
        );
    }

    scheduleSave();
    localStorage.setItem(state.LS_KEYS.INDEX, "0");

    if (currentText.trim() && dom.textInput.placeholder !== "") {
        dom.textInput.placeholder = "";
    } else if (
        !currentText.trim() &&
        state.originalPlaceholderText &&
        dom.textInput.placeholder !== state.originalPlaceholderText
    ) {
        dom.textInput.placeholder = state.originalPlaceholderText;
    }
}
