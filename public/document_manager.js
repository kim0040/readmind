import * as auth from './auth.js';
import { dom, showMessage } from './ui.js';
import { state } from './state.js';
import { handleTextChange } from './text_handler.js';

let saveTimeout;

/**
 * Loads a document into the editor.
 * @param {object} doc The document object to load.
 */
function loadDocument(doc) {
    state.activeDocument = doc;
    if (state.simplemde) {
        state.simplemde.value(doc.content);
    }
    // Also update the hidden textarea for other parts of the app
    if (dom.textInput) {
        dom.textInput.value = doc.content;
    }
    // Highlight the active document in the list
    document.querySelectorAll('#document-list > div').forEach(el => {
        el.classList.toggle('bg-sky-100', el.dataset.id === String(doc.id));
        el.classList.toggle('dark:bg-sky-900', el.dataset.id === String(doc.id));
    });
}

/**
 * Handles saving the currently active document.
 */
function scheduleDocumentSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        if (state.activeDocument && state.simplemde) {
            const newContent = state.simplemde.value();
            // Only save if content has changed
            if (newContent !== state.activeDocument.content) {
                try {
                    await auth.updateDocument(state.activeDocument.id, state.activeDocument.title, newContent);
                    state.activeDocument.content = newContent; // Update local state
                    // Maybe show a subtle saved indicator
                } catch (error) {
                    showMessage('msgSettingsSaveError', 'error'); // Re-use settings save error message
                }
            }
        }
    }, 1500); // 1.5 second debounce for saving documents
}

/**
 * Fetches documents and renders them in the sidebar.
 */
export async function renderDocumentList() {
    if (!auth.isLoggedIn()) {
        dom.documentList.innerHTML = `<p class="text-sm text-slate-500 p-4 text-center" data-lang-key="loginToSeeDocs"></p>`;
        document.querySelector('[data-lang-key="loginToSeeDocs"]').textContent = getTranslation("loginToSeeDocs");
        return;
    }

    try {
        const documents = await auth.getDocuments();
        const docListContainer = dom.documentList;
        docListContainer.innerHTML = ''; // Clear existing list

        if (documents.length === 0) {
            docListContainer.innerHTML = `<p class="text-sm text-slate-500 p-4 text-center" data-lang-key="noDocuments"></p>`;
            document.querySelector('[data-lang-key="noDocuments"]').textContent = getTranslation("noDocuments");
            return;
        }

        documents.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-item p-3 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 flex justify-between items-center';
            docElement.dataset.id = doc.id;

            const textContainer = document.createElement('div');

            const title = document.createElement('h3');
            title.className = 'font-semibold text-sm text-slate-800 dark:text-slate-200';
            title.textContent = doc.title;

            const date = document.createElement('p');
            date.className = 'text-xs text-slate-500 dark:text-slate-400';
            date.textContent = `Updated: ${new Date(doc.updated_at).toLocaleDateString()}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-doc-btn p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-full';
            deleteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
            deleteBtn.dataset.id = doc.id;
            deleteBtn.title = "Delete document";

            textContainer.appendChild(title);
            textContainer.appendChild(date);
            docElement.appendChild(textContainer);
            docElement.appendChild(deleteBtn);
            docListContainer.appendChild(docElement);
        });

    } catch (error) {
        console.error("Failed to render document list:", error);
        dom.documentList.innerHTML = `<p class="text-sm text-red-500 p-4 text-center" data-lang-key="errorLoadDocs"></p>`;
        document.querySelector('[data-lang-key="errorLoadDocs"]').textContent = getTranslation("errorLoadDocs");
    }
}

export function attachDocumentEventListeners() {
    // Listener for the entire document list (event delegation)
    dom.documentList.addEventListener('click', async (e) => {
        const docElement = e.target.closest('.document-item');
        const deleteButton = e.target.closest('.delete-doc-btn');

        if (deleteButton) {
            e.stopPropagation(); // Prevent the document from being selected
            const docId = deleteButton.dataset.id;
            if (confirm('Are you sure you want to delete this document?')) {
                try {
                    await auth.deleteDocument(docId);
                    showMessage('msgDocDeleted', 'success');
                    if (state.activeDocument && state.activeDocument.id == docId) {
                        state.activeDocument = null;
                        state.simplemde.value('');
                    }
                    renderDocumentList();
                } catch (error) {
                    showMessage('msgDocDeleteError', 'error');
                }
            }
        } else if (docElement) {
            const docId = docElement.dataset.id;
            try {
                const document = await auth.getDocument(docId);
                loadDocument(document);
            } catch (error) {
                showMessage('msgDocLoadError', 'error');
            }
        }
    });

    // Listener for the "New Document" button
    dom.newDocumentButton.addEventListener('click', async () => {
        const title = prompt("Enter a title for your new document:", "New Document");
        if (title) {
            try {
                const newDoc = await auth.createDocument(title, `# ${title}\n\n`);
                showMessage('msgDocCreated', 'success');
                await renderDocumentList();
                loadDocument(newDoc);
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
    });

    // Connect editor changes to the debounced save function
    if (state.simplemde) {
        state.simplemde.codemirror.on("change", () => {
            if (state.activeDocument) {
                scheduleDocumentSave();
            }
            // Also update the hidden textarea for the reader
            if (dom.textInput) {
                dom.textInput.value = state.simplemde.value();
            }
        });
    }

    // Connect the "Start" button to use the editor's content
    if(dom.startButton) {
        dom.startButton.addEventListener('click', () => {
            if(state.simplemde && dom.textInput.value !== state.simplemde.value()) {
                 handleTextChange(state.simplemde.value());
            }
        }, true); // Use capture phase to run before other start listeners
    }
}
