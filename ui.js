// ui.js - UI logic, DOM manipulation, and event listeners.

import { state } from "./state.js";
import { formatWordWithFixation, pauseReading, startReadingFlow } from "./reader.js";
import { handleTextChange, updateTextStats } from "./text_handler.js";

export const dom = {
    // Existing DOM elements
    textInput: document.getElementById("text-input"),
    fileInput: document.getElementById("file-input"),
    wpmInput: document.getElementById("wpm-input"),
    startButton: document.getElementById("start-button"),
    startButtonText: document.getElementById("start-button-text"),
    pauseButton: document.getElementById("pause-button"),
    pauseButtonText: document.getElementById("pause-button-text"),
    resetButton: document.getElementById("reset-button"),
    currentWordDisplay: document.getElementById("current-word"),
    progressInfoDisplay: document.getElementById("progress-info"),
    darkModeToggle: document.getElementById("dark-mode-toggle"),
    themeToggleDarkIcon: document.getElementById("theme-toggle-dark-icon"),
    themeToggleLightIcon: document.getElementById("theme-toggle-light-icon"),
    fixationToggle: document.getElementById("fixation-toggle"),
    customMessageBox: document.getElementById("custom-message-box"),
    messageText: document.getElementById("message-text"),
    charCountWithSpaceDisplay: document.getElementById("char-count-with-space"),
    charCountWithoutSpaceDisplay: document.getElementById("char-count-without-space"),
    byteCountDisplay: document.getElementById("byte-count"),
    wordCountDisplay: document.getElementById("word-count"),
    sentenceCountDisplay: document.getElementById("sentence-count"),
    paragraphCountDisplay: document.getElementById("paragraph-count"),
    estimatedReadingTimeDisplay: document.getElementById("estimated-reading-time"),
    statsWpmValueDisplay: document.getElementById("stats-wpm-value"),
    statsUnitLabel: document.getElementById("stats-unit-label"),
    wpmCpmLabel: document.getElementById("wpm-cpm-label"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    currentYearSpan: document.getElementById("current-year"),
    languageSelector: document.getElementById("language-selector"),
    siteTitleH1: document.getElementById("site-title"),
    contactLink: document.getElementById("contact-link"),
    clearTextButton: document.getElementById("clear-text-button"),

    // Auth Modal Elements
    authButton: document.getElementById("auth-button"),
    authModalOverlay: document.getElementById("auth-modal-overlay"),
    authModal: document.getElementById("auth-modal"),
    closeAuthModalButton: document.getElementById("close-auth-modal"),
    authModalTitle: document.getElementById("auth-modal-title"),
    authForm: document.getElementById("auth-form"),
    authSubmitButton: document.getElementById("auth-submit-button"),
    authSwitchText: document.getElementById("auth-switch-text"),
    authSwitchButton: document.getElementById("auth-switch-button"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),
};

let isLoginMode = true;

function openAuthModal() {
    if (!dom.authModalOverlay) return;
    dom.authModalOverlay.classList.remove('hidden');
    dom.authModalOverlay.style.display = 'flex';
    setTimeout(() => {
        dom.authModalOverlay.classList.add('show');
    }, 10);
}

function closeAuthModal() {
    if (!dom.authModalOverlay) return;
    dom.authModalOverlay.classList.remove('show');
    setTimeout(() => {
        dom.authModalOverlay.classList.add('hidden');
        dom.authModalOverlay.style.display = 'none';
    }, 300);
}

function setupAuthModal(isLogin) {
    isLoginMode = isLogin;
    if (isLogin) {
        dom.authModalTitle.textContent = getTranslation("loginTitle");
        dom.authSubmitButton.textContent = getTranslation("loginButton");
        dom.authSwitchText.textContent = getTranslation("signupPrompt");
        dom.authSwitchButton.textContent = getTranslation("signupLink");
    } else {
        dom.authModalTitle.textContent = getTranslation("signupTitle");
        dom.authSubmitButton.textContent = getTranslation("signupLink");
        dom.authSwitchText.textContent = getTranslation("loginPrompt");
        dom.authSwitchButton.textContent = getTranslation("loginLink");
    }
}


export function getTranslation(key, lang = state.currentLanguage, fallbackLang = "en", params = null) {
    const langToUse = translations[lang] ? lang : fallbackLang;
    let text =
        translations[langToUse]?.[key] ||
        translations[fallbackLang]?.[key] ||
        key;
    if (params) {
        for (const pKey in params) {
            text = text.replace(new RegExp(`{${pKey}}`, "g"), params[pKey]);
        }
    }
    return text;
}

export function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add("dark");
        if (dom.themeToggleDarkIcon) dom.themeToggleDarkIcon.classList.remove("hidden");
        if (dom.themeToggleLightIcon) dom.themeToggleLightIcon.classList.add("hidden");
    } else {
        document.documentElement.classList.remove("dark");
        if (dom.themeToggleLightIcon) dom.themeToggleLightIcon.classList.remove("hidden");
        if (dom.themeToggleDarkIcon) dom.themeToggleDarkIcon.classList.add("hidden");
    }
}

