// reader_core.js - framework-agnostic speed reading core
// This module contains the minimal engine logic (no DOM knowledge)

export class SpeedReaderCore {
    constructor(options) {
        this.getWords = options.getWords; // () => string[] | string[][]
        this.onChunk = options.onChunk;   // (chunkText: string) => void
        this.onProgress = options.onProgress; // (index, total) => void
        this.onStatus = options.onStatus; // (statusKey: string) => void
        this.onComplete = options.onComplete; // () => void
        this.getWpm = options.getWpm;     // () => number
        this.getMode = options.getMode;   // () => 'flash' | 'teleprompter'

        this.index = 0;
        this.timer = null;
        this.startDelayId = null;
        this.isPaused = false;
    }

    get intervalMs() {
        const wpm = Math.max(50, Math.min(500, Number(this.getWpm?.() || 250)));
        return 60000 / wpm;
    }

    // 단어 길이와 복잡도에 따른 적응형 속도 계산
    getAdaptiveInterval(word) {
        const baseInterval = this.intervalMs;
        
        if (!word) return baseInterval;
        
        const wordText = Array.isArray(word) ? word.join(' ') : String(word);
        const length = wordText.length;
        
        // 한국어 친화적 길이별 시간 조정
        let multiplier = 1;
        if (length <= 2) {
            multiplier = 0.9; // 짧은 단어는 약간 빠르게 (한국어 특성 고려)
        } else if (length >= 5) {
            multiplier = 1.2; // 긴 단어는 적당히 느리게
        } else if (length >= 4) {
            multiplier = 1.05; // 중간 단어는 미세 조정
        }
        
        // 특수 문자나 숫자가 포함된 경우 시간 추가
        if (/[0-9]/.test(wordText)) {
            multiplier *= 1.2; // 숫자는 처리 시간 추가
        }
        if (/[^\w\s가-힣]/.test(wordText)) {
            multiplier *= 1.1; // 특수문자 처리 시간 추가
        }
        
        return Math.round(baseInterval * multiplier);
    }

    resetToStart() {
        this.index = 0;
    }

    start(isResuming = false, delayMs = 1000) {
        const words = this.getWords?.() || [];
        const total = Array.isArray(words) ? words.length : 0;
        if (total === 0) {
            this.onStatus?.('msgNoWords');
            return;
        }
        if (!isResuming) this.resetToStart();

        this.isPaused = false;
        this.onStatus?.('statusPreparing');

        clearTimeout(this.startDelayId);
        this.startDelayId = setTimeout(() => {
            clearInterval(this.timer);
            this.tick();
            this.scheduleNextTick();
        }, isResuming ? 0 : delayMs);
    }

    tick() {
        const words = this.getWords?.() || [];
        const total = words.length;
        if (this.index >= total) {
            this.complete();
            return;
        }
        const chunk = words[this.index];
        const chunkText = Array.isArray(chunk) ? chunk.join(' ') : String(chunk);
        this.onChunk?.(chunkText);
        this.index += 1;
        this.onProgress?.(this.index, total);
        
        // 다음 단어 예약
        this.scheduleNextTick();
    }

    scheduleNextTick() {
        const words = this.getWords?.() || [];
        if (this.index < words.length && !this.isPaused) {
            const currentWord = words[this.index];
            const nextInterval = this.getAdaptiveInterval(currentWord);
            this.timer = setTimeout(() => this.tick(), nextInterval);
        }
    }

    pause() {
        clearTimeout(this.timer);
        this.timer = null;
        this.isPaused = true;
        this.onStatus?.('statusPaused');
    }

    complete() {
        clearTimeout(this.timer);
        this.timer = null;
        this.onStatus?.('statusComplete');
        this.onComplete?.();
    }

    updateSpeed() {
        // 실행 중인 경우에만 타이머 재설정
        if (this.timer && !this.isPaused) {
            clearTimeout(this.timer);
            this.scheduleNextTick();
        }
    }
}


