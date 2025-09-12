// text_handler.js - Handles text statistics and input changes

import { dom, getTranslation, updateButtonStates, showMessage } from "./ui.js";
import { state } from "./state.js";
import { scheduleSave } from "./main.js";
import { formatWordWithFixation, updateProgressBar } from "./reader.js";

// --- Kuromoji Tokenizer Initialization ---
let kuromojiTokenizer = null;
let isTokenizerBuilding = false;

/**
 * Initializes the Kuromoji tokenizer. Uses a promise-based approach
 * to handle the callback nature of the library.
 * @returns {Promise<object>} A promise that resolves with the tokenizer instance.
 */
function getTokenizer() {
    return new Promise((resolve, reject) => {
        if (kuromojiTokenizer) {
            return resolve(kuromojiTokenizer);
        }
        if (isTokenizerBuilding) {
            // Wait for the tokenizer to finish building
            const interval = setInterval(() => {
                if (kuromojiTokenizer) {
                    clearInterval(interval);
                    resolve(kuromojiTokenizer);
                }
            }, 100);
            return;
        }
        isTokenizerBuilding = true;
        showMessage('msgTokenizerLoading', 'info', 10000); // Show a long-lasting message

        kuromoji.builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji/dict/" }).build((err, tokenizer) => {
            isTokenizerBuilding = false;
            if (err) {
                console.error("Kuromoji Build Error:", err);
                showMessage('msgTokenizerError', 'error');
                return reject(err);
            }
            kuromojiTokenizer = tokenizer;
            showMessage('msgTokenizerReady', 'success');
            resolve(tokenizer);
        });
    });
}


export async function updateTextStats() {
    if (!dom.textInput) return;
    const currentText = dom.textInput.value;

    // --- Text Cleaning ---
    // Remove URLs, email addresses, and other special characters that disrupt reading flow.
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    const emailRegex = /\S+@\S+\.\S+/g;
    const punctuationRegex = /[\[\]"“”'()（）<>【】『』「」`~#@^*_|=+\\]/g;
    const cleanedText = currentText.replace(urlRegex, '').replace(emailRegex, '').replace(punctuationRegex, '');

    let words;
    if (state.currentLanguage === 'ja') {
        try {
            const tokenizer = await getTokenizer();
            words = tokenizer.tokenize(cleanedText).map(token => token.surface_form);
        } catch (error) {
            // Fallback to character splitting on error
            words = cleanedText.replace(/\s+/g, "").split("");
        }
    } else if (state.NO_SPACE_LANGUAGES.includes(state.currentLanguage)) {
        words = cleanedText.replace(/\s+/g, "").split("");
    } else {
        words = cleanedText
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
                total: state.words.length,
            },
        );
    }
    updateProgressBar();
}

export async function handleTextChange(newTextSourceOrEvent) {
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

    await updateTextStats();

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
