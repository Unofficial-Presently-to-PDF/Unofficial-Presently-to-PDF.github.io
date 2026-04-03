const DATE_LINE_RE = /^(\d{4}-\d{2}-\d{2}),(.*)$/;

const sourceInput = document.getElementById('sourceInput');
const fileInput = document.getElementById('fileInput');
const bookTitleInput = document.getElementById('bookTitle');
const buildPdfButton = document.getElementById('buildPdfButton');
const resultsList = document.getElementById('resultsList');
const errorBanner = document.getElementById('errorBanner');
const entryCount = document.getElementById('entryCount');
const lineCount = document.getElementById('lineCount');

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

    if (entries.length === 0) {
        resultsList.innerHTML = '<div class="empty-state">No entries yet. Load a file or paste text, then create the book.</div>';
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

function buildBookPdf(entries, title) {
    const pdfApi = window.jspdf;
    if (!pdfApi?.jsPDF) {
        throw new Error('PDF library failed to load. Check your internet connection and try again.');
    }

    const { jsPDF } = pdfApi;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 54;
    const topMargin = 68;
    const bottomMargin = 56;
    const contentWidth = pageWidth - marginX * 2;
    let pageNumber = 0;

    function startPage(fillColor = [251, 250, 246]) {
        if (pageNumber > 0) {
            doc.addPage();
        }

        pageNumber += 1;
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    function addFooter() {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(122, 131, 145);
        doc.text(String(pageNumber), pageWidth - marginX, pageHeight - 28, { align: 'right' });
    }

    function drawHeader(headerTitle, subTitle) {
        doc.setFont('times', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(28, 37, 52);
        doc.text(headerTitle, marginX, topMargin);

        if (subTitle) {
            doc.setFont('times', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(93, 102, 116);
            const subtitleLines = doc.splitTextToSize(subTitle, contentWidth);
            doc.text(subtitleLines, marginX, topMargin + 24);
        }

        doc.setDrawColor(213, 218, 226);
        doc.setLineWidth(1);
        doc.line(marginX, topMargin + 44, pageWidth - marginX, topMargin + 44);
    }

    function drawCover() {
        startPage([247, 245, 239]);

        doc.setFont('times', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(25, 32, 45);
        doc.text(title, marginX, 150);

        doc.setFont('times', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(85, 94, 108);
        const lines = doc.splitTextToSize('A book built from your Presently entries.', contentWidth * 0.75);
        doc.text(lines, marginX, 188);
        doc.text(`${entries.length} entries`, marginX, 244);

        addFooter();
    }

    function startEntryPage(entry, index, continued = false) {
        startPage();
        drawHeader(title, `Entry ${index + 1} of ${entries.length}${continued ? ' continued' : ''}`);

        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(32, 43, 61);
        doc.text(entry.entryDate, marginX, topMargin + 72);
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(42, 48, 59);
    }

    drawCover();

    entries.forEach((entry, index) => {
        startEntryPage(entry, index);

        let cursorY = topMargin + 106;
        const paragraphs = entry.entryContent.split('\n');

        paragraphs.forEach((paragraph) => {
            const wrappedLines = paragraph ? doc.splitTextToSize(paragraph, contentWidth) : [''];

            wrappedLines.forEach((line) => {
                if (cursorY > pageHeight - bottomMargin) {
                    addFooter();
                    startEntryPage(entry, index, true);
                    cursorY = topMargin + 106;
                }

                if (line === '') {
                    cursorY += 12;
                    return;
                }

                doc.text(line, marginX, cursorY);
                cursorY += 18;
            });
        });

        addFooter();
    });

    const safeTitle = title.trim().replace(/[^a-z0-9\-\s]+/gi, '').replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase() || 'presently-journal';
    doc.save(`${safeTitle}.pdf`);
}

buildPdfButton.addEventListener('click', () => {
    try {
        const entries = parsePresentlyCsv(sourceInput.value);
        const title = bookTitleInput.value.trim() || 'My Presently Journal';
        setError('');
        render(entries, normalizeLines(sourceInput.value).length);

        if (entries.length === 0) {
            throw new Error('Add entries before creating a PDF book.');
        }

        buildBookPdf(entries, title);
    } catch (error) {
        setError(error instanceof Error ? error.message : 'Unable to create the PDF.');
    }
});

fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) {
        return;
    }

    sourceInput.value = await file.text();
    parseAndRender();
});

sourceInput.addEventListener('input', () => {
    setError('');
});

sourceInput.value = '';
render([], 0);