export function setLanguage(lang, isInitializing = false) {
    state.currentLanguage = lang;
    localStorage.setItem(state.LS_KEYS.LANGUAGE, lang);
    if (dom.languageSelector) dom.languageSelector.value = lang;
    if (document.documentElement) document.documentElement.lang = lang;

    if (dom.siteTitleH1) {
        const nativeName = getTranslation("siteNativeName");
        const appNameEn = "ReadMind";
        let titleHtml = "";
        if (nativeName && nativeName !== appNameEn && translations[state.currentLanguage]?.siteNativeName) {
            titleHtml = `${nativeName} <small class="site-title-sub">(${appNameEn})</small>`;
        } else {
            titleHtml = appNameEn;
        }
        dom.siteTitleH1.innerHTML = titleHtml;
    }

    if (document) document.title = getTranslation("pageTitle");

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
        const key = el.dataset.langKey;
        const translation = getTranslation(key);
        if (el.tagName === "TEXTAREA" && el.hasAttribute("placeholder")) {
            if (el.id === "text-input") {
                state.originalPlaceholderText = translation;
                if (!dom.textInput.value.trim()) {
                    el.placeholder = state.originalPlaceholderText;
                } else {
                    el.placeholder = "";
                }
            } else {
                el.placeholder = translation;
            }
        } else if (!["start-button-text", "pause-button-text", "reset-button-text"].includes(el.id)) {
            if (el.id === "progress-info" && key === "progressLabelFormat") {
                // handled by updateTextStats
            } else if (el.id === "estimated-reading-time" && key === "timeFormatZero") {
                // handled by updateTextStats
            } else if (el.id === "wpm-cpm-label") {
                el.innerHTML =
                    getTranslation(state.NO_SPACE_LANGUAGES.includes(state.currentLanguage) ? "cpmLabel" : "wpmLabel") +
                    ` <span id="wpm-value" class="font-semibold text-sky-500 dark:text-sky-400">${state.currentWpm}</span>`;
            } else {
                el.innerHTML = translation;
            }
        }
    });

    if (!isInitializing) {
        updateTextStats();
        updateButtonStates(state.isPaused ? "paused" : state.intervalId ? "reading" : "initial");
    }

    if (dom.currentWordDisplay) {
        const statusKeysMap = {
            Ready: "statusReady", "Complete!": "statusComplete", Paused: "statusPaused",
            Error: "statusError", "Preparing...": "statusPreparing",
        };
        const currentTextContent = dom.currentWordDisplay.textContent.replace(/<[^>]*>/g, "").trim();
        let currentStatusKey = null;
        for (const enStatusText in statusKeysMap) {
            const tempStatusKey = statusKeysMap[enStatusText];
            for (const langCode in translations) {
                if (currentTextContent === getTranslation(tempStatusKey, langCode, "en")) {
                    currentStatusKey = tempStatusKey;
                    break;
                }
            }
            if (currentStatusKey) break;
        }
        if (currentStatusKey) {
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation(currentStatusKey));
        } else if (state.words && state.words.length > 0 && state.currentIndex >= 0 && state.currentIndex < state.words.length && state.words[state.currentIndex] !== undefined) {
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(state.words[state.currentIndex]);
        } else if (!state.words || state.words.length === 0) {
            dom.currentWordDisplay.innerHTML = formatWordWithFixation(getTranslation("statusReady"));
        }
    }
    if (dom.statsUnitLabel) {
        dom.statsUnitLabel.textContent = state.NO_SPACE_LANGUAGES.includes(state.currentLanguage) ? "CPM" : "WPM";
    }
    if (dom.wpmCpmLabel) {
        dom.wpmCpmLabel.innerHTML =
            getTranslation(state.NO_SPACE_LANGUAGES.includes(state.currentLanguage) ? "cpmLabel" : "wpmLabel") +
            ` <span id="wpm-value" class="font-semibold text-sky-500 dark:text-sky-400">${state.currentWpm}</span>`;
    }
}

