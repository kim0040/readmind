# Mission: Application Stabilization

**Objective:** The ReadMind application is currently in a non-functional state due to multiple critical bugs. The sole priority of the agent is to identify and fix all reported issues until the application is stable, fully functional, and visually correct. No new features are to be developed until all items on this list are resolved and verified.

## Tier 1: Critical Loading & Crashing Errors (Must Be Fixed First)

These errors prevent the application from running at all. They must be solved in order.

1.  **`Uncaught SyntaxError: Cannot use import statement outside a module` in `main.js`:**
    *   **Symptom:** The main application script fails to load.
    *   **Cause:** The `<script>` tag for `main.js` in `index.html` is missing the `type="module"` attribute.
    *   **Task:** Restore the `type="module"` attribute to the script tag to ensure the browser treats it as an ES Module.

2.  **`Uncaught SyntaxError: The requested module does not provide an export named '...'`:**
    *   **Symptom:** The application fails to load due to broken dependencies between modules. This has been observed for `showConfirmationModal` and `applyReaderStyles`.
    *   **Cause:** A script is trying to import a function that is not being exported by the target module.
    *   **Task:** Ensure all imported functions are correctly exported from their respective modules (`ui.js`, etc.).

3.  **`Uncaught ReferenceError: displayNextWord is not defined` in `ui.js`:**
    *   **Symptom:** The application freezes when the WPM slider is adjusted during an active reading session.
    *   **Cause:** The event listener in `ui.js` for the WPM slider calls a function (`displayNextWord`) that is not in its scope.
    *   **Task:** Refactor the code so that the reading speed can be updated safely from `ui.js` without causing a crash. This involves creating a dedicated, exported function in `reader.js` for this purpose.

## Tier 2: Core Functionality Bugs

Once the application loads and is stable, these functional bugs must be fixed.

1.  **Theme System Failure:**
    *   **Symptom:** Changing the color theme or dark/light mode only affects some parts of the UI. The page background, card colors, and other elements do not change.
    *   **Task:** The application's CSS must be refactored to use the CSS variables defined in `themes.css` globally. All hardcoded colors must be removed from `style.css` (or its equivalent) to ensure the entire application theme is applied consistently.

2.  **Language Switching Failure:**
    *   **Symptom:** Changing the language in the dropdown selector has no effect on the UI text.
    *   **Task:** Debug the `setLanguage` function and its dependencies (`getTranslation`, `updateTextStats`, etc.) to ensure that all text elements with `data-lang-key` attributes are correctly updated when the language is changed.

3.  **Settings Controls Not Working:**
    *   **Symptom:** The controls for font family and font size are not interactive.
    *   **Task:** Implement the necessary JavaScript event listeners in `ui.js` to make these controls functional. The changes must affect the *reader view*, not the text editor.

4.  **Fixation Point Not Working:**
    *   **Symptom:** The "Fixation Point" toggle does not change how the text is displayed in the reader.
    *   **Task:** Debug the `formatWordWithFixation` function in `reader.js` and the associated CSS to ensure the feature works as intended.

5.  **Progress Bar Text Bug:**
    *   **Symptom:** The progress bar text displays raw placeholders (e.g., `{unit} {current} / {total}`) during reading.
    *   **Task:** Fix the `getTranslation` function call in `reader.js` to pass the correct arguments, ensuring the placeholders are properly replaced.

## Tier 3: User Experience (UX) Improvements

After all functional bugs are resolved, these UX issues must be addressed.

1.  **Reader Font Size:**
    *   **Issue:** The maximum font size is smaller than the user prefers.
    *   **Task:** Increase the `max` attribute on the font size slider in `index.html` to a larger value (e.g., 48).

2.  **"Chunk Size" Label:**
    *   **Issue:** The term "Chunk Size" is unclear to the user.
    *   **Task:** Add a tooltip or more descriptive label to explain that this setting controls how many words are shown at once.

3.  **Basic Statistics:**
    *   **Issue:** The user finds the current statistics section "too poor".
    *   **Task:** Enhance the statistics section using the `text-readability` library to include more metrics, such as Syllable Count and Lexical Diversity.
