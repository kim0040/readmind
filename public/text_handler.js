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

function segmentTextWithBrowserAPI(text) {
    const words = [];
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.innerText = text;
    document.body.appendChild(tempDiv);

    const selection = window.getSelection();
    if (!selection) return text.split(''); // Fallback
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    selection.removeAllRanges();
    selection.addRange(range);

    let currentPos = 0;
    while (currentPos < text.length) {
        selection.collapse(tempDiv.firstChild, currentPos);
        selection.modify('move', 'forward', 'word');
        selection.modify('extend', 'forward', 'word');

        let word = selection.toString();
        if (word.trim().length > 0) {
            words.push(word);
        }

        const endOffset = selection.getRangeAt(0).endOffset;
        if (endOffset === currentPos) { // Break if we are not making progress
            break;
        }
        currentPos = endOffset;
    }

    document.body.removeChild(tempDiv);
    selection.removeAllRanges();
    return words.filter(w => w.trim().length > 0);
}

export async function updateTextStats() {
    if (!dom.textInput) return;
    const currentText = documentState.simplemde ? documentState.simplemde.value() : dom.textInput.value;

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
        words = segmentTextWithBrowserAPI(cleanedText);
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

    updateProgressBar();
    updateDetailedStats(cleanedText);
}

function updateDetailedStats(text) {
    if (typeof textReadability === 'undefined') {
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
        if (dom.readabilityScore) dom.readabilityScore.textContent = textReadability.fleschKincaidGrade(text).toFixed(1);
        const wordCount = textReadability.lexiconCount(text);
        const sentenceCount = textReadability.sentenceCount(text);
        if (dom.avgSentenceLength) {
            dom.avgSentenceLength.textContent = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : (wordCount > 0 ? wordCount.toFixed(1) : "-");
        }
        if (dom.syllableCount) dom.syllableCount.textContent = textReadability.syllableCount(text);
        if (dom.lexicalDiversity) {
            const uniqueWords = [...new Set(text.toLowerCase().match(/\b\w+\b/g) || [])].length;
            dom.lexicalDiversity.textContent = wordCount > 0 ? ((uniqueWords / wordCount) * 100).toFixed(1) + '%' : "-";
        }
    } catch (error) {
        console.error("Error calculating detailed stats:", error);
    }
}

export async function handleTextChange(newTextSourceOrEvent) {
    if (typeof newTextSourceOrEvent === "string") {
        if (documentState.simplemde) documentState.simplemde.value(newTextSourceOrEvent);
    }
    const currentText = documentState.simplemde ? documentState.simplemde.value() : '';

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
}