export function showMessage(messageKey, type = "info", duration = 3000, interpolateParams = null) {
    if (!dom.customMessageBox || !dom.messageText) return;
    dom.messageText.textContent = getTranslation(messageKey, state.currentLanguage, "en", interpolateParams);
    dom.customMessageBox.className = `message-box ${type}`;
    dom.customMessageBox.style.opacity = "0";
    dom.customMessageBox.style.visibility = "hidden";
    dom.customMessageBox.style.transform = "translateX(-50%) translateY(-100%)";

    setTimeout(() => {
        dom.customMessageBox.classList.add("show");
        dom.customMessageBox.style.opacity = "1";
        dom.customMessageBox.style.visibility = "visible";
        dom.customMessageBox.style.transform = "translateX(-50%) translateY(0)";
    }, 20);

    setTimeout(() => {
        if (dom.customMessageBox) {
            dom.customMessageBox.style.opacity = "0";
            dom.customMessageBox.style.transform = "translateX(-50%) translateY(-100%)";
            setTimeout(() => {
                if (dom.customMessageBox) {
                    dom.customMessageBox.classList.remove("show");
                    dom.customMessageBox.style.visibility = "hidden";
                }
            }, 300);
        }
    }, duration);
}

export function updateButtonStates(buttonState) {
    if (!dom.startButton || !dom.pauseButton || !dom.resetButton || !dom.startButtonText || !dom.pauseButtonText || !document.getElementById("reset-button-text")) return;

    dom.startButtonText.textContent = getTranslation("startButton");
    dom.pauseButtonText.textContent = getTranslation("pauseButton");
    document.getElementById("reset-button-text").textContent = getTranslation("resetButton");

    switch (buttonState) {
        case "initial":
            dom.startButton.disabled = false;
            dom.pauseButton.disabled = true;
            dom.resetButton.disabled = true;
            break;
        case "reading":
            dom.startButton.disabled = true;
            dom.pauseButton.disabled = false;
            dom.resetButton.disabled = false;
            break;
        case "paused":
            dom.startButton.disabled = false;
            dom.pauseButton.disabled = true;
            dom.resetButton.disabled = false;
            dom.startButtonText.textContent = getTranslation("resumeButton");
            break;
        case "completed":
            dom.startButton.disabled = false;
            dom.pauseButton.disabled = true;
            dom.resetButton.disabled = false;
            break;
        case "empty":
            dom.startButton.disabled = true;
            dom.pauseButton.disabled = true;
            dom.resetButton.disabled = true;
            break;
    }
    if (dom.clearTextButton) {
        dom.clearTextButton.disabled = !(dom.textInput && dom.textInput.value.length > 0);
    }
}

