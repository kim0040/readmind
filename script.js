// script.js
document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소들
  const textInput = document.getElementById("text-input");
  const fileInput = document.getElementById("file-input");
  const wpmInput = document.getElementById("wpm-input");
  const startButton = document.getElementById("start-button");
  const startButtonText = document.getElementById("start-button-text");
  const pauseButton = document.getElementById("pause-button");
  const pauseButtonText = document.getElementById("pause-button-text");
  const resetButton = document.getElementById("reset-button");
  const currentWordDisplay = document.getElementById("current-word");
  const progressInfoDisplay = document.getElementById("progress-info");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
  const themeToggleLightIcon = document.getElementById(
    "theme-toggle-light-icon",
  );
  const fixationToggle = document.getElementById("fixation-toggle");
  const customMessageBox = document.getElementById("custom-message-box");
  const messageText = document.getElementById("message-text");
  const charCountWithSpaceDisplay = document.getElementById(
    "char-count-with-space",
  );
  const charCountWithoutSpaceDisplay = document.getElementById(
    "char-count-without-space",
  );
  const byteCountDisplay = document.getElementById("byte-count");
  const wordCountDisplay = document.getElementById("word-count");
  const sentenceCountDisplay = document.getElementById("sentence-count");
  const paragraphCountDisplay = document.getElementById("paragraph-count");
  const estimatedReadingTimeDisplay = document.getElementById(
    "estimated-reading-time",
  );
  const statsWpmValueDisplay = document.getElementById("stats-wpm-value");
  const statsUnitLabel = document.getElementById("stats-unit-label");
  const wpmCpmLabel = document.getElementById("wpm-cpm-label");
  const progressBarFill = document.getElementById("progress-bar-fill");
  const currentYearSpan = document.getElementById("current-year");
  const languageSelector = document.getElementById("language-selector");
  const siteTitleH1 = document.getElementById("site-title");
  const contactLink = document.getElementById("contact-link");
  const clearTextButton = document.getElementById("clear-text-button");

  if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

  // 상수 정의
  const APP_VERSION = "1.0.11"; // 파일 로드 로직 명확화 및 인코딩 문제 강조
  const LS_KEYS = {
    LANGUAGE: "readMindLanguage",
    THEME: "theme",
    USER_THEME_PREFERENCE: "userThemePreference",
    FIXATION_ENABLED: "fixationPointEnabled",
    WPM: "wpm",
    TEXT: "readMindText",
    INDEX: "readMindIndex",
  };
  const START_DELAY = 1000;
  const ANIMATION_DURATION_NORMAL = 120;
  const ANIMATION_DURATION_SUBTLE = 60;
  const LOW_WPM_THRESHOLD = 200;
  const NO_ANIMATION_THRESHOLD = 400;
  const NO_SPACE_LANGUAGES = ["ja", "zh"];
  const CONTACT_EMAIL = "hun1234kim@gmail.com";

  // 상태 변수들
  let words = [];
  let currentIndex = 0;
  let intervalId = null;
  let currentWpm = 250;
  let isPaused = false;
  let startDelayTimeoutId = null;
  let isFixationPointEnabled = false;
  let currentLanguage = "ko";
  const encoder = new TextEncoder();
  let userHasManuallySetTheme = false;
  let originalPlaceholderText = "";

  if (typeof translations === "undefined") {
    console.error("Critical Error: translations.js failed to load.");
    if (customMessageBox && messageText) {
      messageText.textContent =
        "Language file loading error. Please refresh or contact support.";
      customMessageBox.className = "message-box error show";
      customMessageBox.style.opacity = "1";
      customMessageBox.style.visibility = "visible";
      customMessageBox.style.transform = "translateX(-50%) translateY(0)";
    }
    return;
  }

  function getTranslation(
    key,
    lang = currentLanguage,
    fallbackLang = "en",
    params = null,
  ) {
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

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
      if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove("hidden");
      if (themeToggleLightIcon) themeToggleLightIcon.classList.add("hidden");
    } else {
      document.documentElement.classList.remove("dark");
      if (themeToggleLightIcon) themeToggleLightIcon.classList.remove("hidden");
      if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add("hidden");
    }
  }

  function setLanguage(lang, isInitializing = false) {
    currentLanguage = lang;
    localStorage.setItem(LS_KEYS.LANGUAGE, lang);
    if (languageSelector) languageSelector.value = lang;
    if (document.documentElement) document.documentElement.lang = lang;

    if (siteTitleH1) {
      const nativeName = getTranslation("siteNativeName");
      const appNameEn = "ReadMind";
      let titleHtml = "";
      if (
        nativeName &&
        nativeName !== appNameEn &&
        translations[currentLanguage]?.siteNativeName
      ) {
        titleHtml = `${nativeName} <small class="site-title-sub">(${appNameEn})</small>`;
      } else {
        titleHtml = appNameEn;
      }
      siteTitleH1.innerHTML = titleHtml;
    }

    if (document) document.title = getTranslation("pageTitle");

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.dataset.langKey;
      const translation = getTranslation(key);
      if (el.tagName === "TEXTAREA" && el.hasAttribute("placeholder")) {
        if (el.id === "text-input") {
          originalPlaceholderText = translation;
          if (!textInput.value.trim()) {
            el.placeholder = originalPlaceholderText;
          } else {
            el.placeholder = "";
          }
        } else {
          el.placeholder = translation;
        }
      } else if (
        ![
          "start-button-text",
          "pause-button-text",
          "reset-button-text",
        ].includes(el.id)
      ) {
        if (el.id === "progress-info" && key === "progressLabelFormat") {
          // updateTextStats에서 처리
        } else if (
          el.id === "estimated-reading-time" &&
          key === "timeFormatZero"
        ) {
          // updateTextStats에서 처리
        } else if (el.id === "wpm-cpm-label") {
          el.innerHTML =
            getTranslation(
              NO_SPACE_LANGUAGES.includes(currentLanguage)
                ? "cpmLabel"
                : "wpmLabel",
            ) +
            ` <span id="wpm-value" class="font-semibold text-sky-500 dark:text-sky-400">${currentWpm}</span>`;
        } else {
          el.innerHTML = translation;
        }
      }
    });

    if (!isInitializing) {
      updateTextStats();
      updateButtonStates(
        isPaused ? "paused" : intervalId ? "reading" : "initial",
      );
    }

    if (currentWordDisplay) {
      const statusKeysMap = {
        Ready: "statusReady",
        "Complete!": "statusComplete",
        Paused: "statusPaused",
        Error: "statusError",
        "Preparing...": "statusPreparing",
      };
      const currentTextContent = currentWordDisplay.textContent
        .replace(/<[^>]*>/g, "")
        .trim();
      let currentStatusKey = null;
      for (const enStatusText in statusKeysMap) {
        const tempStatusKey = statusKeysMap[enStatusText];
        for (const langCode in translations) {
          if (
            currentTextContent === getTranslation(tempStatusKey, langCode, "en")
          ) {
            currentStatusKey = tempStatusKey;
            break;
          }
        }
        if (currentStatusKey) break;
      }
      if (currentStatusKey) {
        currentWordDisplay.innerHTML = formatWordWithFixation(
          getTranslation(currentStatusKey),
        );
      } else if (
        words &&
        words.length > 0 &&
        currentIndex >= 0 &&
        currentIndex < words.length &&
        words[currentIndex] !== undefined
      ) {
        currentWordDisplay.innerHTML = formatWordWithFixation(
          words[currentIndex],
        );
      } else if (!words || words.length === 0) {
        currentWordDisplay.innerHTML = formatWordWithFixation(
          getTranslation("statusReady"),
        );
      }
    }
    if (statsUnitLabel) {
      statsUnitLabel.textContent = NO_SPACE_LANGUAGES.includes(currentLanguage)
        ? "CPM"
        : "WPM";
    }
    if (wpmCpmLabel) {
      wpmCpmLabel.innerHTML =
        getTranslation(
          NO_SPACE_LANGUAGES.includes(currentLanguage)
            ? "cpmLabel"
            : "wpmLabel",
        ) +
        ` <span id="wpm-value" class="font-semibold text-sky-500 dark:text-sky-400">${currentWpm}</span>`;
    }
  }

  function applySavedSettings() {
    const savedLanguage = localStorage.getItem(LS_KEYS.LANGUAGE);
    currentLanguage = savedLanguage || navigator.language.split("-")[0] || "ko";
    if (!translations[currentLanguage]) currentLanguage = "ko";

    const savedTheme = localStorage.getItem(LS_KEYS.THEME);
    userHasManuallySetTheme =
      localStorage.getItem(LS_KEYS.USER_THEME_PREFERENCE) === "true";

    if (savedTheme) {
      applyTheme(savedTheme === "dark");
    } else if (!userHasManuallySetTheme) {
      applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    isFixationPointEnabled =
      localStorage.getItem(LS_KEYS.FIXATION_ENABLED) === "true";
    if (fixationToggle) fixationToggle.checked = isFixationPointEnabled;

    currentWpm = parseInt(localStorage.getItem(LS_KEYS.WPM) || "250", 10);
    if (wpmInput) wpmInput.value = currentWpm;

    const savedText = localStorage.getItem(LS_KEYS.TEXT);
    if (savedText && textInput) {
      textInput.value = savedText;
    }
  }

  function showMessage(
    messageKey,
    type = "info",
    duration = 3000,
    interpolateParams = null,
  ) {
    if (!customMessageBox || !messageText) return;
    messageText.textContent = getTranslation(
      messageKey,
      currentLanguage,
      "en",
      interpolateParams,
    );
    customMessageBox.className = `message-box ${type}`;
    customMessageBox.style.opacity = "0";
    customMessageBox.style.visibility = "hidden";
    customMessageBox.style.transform = "translateX(-50%) translateY(-100%)";

    setTimeout(() => {
      customMessageBox.classList.add("show");
      customMessageBox.style.opacity = "1";
      customMessageBox.style.visibility = "visible";
      customMessageBox.style.transform = "translateX(-50%) translateY(0)";
    }, 20);

    setTimeout(() => {
      if (customMessageBox) {
        customMessageBox.style.opacity = "0";
        customMessageBox.style.transform = "translateX(-50%) translateY(-100%)";
        setTimeout(() => {
          if (customMessageBox) {
            customMessageBox.classList.remove("show");
            customMessageBox.style.visibility = "hidden";
          }
        }, 300);
      }
    }, duration);
  }

  function updateTextStats() {
    if (!textInput) return;
    const currentText = textInput.value; // 항상 textInput.value를 기준으로 분석

    if (NO_SPACE_LANGUAGES.includes(currentLanguage)) {
      words = currentText.replace(/\s+/g, "").split("");
    } else {
      words = currentText
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
    }
    const wordCount = words.length;

    if (charCountWithSpaceDisplay)
      charCountWithSpaceDisplay.textContent = currentText.length;
    const textWithoutSpaces = currentText.replace(/\s+/g, "");
    if (charCountWithoutSpaceDisplay)
      charCountWithoutSpaceDisplay.textContent = textWithoutSpaces.length;
    if (byteCountDisplay)
      byteCountDisplay.textContent = encoder.encode(currentText).length;
    if (wordCountDisplay) wordCountDisplay.textContent = wordCount;

    const sentences = currentText.match(/[^\.!\?]+[\.!\?]+/g);
    if (sentenceCountDisplay)
      sentenceCountDisplay.textContent = sentences ? sentences.length : 0;
    const paragraphs =
      currentText === ""
        ? 0
        : currentText.split(/\n\s*\n/).filter((p) => p.trim() !== "").length;
    if (paragraphCountDisplay)
      paragraphCountDisplay.textContent =
        paragraphs || (currentText.trim() !== "" ? 1 : 0);

    if (statsWpmValueDisplay) statsWpmValueDisplay.textContent = currentWpm;
    if (statsUnitLabel)
      statsUnitLabel.textContent = NO_SPACE_LANGUAGES.includes(currentLanguage)
        ? "CPM"
        : "WPM";

    if (wordCount > 0 && currentWpm > 0) {
      const minutes = wordCount / currentWpm;
      const totalSeconds = Math.floor(minutes * 60);
      const displayMinutes = Math.floor(totalSeconds / 60);
      const displaySeconds = totalSeconds % 60;
      if (estimatedReadingTimeDisplay) {
        estimatedReadingTimeDisplay.textContent = getTranslation(
          "timeFormat",
          currentLanguage,
          "en",
          {
            min: displayMinutes,
            sec: (displaySeconds < 10 ? "0" : "") + displaySeconds,
          },
        );
      }
    } else {
      if (estimatedReadingTimeDisplay)
        estimatedReadingTimeDisplay.textContent =
          getTranslation("timeFormatZero");
    }
    if (progressInfoDisplay) {
      progressInfoDisplay.textContent = getTranslation(
        "progressLabelFormat",
        currentLanguage,
        "en",
        {
          unit: NO_SPACE_LANGUAGES.includes(currentLanguage)
            ? getTranslation("charsLabel")
            : getTranslation("wordsLabel"),
          current: currentIndex,
          total: wordCount,
        },
      );
    }
    updateProgressBar();
  }

  function updateProgressBar() {
    if (!progressBarFill) return;
    const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
    progressBarFill.style.width = `${progress}%`;
  }

  function formatWordWithFixation(word) {
    if (!isFixationPointEnabled || !word || word.length <= 1) return word;
    const point = Math.max(
      0,
      Math.floor(word.length / 3) - (word.length > 5 ? 1 : 0),
    );
    if (point < 0 || point >= word.length) return word;
    return `${word.substring(0, point)}<span class="fixation-point">${word.charAt(point)}</span>${word.substring(point + 1)}`;
  }

  function displayNextWord() {
    if (currentIndex < words.length) {
      if (currentWordDisplay) {
        const wordToShow = words[currentIndex];
        currentWordDisplay.innerHTML = formatWordWithFixation(wordToShow);
        currentWordDisplay.style.transition = "none";
        currentWordDisplay.style.opacity = "1";
        currentWordDisplay.style.transform = "translateY(0px)";

        if (currentWpm < LOW_WPM_THRESHOLD) {
          currentWordDisplay.style.opacity = "0";
          currentWordDisplay.style.transform = "translateY(5px)";
          currentWordDisplay.offsetHeight;
          currentWordDisplay.style.transition = `opacity ${ANIMATION_DURATION_NORMAL / 1000}s ease-out, transform ${ANIMATION_DURATION_NORMAL / 1000}s ease-out`;
          currentWordDisplay.style.opacity = "1";
          currentWordDisplay.style.transform = "translateY(0px)";
        } else if (currentWpm < NO_ANIMATION_THRESHOLD) {
          currentWordDisplay.style.opacity = "0.5";
          currentWordDisplay.offsetHeight;
          currentWordDisplay.style.transition = `opacity ${ANIMATION_DURATION_SUBTLE / 1000}s ease-in-out`;
          currentWordDisplay.style.opacity = "1";
        }
      }
      currentIndex++;
      if (progressInfoDisplay) {
        progressInfoDisplay.textContent = getTranslation(
          "progressLabelFormat",
          currentLanguage,
          "en",
          {
            unit: NO_SPACE_LANGUAGES.includes(currentLanguage)
              ? getTranslation("charsLabel")
              : getTranslation("wordsLabel"),
            current: currentIndex,
            total: words.length,
          },
        );
      }
      updateProgressBar();
    } else {
      completeReadingSession();
    }
  }

  function startReadingFlow(isResuming = false) {
    if (words.length === 0) {
      showMessage("msgNoWords", "error");
      return;
    }
    if (!isResuming) {
      currentIndex = 0;
      if (currentWordDisplay)
        currentWordDisplay.innerHTML = formatWordWithFixation(
          getTranslation("statusPreparing"),
        );
    }
    isPaused = false;
    updateButtonStates("reading");

    clearTimeout(startDelayTimeoutId);
    startDelayTimeoutId = setTimeout(
      () => {
        if (intervalId) clearInterval(intervalId);
        displayNextWord();
        if (currentIndex < words.length) {
          intervalId = setInterval(displayNextWord, 60000 / currentWpm);
        }
      },
      isResuming ? 0 : START_DELAY,
    );
  }

  function completeReadingSession() {
    clearInterval(intervalId);
    intervalId = null;
    if (currentWordDisplay)
      currentWordDisplay.innerHTML = formatWordWithFixation(
        getTranslation("statusComplete"),
      );
    showMessage("msgAllWordsRead", "success", 3000);
    updateButtonStates("completed");
    localStorage.setItem(LS_KEYS.TEXT, textInput.value);
    localStorage.setItem(LS_KEYS.INDEX, currentIndex.toString());
  }

  function updateButtonStates(state) {
    if (
      !startButton ||
      !pauseButton ||
      !resetButton ||
      !startButtonText ||
      !pauseButtonText ||
      !document.getElementById("reset-button-text")
    )
      return;

    startButtonText.textContent = getTranslation("startButton");
    pauseButtonText.textContent = getTranslation("pauseButton");
    document.getElementById("reset-button-text").textContent =
      getTranslation("resetButton");

    switch (state) {
      case "initial":
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetButton.disabled = true;
        break;
      case "reading":
        startButton.disabled = true;
        pauseButton.disabled = false;
        resetButton.disabled = false;
        break;
      case "paused":
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetButton.disabled = false;
        startButtonText.textContent = getTranslation("resumeButton");
        break;
      case "completed":
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetButton.disabled = false;
        break;
      case "empty":
        startButton.disabled = true;
        pauseButton.disabled = true;
        resetButton.disabled = true;
        break;
    }
    if (clearTextButton) {
      clearTextButton.disabled = !(textInput && textInput.value.length > 0);
    }
  }

  /**
   * Handles changes to the text input from various sources (direct input, file load, reset).
   * Ensures textInput.value is the single source of truth before further processing.
   * @param {string | Event} newTextSourceOrEvent - The new text string or an Event object.
   */
  function handleTextChange(newTextSourceOrEvent) {
    // 1. Update textInput.value based on the source
    if (typeof newTextSourceOrEvent === "string") {
      // Source is a string (from file load or reset button calling with textInput.value)
      // This ensures textInput.value reflects the new string content.
      textInput.value = newTextSourceOrEvent;
    }
    // If newTextSourceOrEvent was an Event (from direct 'input' event),
    // textInput.value has already been updated by the browser.

    // 2. Use textInput.value as the definitive current text
    const currentText = textInput.value;

    // 3. Reset reading session state
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      isPaused = false;
    }
    currentIndex = 0; // Reset progress for new/modified text

    // 4. Update statistics and UI elements based on the definitive currentText
    // updateTextStats will read from textInput.value
    updateTextStats();

    updateButtonStates(currentText.trim().length > 0 ? "initial" : "empty");

    if (currentWordDisplay) {
      currentWordDisplay.innerHTML = formatWordWithFixation(
        getTranslation("statusReady"),
      );
    }

    // 5. Save to localStorage
    localStorage.setItem(LS_KEYS.TEXT, currentText);
    localStorage.setItem(LS_KEYS.INDEX, "0"); // Always reset index on text change

    // 6. Manage placeholder
    if (currentText.trim() && textInput.placeholder !== "") {
      textInput.placeholder = "";
    } else if (
      !currentText.trim() &&
      originalPlaceholderText &&
      textInput.placeholder !== originalPlaceholderText
    ) {
      // If text becomes empty, restore original placeholder
      textInput.placeholder = originalPlaceholderText;
    }
  }

  // --- Event Listeners ---

  if (contactLink) {
    contactLink.addEventListener("click", (e) => {
      e.preventDefault();
      const subject = encodeURIComponent(getTranslation("contactEmailSubject"));
      const body = encodeURIComponent(
        getTranslation("contactEmailBody", currentLanguage, "en", {
          appVersion: APP_VERSION,
          osInfo: navigator.platform,
          browserInfo: navigator.userAgent,
          errorTime: new Date().toISOString(),
        }),
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    });
  }

  if (clearTextButton) {
    clearTextButton.addEventListener("click", () => {
      if (textInput) {
        handleTextChange(""); // Pass empty string to clear text and reset states
        showMessage("msgTextCleared", "success");
        // Placeholder restoration is handled within handleTextChange
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        // It's good practice to check file size here too, to prevent loading huge files
        // e.g., if (file.size > 5 * 1024 * 1024) { showMessage("msgFileTooLarge", "error"); return; }

        if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              if (textInput) {
                console.log(
                  "File loaded via FileReader. Content snippet (first 100 chars):",
                  e.target.result.substring(0, 100),
                );
                handleTextChange(e.target.result);
                showMessage("msgFileLoadSuccess", "success");
              }
            } catch (error) {
              console.error("Error processing loaded file content:", error);
              showMessage("msgFileLoadError", "error");
            } finally {
              if (fileInput) fileInput.value = ""; // Reset file input
            }
          };
          reader.onerror = (readError) => {
            // Capture FileReader errors
            console.error("FileReader error:", readError);
            try {
              showMessage("msgFileLoadError", "error");
            } catch (messageError) {
              console.error(
                "Error showing file load error message:",
                messageError,
              );
            } finally {
              if (fileInput) fileInput.value = "";
            }
          };
          // FileReader.readAsText by default uses UTF-8 if no encoding is specified
          // and the file doesn't have a BOM indicating otherwise.
          // If files are not UTF-8 and don't have a BOM, this might be an issue.
          reader.readAsText(file);
          console.log(
            `Attempting to read file: ${file.name} (type: ${file.type}, size: ${file.size} bytes)`,
          );
        } else {
          showMessage("msgFileTypeError", "error");
          if (fileInput) fileInput.value = "";
        }
      }
    });
  }

  if (textInput) {
    textInput.addEventListener("focus", () => {
      if (textInput.placeholder === originalPlaceholderText) {
        textInput.placeholder = "";
      }
    });

    textInput.addEventListener("blur", () => {
      if (!textInput.value.trim() && originalPlaceholderText) {
        textInput.placeholder = originalPlaceholderText;
      }
    });

    textInput.addEventListener("input", handleTextChange); // Direct input also uses the handler
  }

  if (wpmInput) {
    wpmInput.addEventListener("input", () => {
      currentWpm = parseInt(wpmInput.value, 10);
      if (wpmCpmLabel) {
        const wpmValueSpan = wpmCpmLabel.querySelector("#wpm-value");
        if (wpmValueSpan) wpmValueSpan.textContent = currentWpm;
      }
      if (statsWpmValueDisplay) statsWpmValueDisplay.textContent = currentWpm;
      updateTextStats();
      localStorage.setItem(LS_KEYS.WPM, currentWpm.toString());

      if (intervalId && !isPaused) {
        clearInterval(intervalId);
        intervalId = setInterval(displayNextWord, 60000 / currentWpm);
      }
    });
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem(LS_KEYS.THEME, isDark ? "dark" : "light");
      userHasManuallySetTheme = true;
      localStorage.setItem(LS_KEYS.USER_THEME_PREFERENCE, "true");
      applyTheme(isDark);
    });
  }

  const systemThemeMatcher = window.matchMedia("(prefers-color-scheme: dark)");
  systemThemeMatcher.addEventListener("change", (event) => {
    if (!userHasManuallySetTheme) {
      applyTheme(event.matches);
    }
  });

  if (fixationToggle) {
    fixationToggle.addEventListener("change", () => {
      isFixationPointEnabled = fixationToggle.checked;
      localStorage.setItem(
        LS_KEYS.FIXATION_ENABLED,
        isFixationPointEnabled.toString(),
      );
      if (
        currentWordDisplay &&
        currentWordDisplay.textContent !== getTranslation("statusReady") &&
        currentWordDisplay.textContent !== getTranslation("statusComplete") &&
        currentWordDisplay.textContent !== getTranslation("statusPreparing") &&
        currentWordDisplay.textContent !== getTranslation("statusPaused") &&
        currentWordDisplay.textContent !== getTranslation("statusError") &&
        words[currentIndex - 1] // Ensure there's a word at the (previous) current index
      ) {
        currentWordDisplay.innerHTML = formatWordWithFixation(
          words[currentIndex - 1],
        );
      } else if (currentWordDisplay && currentWordDisplay.textContent) {
        // For status messages, just re-apply formatting without a real fixation point
        currentWordDisplay.innerHTML = formatWordWithFixation(
          currentWordDisplay.textContent.replace(/<[^>]*>/g, ""),
        );
      }
    });
  }

  if (startButton) {
    startButton.addEventListener("click", () => {
      if (textInput && textInput.value.trim() === "") {
        showMessage("msgEnterText", "error");
        return;
      }
      startReadingFlow(isPaused);
    });
  }

  if (pauseButton) {
    pauseButton.addEventListener("click", () => {
      clearInterval(intervalId);
      intervalId = null;
      isPaused = true;
      if (currentWordDisplay)
        currentWordDisplay.innerHTML = formatWordWithFixation(
          getTranslation("statusPaused"),
        );
      updateButtonStates("paused");
      localStorage.setItem(LS_KEYS.TEXT, textInput.value);
      localStorage.setItem(LS_KEYS.INDEX, currentIndex.toString());
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (textInput) {
        // Pass the current text value to handleTextChange.
        // This will reset reading progress (currentIndex to 0) but keep the text.
        handleTextChange(textInput.value);
      }
    });
  }

  if (languageSelector) {
    languageSelector.addEventListener("change", (event) =>
      setLanguage(event.target.value),
    );
  }

  function initializeApp() {
    applySavedSettings();
    updateTextStats();
    setLanguage(currentLanguage, true);

    let initialState = "initial";
    const savedIndex = parseInt(localStorage.getItem(LS_KEYS.INDEX) || "0", 10);

    if (textInput && textInput.value.trim() !== "") {
      if (
        words &&
        words.length > 0 &&
        savedIndex > 0 &&
        savedIndex < words.length
      ) {
        currentIndex = savedIndex;
        isPaused = true;
        initialState = "paused";
        if (currentWordDisplay) {
          currentWordDisplay.innerHTML = formatWordWithFixation(
            getTranslation("statusPaused"),
          );
        }
      } else {
        currentIndex = 0;
        isPaused = false;
        initialState = "initial";
        if (currentWordDisplay) {
          currentWordDisplay.innerHTML = formatWordWithFixation(
            getTranslation("statusReady"),
          );
        }
      }
      if (textInput.placeholder !== "" && textInput.value.trim()) {
        textInput.placeholder = "";
      }
    } else {
      currentIndex = 0;
      isPaused = false;
      initialState = "empty";
      if (currentWordDisplay) {
        currentWordDisplay.innerHTML = formatWordWithFixation(
          getTranslation("statusReady"),
        );
      }
      if (
        textInput &&
        textInput.placeholder !== originalPlaceholderText &&
        originalPlaceholderText
      ) {
        textInput.placeholder = originalPlaceholderText;
      }
    }

    if (currentWordDisplay) {
      currentWordDisplay.style.opacity = "1";
      currentWordDisplay.style.transform = "translateY(0px)";
    }
    updateButtonStates(initialState);
    updateProgressBar();
  }

  initializeApp();
});
