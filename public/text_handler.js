// text_handler.js - Handles text statistics and input changes

import { dom, getTranslation, updateButtonStates, showMessage } from "./ui.js";
import { appState, readerState, LS_KEYS } from "./state.js";
import { scheduleSave } from "./main.js";
import { formatWordWithFixation, updateProgressBar } from "./reader.js";

// --- Kuromoji Tokenizer Initialization ---
let kuromojiTokenizer = null;
let isTokenizerBuilding = false;

function getTokenizer() {
    return new Promise((resolve, reject) => {
        if (kuromojiTokenizer) return resolve(kuromojiTokenizer);
        if (isTokenizerBuilding) {
            const interval = setInterval(() => {
                if (kuromojiTokenizer) {
                    clearInterval(interval);
                    resolve(kuromojiTokenizer);
                }
            }, 100);
            return;
        }
        isTokenizerBuilding = true;
        showMessage('msgTokenizerLoading', 'info', 10000);
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

    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    const emailRegex = /\S+@\S+\.\S+/g;
    const punctuationRegex = /[\[\]"“”'()（）<>【】『』「」`~#@^*_|=+\\]/g;
    const cleanedText = currentText.replace(urlRegex, '').replace(emailRegex, '').replace(punctuationRegex, '');

    let words;
    if (appState.currentLanguage === 'ja') {
        try {
            const tokenizer = await getTokenizer();
            words = tokenizer.tokenize(cleanedText).map(token => token.surface_form);
        } catch (error) {
            words = cleanedText.replace(/\s+/g, "").split("");
        }
    } else if (readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
        words = cleanedText.replace(/\s+/g, "").split("");
    } else {
        words = cleanedText.trim().split(/\s+/).filter((word) => word.length > 0);
    }

    const wordCount = words.length;

    if (readerState.chunkSize > 1 && !readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
        const chunkedWords = [];
        for (let i = 0; i < wordCount; i += readerState.chunkSize) {
            chunkedWords.push(words.slice(i, i + readerState.chunkSize));
        }
        readerState.words = chunkedWords;
    } else {
        readerState.words = words;
    }

    if (dom.charCountWithSpaceDisplay) dom.charCountWithSpaceDisplay.textContent = currentText.length;
    const textWithoutSpaces = currentText.replace(/\s+/g, "");
    if (dom.charCountWithoutSpaceDisplay) dom.charCountWithoutSpaceDisplay.textContent = textWithoutSpaces.length;
    if (dom.byteCountDisplay) dom.byteCountDisplay.textContent = appState.encoder.encode(currentText).length;
    if (dom.wordCountDisplay) dom.wordCountDisplay.textContent = wordCount;

    const sentences = currentText.match(/[^\.!\?]+[\.!\?]+/g);
    if (dom.sentenceCountDisplay) dom.sentenceCountDisplay.textContent = sentences ? sentences.length : 0;
    const paragraphs = currentText === "" ? 0 : currentText.split(/\n\s*\n/).filter((p) => p.trim() !== "").length;
    if (dom.paragraphCountDisplay) dom.paragraphCountDisplay.textContent = paragraphs || (currentText.trim() !== "" ? 1 : 0);

    if (dom.statsWpmValueDisplay) dom.statsWpmValueDisplay.textContent = readerState.currentWpm;
    if (dom.statsUnitLabel) dom.statsUnitLabel.textContent = readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage) ? "CPM" : "WPM";

    if (wordCount > 0 && readerState.currentWpm > 0) {
        const minutes = wordCount / readerState.currentWpm;
        const totalSeconds = Math.floor(minutes * 60);
        const displayMinutes = Math.floor(totalSeconds / 60);
        const displaySeconds = totalSeconds % 60;
        if (dom.estimatedReadingTimeDisplay) {
            dom.estimatedReadingTimeDisplay.textContent = getTranslation("timeFormat", appState.currentLanguage, { min: displayMinutes, sec: (displaySeconds < 10 ? "0" : "") + displaySeconds });
        }
    } else {
        if (dom.estimatedReadingTimeDisplay) dom.estimatedReadingTimeDisplay.textContent = getTranslation("timeFormatZero");
    }
    if (dom.progressInfoDisplay) {
        dom.progressInfoDisplay.textContent = getTranslation("progressLabelFormat", appState.currentLanguage, {
            unit: readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage) ? getTranslation("charsLabel") : getTranslation("wordsLabel"),
            current: readerState.currentIndex,
            total: readerState.words.length,
        });
    }
    updateProgressBar();
    updateDetailedStats(currentText);
}

function updateDetailedStats(text) {
    // textReadability is loaded from the unpkg CDN script in index.html
    if (typeof textReadability === 'undefined') {
        console.error("text-readability library not loaded.");
        return;
    }

    if (!text || text.trim() === "") {
        if (dom.readabilityScore) dom.readabilityScore.textContent = "-";
        if (dom.avgSentenceLength) dom.avgSentenceLength.textContent = "-";
        if (dom.syllableCount) dom.syllableCount.textContent = "-";
        if (dom.lexicalDiversity) dom.lexicalDiversity.textContent = "-";
        return;
    }

    try {
        if (dom.readabilityScore) {
            dom.readabilityScore.textContent = textReadability.fleschKincaidGrade(text).toFixed(1);
        }
        if (dom.avgSentenceLength) {
            const wordCount = textReadability.lexiconCount(text);
            const sentenceCount = textReadability.sentenceCount(text);
            if (sentenceCount > 0) {
                dom.avgSentenceLength.textContent = (wordCount / sentenceCount).toFixed(1);
            } else {
                dom.avgSentenceLength.textContent = wordCount > 0 ? wordCount.toFixed(1) : "-";
            }
        }
        if (dom.syllableCount) {
            dom.syllableCount.textContent = textReadability.syllableCount(text);
        }
        if (dom.lexicalDiversity) {
            const wordCount = textReadability.lexiconCount(text);
            const uniqueWords = [...new Set(text.toLowerCase().match(/\b\w+\b/g) || [])].length;
            if (wordCount > 0) {
                const diversity = (uniqueWords / wordCount) * 100;
                dom.lexicalDiversity.textContent = diversity.toFixed(1) + '%';
            } else {
                dom.lexicalDiversity.textContent = "-";
            }
        }
    } catch (error) {
        console.error("Error calculating detailed stats:", error);
        if (dom.readabilityScore) dom.readabilityScore.textContent = "N/A";
        if (dom.avgSentenceLength) dom.avgSentenceLength.textContent = "N/A";
        if (dom.syllableCount) dom.syllableCount.textContent = "N/A";
        if (dom.lexicalDiversity) dom.lexicalDiversity.textContent = "N/A";
    }
}

export async function handleTextChange(newTextSourceOrEvent) {
    if (typeof newTextSourceOrEvent === "string") {
        dom.textInput.value = newTextSourceOrEvent;
    }
    const currentText = dom.textInput.value;

    if (readerState.intervalId) {
        clearInterval(readerState.intervalId);
        readerState.intervalId = null;
        readerState.isPaused = false;
    }
    readerState.currentIndex = 0;

    await updateTextStats();

    updateButtonStates(currentText.trim().length > 0 ? "initial" : "empty");

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusReady"));
    }

    scheduleSave();
    localStorage.setItem(LS_KEYS.INDEX, "0");

    if (currentText.trim() && dom.textInput.placeholder !== "") {
        dom.textInput.placeholder = "";
    } else if (!currentText.trim() && appState.originalPlaceholderText && dom.textInput.placeholder !== appState.originalPlaceholderText) {
        dom.textInput.placeholder = appState.originalPlaceholderText;
    }
}