export function attachEventListeners() {
    // Existing event listeners...
    if (dom.contactLink) {
        dom.contactLink.addEventListener("click", (e) => {
            e.preventDefault();
            const subject = encodeURIComponent(getTranslation("contactEmailSubject"));
            const body = encodeURIComponent(
                getTranslation("contactEmailBody", state.currentLanguage, "en", {
                    appVersion: state.APP_VERSION,
                    osInfo: navigator.platform,
                    browserInfo: navigator.userAgent,
                    errorTime: new Date().toISOString(),
                }),
            );
            window.location.href = `mailto:${state.CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        });
    }

    if (dom.clearTextButton) {
        dom.clearTextButton.addEventListener("click", () => {
            if (dom.textInput) {
                handleTextChange("");
                showMessage("msgTextCleared", "success");
            }
        });
    }

    if (dom.fileInput) {
        dom.fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            if (dom.textInput) {
                                handleTextChange(e.target.result);
                                showMessage("msgFileLoadSuccess", "success");
                            }
                        } catch (error) {
                            console.error("Error processing loaded file content:", error);
                            showMessage("msgFileLoadError", "error");
                        } finally {
                            if (dom.fileInput) dom.fileInput.value = "";
                        }
                    };
                    reader.onerror = (readError) => {
                        console.error("FileReader error:", readError);
                        showMessage("msgFileLoadError", "error");
                        if (dom.fileInput) dom.fileInput.value = "";
                    };
                    reader.readAsText(file);
                } else {
                    showMessage("msgFileTypeError", "error");
                    if (dom.fileInput) dom.fileInput.value = "";
                }
            }
        });
    }

    if (dom.textInput) {
        dom.textInput.addEventListener("focus", () => {
            if (dom.textInput.placeholder === state.originalPlaceholderText) {
                dom.textInput.placeholder = "";
            }
        });

        dom.textInput.addEventListener("blur", () => {
            if (!dom.textInput.value.trim() && state.originalPlaceholderText) {
                dom.textInput.placeholder = state.originalPlaceholderText;
            }
        });

        dom.textInput.addEventListener("input", handleTextChange);
    }

    if (dom.wpmInput) {
        dom.wpmInput.addEventListener("input", () => {
            state.currentWpm = parseInt(dom.wpmInput.value, 10);
            const wpmValueSpan = dom.wpmCpmLabel.querySelector("#wpm-value");
            if (wpmValueSpan) wpmValueSpan.textContent = state.currentWpm;
            if (dom.statsWpmValueDisplay) dom.statsWpmValueDisplay.textContent = state.currentWpm;
            updateTextStats();
            localStorage.setItem(state.LS_KEYS.WPM, state.currentWpm.toString());

            if (state.intervalId && !state.isPaused) {
                clearInterval(state.intervalId);
                state.intervalId = setInterval(displayNextWord, 60000 / state.currentWpm);
            }
        });
    }

    if (dom.darkModeToggle) {
        dom.darkModeToggle.addEventListener("click", () => {
            const isDark = document.documentElement.classList.toggle("dark");
            localStorage.setItem(state.LS_KEYS.THEME, isDark ? "dark" : "light");
            state.userHasManuallySetTheme = true;
            localStorage.setItem(state.LS_KEYS.USER_THEME_PREFERENCE, "true");
            applyTheme(isDark);
        });
    }

    const systemThemeMatcher = window.matchMedia("(prefers-color-scheme: dark)");
    systemThemeMatcher.addEventListener("change", (event) => {
        if (!state.userHasManuallySetTheme) {
            applyTheme(event.matches);
        }
    });

    if (dom.fixationToggle) {
        dom.fixationToggle.addEventListener("change", () => {
            state.isFixationPointEnabled = dom.fixationToggle.checked;
            localStorage.setItem(state.LS_KEYS.FIXATION_ENABLED, state.isFixationPointEnabled.toString());
            if (dom.currentWordDisplay && dom.currentWordDisplay.textContent !== getTranslation("statusReady") && dom.currentWordDisplay.textContent !== getTranslation("statusComplete") && state.words[state.currentIndex - 1]) {
                dom.currentWordDisplay.innerHTML = formatWordWithFixation(state.words[state.currentIndex - 1]);
            } else if (dom.currentWordDisplay && dom.currentWordDisplay.textContent) {
                dom.currentWordDisplay.innerHTML = formatWordWithFixation(dom.currentWordDisplay.textContent.replace(/<[^>]*>/g, ""));
            }
        });
    }

    if (dom.startButton) {
        dom.startButton.addEventListener("click", () => {
            if (dom.textInput && dom.textInput.value.trim() === "") {
                showMessage("msgEnterText", "error");
                return;
            }
            startReadingFlow(state.isPaused);
        });
    }

    if (dom.pauseButton) {
        dom.pauseButton.addEventListener("click", () => {
            pauseReading();
        });
    }

    if (dom.resetButton) {
        dom.resetButton.addEventListener("click", () => {
            if (dom.textInput) {
                handleTextChange(dom.textInput.value);
            }
        });
    }

    if (dom.languageSelector) {
        dom.languageSelector.addEventListener("change", (event) => setLanguage(event.target.value));
    }

    // Auth modal event listeners
    if (dom.authButton) {
        dom.authButton.addEventListener("click", () => {
            setupAuthModal(true); // Open in login mode by default
            openAuthModal();
        });
    }

    if (dom.closeAuthModalButton) {
        dom.closeAuthModalButton.addEventListener("click", closeAuthModal);
    }

    if (dom.authModalOverlay) {
        dom.authModalOverlay.addEventListener("click", (event) => {
            if (event.target === dom.authModalOverlay) {
                closeAuthModal();
            }
        });
    }

    if (dom.authSwitchButton) {
        dom.authSwitchButton.addEventListener("click", () => {
            setupAuthModal(!isLoginMode);
        });
    }

    if (dom.authForm) {
        dom.authForm.addEventListener("submit", (event) => {
            event.preventDefault();
            showMessage("msgAuthNotImplemented", "info");
            closeAuthModal();
        });
    }
}
