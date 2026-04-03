const DATE_LINE_RE = /^(\d{4}-\d{2}-\d{2}),(.*)$/;

const sourceInput = document.getElementById('sourceInput');
const fileInput = document.getElementById('fileInput');
const parseButton = document.getElementById('parseButton');
const copyPreviewButton = document.getElementById('copyPreviewButton');
const resultsList = document.getElementById('resultsList');
const jsonPreview = document.getElementById('jsonPreview');
const errorBanner = document.getElementById('errorBanner');
const entryCount = document.getElementById('entryCount');
const lineCount = document.getElementById('lineCount');

let lastJson = '[]';

function normalizeLines(text) {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

function parsePresentlyCsv(text) {
    const lines = normalizeLines(text);
    const entries = [];
    let lineIndex = 0;

    while (lineIndex < lines.length && !lines[lineIndex].trim()) {
        lineIndex += 1;
    }

    if (lineIndex >= lines.length) {
        return entries;
    }

    if (lines[lineIndex].trim() !== 'entryDate,entryContent') {
        throw new Error("Expected header 'entryDate,entryContent'.");
    }

    lineIndex += 1;
    while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];

        if (!currentLine.trim()) {
            lineIndex += 1;
            continue;
        }

        const match = currentLine.match(DATE_LINE_RE);
        if (!match) {
            throw new Error(`Expected an entry date at line ${lineIndex + 1}: ${currentLine}`);
        }

        const entryDate = match[1];
        const contentLines = [match[2]];
        lineIndex += 1;

        while (lineIndex < lines.length) {
            const nextLine = lines[lineIndex];
            if (DATE_LINE_RE.test(nextLine)) {
                break;
            }
            contentLines.push(nextLine);
            lineIndex += 1;
        }

        let entryContent = contentLines.join('\n');
        if (entryContent.startsWith('"') && entryContent.endsWith('"') && entryContent.length >= 2) {
            entryContent = entryContent.slice(1, -1).replace(/""/g, '"');
        }

        entries.push({ entryDate, entryContent });
    }

    return entries;
}

function toJson(entries) {
    return JSON.stringify(entries);
}

function setError(message) {
    if (!message) {
        errorBanner.hidden = true;
        errorBanner.textContent = '';
        return;
    }

    errorBanner.hidden = false;
    errorBanner.textContent = message;
}

function render(entries, lineTotal) {
    entryCount.textContent = String(entries.length);
    lineCount.textContent = String(lineTotal);
    lastJson = toJson(entries);
    jsonPreview.textContent = lastJson;

    if (entries.length === 0) {
        resultsList.innerHTML = '<div class="empty-state">No entries yet. Load a file or paste text, then read it.</div>';
        return;
    }

    resultsList.innerHTML = entries.map((entry, index) => `
    <article class="entry-card">
      <header>
        <time datetime="${entry.entryDate}">${entry.entryDate}</time>
        <span class="index">#${index + 1}</span>
      </header>
      <pre>${escapeHtml(entry.entryContent)}</pre>
    </article>
  `).join('');
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function parseAndRender() {
    try {
        const text = sourceInput.value;
        const entries = parsePresentlyCsv(text);
        setError('');
        render(entries, normalizeLines(text).length);
    } catch (error) {
        setError(error instanceof Error ? error.message : 'Unable to read the file.');
    }
}

async function copyText(text) {
    await navigator.clipboard.writeText(text);
}

parseButton.addEventListener('click', parseAndRender);

fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) {
        return;
    }

    sourceInput.value = await file.text();
    parseAndRender();
});

copyPreviewButton.addEventListener('click', async () => {
    await copyText(lastJson);
    copyPreviewButton.textContent = 'Copied';
    window.setTimeout(() => {
        copyPreviewButton.textContent = 'Copy';
    }, 1200);
});

sourceInput.addEventListener('input', () => {
    setError('');
});

sourceInput.value = '';
render([], 0);