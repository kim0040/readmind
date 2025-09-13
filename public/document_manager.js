import * as auth from './auth.js';
import { dom, showMessage, getTranslation } from './ui.js';
import { documentState } from './state.js';
import { handleTextChange } from './text_handler.js';
import { debounce } from './utils.js';

let saveTimeout;

/**
 * Loads a document into the editor.
 * @param {object} doc The document object to load.
 */
function loadDocument(doc) {
    documentState.activeDocument = doc;
    if (documentState.simplemde) {
        documentState.simplemde.value(doc.content);
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
        if (documentState.activeDocument && documentState.simplemde) {
            const newContent = documentState.simplemde.value();
            // Only save if content has changed
            if (newContent !== documentState.activeDocument.content) {
                try {
                    await auth.updateDocument(documentState.activeDocument.id, documentState.activeDocument.title, newContent);
                    documentState.activeDocument.content = newContent; // Update local state
                } catch (error) {
                    showMessage('msgSettingsSaveError', 'error'); // Re-use settings save error message
                }
            }
        }
    }, 1500);
}

/**
 * Fetches documents and renders them in the sidebar.
 */
export async function renderDocumentList() {
    if (!auth.isLoggedIn()) {
        dom.documentList.innerHTML = `<p class="text-sm text-slate-500 p-4 text-center" data-lang-key="loginToSeeDocs"></p>`;
        const el = dom.documentList.querySelector('[data-lang-key="loginToSeeDocs"]');
        if (el) el.textContent = getTranslation("loginToSeeDocs");
        return;
    }

    try {
        const documents = await auth.getDocuments();
        const docListContainer = dom.documentList;
        docListContainer.innerHTML = '';

        if (documents.length === 0) {
            docListContainer.innerHTML = `<p class="text-sm text-slate-500 p-4 text-center" data-lang-key="noDocuments"></p>`;
            const el = docListContainer.querySelector('[data-lang-key="noDocuments"]');
            if (el) el.textContent = getTranslation("noDocuments");
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
        const el = dom.documentList.querySelector('[data-lang-key="errorLoadDocs"]');
        if (el) el.textContent = getTranslation("errorLoadDocs");
    }
}

export function attachDocumentEventListeners() {
    dom.documentList.addEventListener('click', async (e) => {
        const docElement = e.target.closest('.document-item');
        const deleteButton = e.target.closest('.delete-doc-btn');

        if (deleteButton) {
            e.stopPropagation();
            const docId = deleteButton.dataset.id;
            if (confirm('Are you sure you want to delete this document?')) {
                try {
                    await auth.deleteDocument(docId);
                    showMessage('msgDocDeleted', 'success');
                    if (documentState.activeDocument && documentState.activeDocument.id == docId) {
                        documentState.activeDocument = null;
                        documentState.simplemde.value('');
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

    if (documentState.simplemde) {
        documentState.simplemde.codemirror.on("change", debounce(() => {
            if (documentState.activeDocument) {
                scheduleDocumentSave();
            }
            if (dom.textInput) {
                dom.textInput.value = documentState.simplemde.value();
            }
        }, 500));
    }

    if(dom.startButton) {
        dom.startButton.addEventListener('click', () => {
            if(documentState.simplemde && dom.textInput.value !== documentState.simplemde.value()) {
                 handleTextChange(documentState.simplemde.value());
            }
        }, true);
    }
}
