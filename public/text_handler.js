// text_handler.js - Handles text statistics and input changes

import { dom, getTranslation, updateButtonStates } from "./ui.js";
import { appState, readerState, documentState, LS_KEYS } from "./state.js";
import { scheduleSave } from "./main.js";
import { formatWordWithFixation, updateProgressBar } from "./reader.js";

let kuromojiTokenizer = null;

async function getTokenizer() {
    if (kuromojiTokenizer) return kuromojiTokenizer;
    console.log("Loading Japanese dictionary...");
    return new Promise((resolve, reject) => {
        kuromoji.builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji/dict/" }).build((err, tokenizer) => {
            if (err) {
                console.error("Kuromoji Build Error:", err);
                reject(err);
            } else {
                kuromojiTokenizer = tokenizer;
                console.log("Japanese dictionary loaded.");
                resolve(tokenizer);
            }
        });
    });
}

function segmentTextWithBrowserAPI(text) {
    const segmenter = new Intl.Segmenter(appState.currentLanguage, { granularity: 'word' });
    return Array.from(segmenter.segment(text)).map(s => s.segment);
}

export async function updateTextStats() {
    const currentText = documentState.simplemde ? documentState.simplemde.value() : (dom.textInput?.value || '');
    const cleanedText = currentText.replace(/[\[\]"“”'()（）<>【】『』「」`~#@^*_|=+\\]/g, '');

    let words;
    if (appState.currentLanguage === 'ja') {
        try {
            const tokenizer = await getTokenizer();
            words = tokenizer.tokenize(cleanedText).map(token => token.surface_form);
        } catch (error) {
            words = cleanedText.split(''); // Fallback
        }
    } else if (readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
        words = segmentTextWithBrowserAPI(cleanedText);
    } else {
        words = cleanedText.trim().split(/\s+/).filter(Boolean);
    }

    const wordCount = words.length;

    if (readerState.chunkSize > 1 && !readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
        const chunkedWords = [];
        for (let i = 0; i < wordCount; i += readerState.chunkSize) {
            chunkedWords.push(words.slice(i, i + readerState.chunkSize).join(' '));
        }
        readerState.words = chunkedWords;
    } else {
        readerState.words = words;
    }

    updateProgressBar();
    updateDetailedStats(cleanedText);
}

function updateDetailedStats(text) {
    if (typeof textReadability === 'undefined') return;

    const stats = {
        readabilityScore: "-",
        avgSentenceLength: "-",
        syllableCount: "-",
        lexicalDiversity: "-",
    };

    if (text && text.trim() !== "") {
        try {
            stats.readabilityScore = textReadability.fleschKincaidGrade(text).toFixed(1);
            const wordCount = textReadability.lexiconCount(text);
            const sentenceCount = textReadability.sentenceCount(text);
            stats.avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : wordCount;
            stats.syllableCount = textReadability.syllableCount(text);
            const uniqueWords = [...new Set(text.toLowerCase().match(/\b\w+\b/g) || [])].length;
            stats.lexicalDiversity = wordCount > 0 ? `${((uniqueWords / wordCount) * 100).toFixed(1)}%` : "0%";
        } catch (error) {
            console.error("Error calculating detailed stats:", error);
            Object.keys(stats).forEach(key => stats[key] = "N/A");
        }
    }

    if (dom.readabilityScore) dom.readabilityScore.textContent = stats.readabilityScore;
    if (dom.avgSentenceLength) dom.avgSentenceLength.textContent = stats.avgSentenceLength;
    if (dom.syllableCount) dom.syllableCount.textContent = stats.syllableCount;
    if (dom.lexicalDiversity) dom.lexicalDiversity.textContent = stats.lexicalDiversity;
}

export async function handleTextChange(newTextSourceOrEvent) {
    const newText = (typeof newTextSourceOrEvent === "string") ? newTextSourceOrEvent : (documentState.simplemde ? documentState.simplemde.value() : '');

    if (documentState.simplemde) {
        documentState.simplemde.value(newText);
    }

    if (readerState.intervalId) {
        clearInterval(readerState.intervalId);
        readerState.intervalId = null;
    }
    readerState.isPaused = false;
    readerState.currentIndex = 0;

    await updateTextStats();
    updateButtonStates("initial");

    if (dom.currentWordDisplay) {
        dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusReady"));
    }

    scheduleSave();
    localStorage.setItem(LS_KEYS.INDEX, "0");
}
