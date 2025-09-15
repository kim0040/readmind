// text_core.js - framework-agnostic text normalization and segmentation

export function cleanText(raw) {
    if (!raw) return '';
    
    let text = String(raw);
    
    // 마크다운 헤더 제거 (# ## ### 등)
    text = text.replace(/^#{1,6}\s+/gm, '');
    
    // 마크다운 링크 제거 [텍스트](URL) → 텍스트만 유지
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // 이미지 링크 완전 제거 ![alt](src)
    text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
    
    // 인라인 코드 제거 `code`
    text = text.replace(/`([^`]+)`/g, '$1');
    
    // 코드 블록 제거 ```code```
    text = text.replace(/```[\s\S]*?```/g, '');
    
    // 볼드/이탤릭 마크다운 제거 **text** *text* __text__ _text_
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');
    
    // 취소선 제거 ~~text~~
    text = text.replace(/~~(.*?)~~/g, '$1');
    
    // 인용문 제거 > text
    text = text.replace(/^\s*>\s*/gm, '');
    
    // 리스트 마커 제거 - * + 1. 2. 등
    text = text.replace(/^\s*[-*+]\s+/gm, '');
    text = text.replace(/^\s*\d+\.\s+/gm, '');
    
    // 수평선 제거 --- *** ___
    text = text.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '');
    
    // 테이블 구분자 제거 | --- |
    text = text.replace(/^\|.*\|$/gm, '');
    text = text.replace(/^\|?\s*:?-+:?\s*\|.*$/gm, '');
    
    // HTML 태그 제거
    text = text.replace(/<[^>]*>/g, '');
    
    // 남은 특수문자들 제거
    text = text.replace(/[\[\]"""'()（）<>【】『』「」`~@^|=+\\]/g, '');
    
    // 여러 공백을 하나로 통합하고 줄바꿈 정리
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n');
    
    return text.trim();
}

export function isKorean(text) {
    return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
}

export function segmentKoreanMeaningful(text) {
    const words = [];
    const segments = text.split(/\s+/);
    for (const segment of segments) {
        if (!segment.trim()) continue;
        if (isKorean(segment)) {
            let buf = '';
            for (let i = 0; i < segment.length; i++) {
                buf += segment[i];
                if (buf.length >= 2 && (i === segment.length - 1 || /[.,!?;:]/.test(segment[i + 1]) || buf.length >= 3)) {
                    words.push(buf);
                    buf = '';
                }
            }
            if (buf) words.push(buf);
        } else {
            words.push(segment);
        }
    }
    return words.filter(Boolean);
}

export function segmentByIntl(text, lang) {
    try {
        const seg = new Intl.Segmenter(lang, { granularity: 'word' });
        return Array.from(seg.segment(text)).map(s => s.segment);
    } catch {
        return text.split('');
    }
}

export async function segmentJapaneseWithKuromoji(text, getTokenizer) {
    try {
        const tokenizer = await getTokenizer();
        return tokenizer.tokenize(text).map(t => t.surface_form);
    } catch {
        return text.split('');
    }
}

export function chunkIfNeeded(words, chunkSize, noSpaceLanguage) {
    if (!Array.isArray(words)) return [];
    if (chunkSize > 1 && !noSpaceLanguage) {
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        return chunks;
    }
    return words;
}


