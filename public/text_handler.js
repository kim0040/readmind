// text_handler.js - 텍스트 통계 계산 및 입력 변화 감지 처리

import { dom, getTranslation, updateButtonStates } from './ui.js';
import { appState, readerState, documentState, LS_KEYS } from './state.js';
import { scheduleSave } from './save_manager.js';
import { formatWordWithFixation, updateProgressBar } from './reader_view.js';
import { cleanText, segmentJapaneseWithKuromoji, chunkIfNeeded } from './core/text_core.js';

let kuromojiTokenizer = null;

async function getTokenizer() {
    if (kuromojiTokenizer) return kuromojiTokenizer;
    console.log("일본어 사전을 로딩합니다...");
    return new Promise((resolve, reject) => {
        kuromoji.builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji/dict/" }).build((err, tokenizer) => {
            if (err) {
                console.error("Kuromoji 사전 생성 실패:", err);
                reject(err);
            } else {
                kuromojiTokenizer = tokenizer;
                console.log("일본어 사전 로딩 완료.");
                resolve(tokenizer);
            }
        });
    });
}

/**
 * 브라우저 Intl Segmenter API를 활용해 텍스트를 분절한다.
 */
function segmentTextWithBrowserAPI(text) {
    try {
        const segmenter = new Intl.Segmenter(appState.currentLanguage, { granularity: 'word' });
        return Array.from(segmenter.segment(text)).map(s => s.segment);
    } catch (error) {
        console.warn('Intl.Segmenter를 지원하지 않아 문자 단위 분할로 대체합니다');
        return text.split('');
    }
}

/**
 * 한국어 문장을 속독에 적합한 길이로 분할한다.
 */
function segmentKoreanText(text) {
    // 한국어는 기본적으로 어절 단위로 처리 (자연스러운 읽기)
    const words = [];
    const segments = text.split(/\s+/);
    
    for (const segment of segments) {
        if (segment.trim()) {
            // 한글이 포함된 경우
            if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(segment)) {
                // 어절이 너무 길면(6글자 이상) 적절히 분리, 아니면 그대로 유지
                if (segment.length > 6) {
                    const koreanWords = [];
                    let currentWord = '';
                    
                    for (let i = 0; i < segment.length; i++) {
                        const char = segment[i];
                        currentWord += char;
                        
                        // 3-4글자 단위로 자연스럽게 분리
                        if (currentWord.length >= 3 || i === segment.length - 1) {
                            if (currentWord.trim()) {
                                koreanWords.push(currentWord);
                            }
                            currentWord = '';
                        }
                    }
                    
                    words.push(...koreanWords);
                } else {
                    // 어절이 적당한 길이면 그대로 유지 (자연스러운 읽기)
                    words.push(segment);
                }
            } else {
                // 영문이나 숫자는 그대로 유지
                words.push(segment);
            }
        }
    }
    
    return words.filter(word => word.length > 0);
}

/**
 * 편집기 내용을 기반으로 통계와 단어 청크를 재계산한다.
 */
export async function updateTextStats() {
    const currentText = documentState.simplemde ? documentState.simplemde.value() : (dom.textInput?.value || '');
    const cleanedText = cleanText(currentText);

    // 텍스트가 비어있으면 초기화
    if (!cleanedText.trim()) {
        readerState.words = [];
        readerState.currentIndex = 0;
        if (dom.wordCountDisplay) dom.wordCountDisplay.textContent = '0';
        if (dom.charCountDisplay) dom.charCountDisplay.textContent = '0';
        if (dom.readingTimeDisplay) dom.readingTimeDisplay.textContent = '0';
        if (dom.progressInfoDisplay) dom.progressInfoDisplay.textContent = '';
        updateProgressBar();
        updateButtonStates('initial');
        return;
    }

    let words;
    if (appState.currentLanguage === 'ja') {
        words = await segmentJapaneseWithKuromoji(cleanedText, getTokenizer);
    } else if (appState.currentLanguage === 'ko') {
        words = segmentKoreanText(cleanedText);
    } else if (readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)) {
        words = segmentTextWithBrowserAPI(cleanedText);
    } else {
        words = cleanedText.trim().split(/\s+/).filter(Boolean);
    }

    const wordCount = words.length;

    readerState.words = chunkIfNeeded(
        words,
        readerState.chunkSize,
        readerState.NO_SPACE_LANGUAGES.includes(appState.currentLanguage)
    );

    // 통계 업데이트
    if (dom.wordCountDisplay) dom.wordCountDisplay.textContent = wordCount;
    if (dom.charCountDisplay) dom.charCountDisplay.textContent = cleanedText.length;
    if (dom.readingTimeDisplay) {
        const readingTime = Math.ceil(wordCount / (readerState.currentWpm / 60));
        dom.readingTimeDisplay.textContent = readingTime;
    }
    
    updateProgressBar();
    updateDetailedStats(cleanedText);
    updateButtonStates(readerState.isPaused ? 'paused' : 'initial');
}

/**
 * 외부 의존성 없이 경량 가독성 지표를 계산한다.
 */
function updateDetailedStats(text) {
    // 외부 라이브러리 없이 경량 통계 산출
    const stats = {
        readabilityScore: "-",
        avgSentenceLength: "-",
        syllableCount: "-",
        lexicalDiversity: "-",
    };

    if (text && text.trim() !== "") {
        try {
            const sentences = text.split(/[.!?\n]+/).filter(Boolean);
            const words = (text.match(/\b\w+\b/g) || []).map(w => w.toLowerCase());
            const vowels = (text.match(/[aeiouAEIOU가-힣]/g) || []).length; // 간이 음절수
            const uniqueWords = new Set(words).size;
            const wordCount = words.length;
            const sentenceCount = sentences.length || 1;
            stats.avgSentenceLength = (wordCount / sentenceCount).toFixed(1);
            stats.syllableCount = vowels;
            stats.lexicalDiversity = wordCount > 0 ? `${((uniqueWords / wordCount) * 100).toFixed(1)}%` : "0%";
            stats.readabilityScore = (0.39 * (wordCount / sentenceCount) + 11.8 * (vowels / Math.max(wordCount,1)) - 15.59).toFixed(1);
        } catch (error) {
            console.error("경량 통계 계산 중 오류가 발생했습니다:", error);
        }
    }

    if (dom.readabilityScore) dom.readabilityScore.textContent = String(stats.readabilityScore);
    if (dom.avgSentenceLength) dom.avgSentenceLength.textContent = String(stats.avgSentenceLength);
    if (dom.syllableCount) dom.syllableCount.textContent = String(stats.syllableCount);
    if (dom.lexicalDiversity) dom.lexicalDiversity.textContent = String(stats.lexicalDiversity);
}

/**
 * 새로운 텍스트를 적용하고 읽기 상태를 처음부터 재시작한다.
 */
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
