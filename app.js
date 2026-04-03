const DATE_LINE_RE = /^(\d{4}-\d{2}-\d{2}),(.*)$/;

const fileInput = document.getElementById('fileInput');
const bookTitleInput = document.getElementById('bookTitle');
const buildPdfButton = document.getElementById('buildPdfButton');
const resultsList = document.getElementById('resultsList');
const errorBanner = document.getElementById('errorBanner');
const entryCount = document.getElementById('entryCount');
const yearFilterWrap = document.getElementById('yearFilterWrap');
const yearFilter = document.getElementById('yearFilter');
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');
const dateRangeHint = document.getElementById('dateRangeHint');
const entryOrder = document.getElementById('entryOrder');

let uploadedCsvText = '';
let allEntries = [];
let currentEntries = [];

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

function getYear(entryDate) {
    return entryDate.slice(0, 4);
}

function updateYearOptions(entries) {
    const years = Array.from(new Set(entries.map((entry) => getYear(entry.entryDate)))).sort((a, b) => b.localeCompare(a));
    const previousSelection = yearFilter.value || 'all';

    if (years.length <= 1) {
        yearFilterWrap.hidden = true;
        yearFilter.innerHTML = '<option value="all">All years</option>';
        yearFilter.value = 'all';
        return;
    }

    yearFilterWrap.hidden = false;
    yearFilter.innerHTML = ['<option value="all">All years</option>', ...years.map((year) => `<option value="${year}">${year}</option>`)].join('');
    yearFilter.value = years.includes(previousSelection) ? previousSelection : 'all';
}

function updateDateRangeOptions(entries) {
    const selectedYear = yearFilter.value || 'all';
    const yearScopedEntries = selectedYear === 'all'
        ? entries
        : entries.filter((entry) => getYear(entry.entryDate) === selectedYear);

    if (yearScopedEntries.length === 0) {
        dateFromInput.disabled = true;
        dateToInput.disabled = true;
        dateFromInput.value = '';
        dateToInput.value = '';
        dateFromInput.min = '';
        dateFromInput.max = '';
        dateToInput.min = '';
        dateToInput.max = '';
        dateRangeHint.textContent = 'Upload a file to enable date settings.';
        return;
    }

    const sortedDates = yearScopedEntries.map((entry) => entry.entryDate).sort((a, b) => a.localeCompare(b));
    const minDate = sortedDates[0];
    const maxDate = sortedDates[sortedDates.length - 1];

    dateFromInput.disabled = false;
    dateToInput.disabled = false;
    dateFromInput.min = minDate;
    dateFromInput.max = maxDate;
    dateToInput.min = minDate;
    dateToInput.max = maxDate;

    if (dateFromInput.value && (dateFromInput.value < minDate || dateFromInput.value > maxDate)) {
        dateFromInput.value = minDate;
    }

    if (dateToInput.value && (dateToInput.value < minDate || dateToInput.value > maxDate)) {
        dateToInput.value = maxDate;
    }

    if (dateFromInput.value && dateToInput.value && dateFromInput.value > dateToInput.value) {
        dateToInput.value = dateFromInput.value;
    }

    dateRangeHint.textContent = `Available range: ${minDate} to ${maxDate}`;
}

function applySettings(entries) {
    const selectedYear = yearFilter.value || 'all';
    const selectedFrom = dateFromInput.value;
    const selectedTo = dateToInput.value;
    const selectedOrder = entryOrder.value || 'desc';

    if (selectedFrom && selectedTo && selectedFrom > selectedTo) {
        throw new Error('Start date must be on or before end date.');
    }

    let output = entries;
    if (selectedYear !== 'all') {
        output = output.filter((entry) => getYear(entry.entryDate) === selectedYear);
    }

    if (selectedFrom) {
        output = output.filter((entry) => entry.entryDate >= selectedFrom);
    }

    if (selectedTo) {
        output = output.filter((entry) => entry.entryDate <= selectedTo);
    }

    output = [...output].sort((a, b) => selectedOrder === 'asc'
        ? a.entryDate.localeCompare(b.entryDate)
        : b.entryDate.localeCompare(a.entryDate));

    return output;
}

function render(entries) {
    currentEntries = entries;
    entryCount.textContent = String(entries.length);

    if (entries.length === 0) {
        const hasSourceEntries = allEntries.length > 0;
        resultsList.innerHTML = hasSourceEntries
            ? '<div class="empty-state">No entries match your current settings.</div>'
            : '<div class="empty-state">No entries yet. Load a file to create the book.</div>';
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

function refreshPreview() {
    try {
        updateDateRangeOptions(allEntries);
        setError('');
        render(applySettings(allEntries));
    } catch (error) {
        render([]);
        setError(error instanceof Error ? error.message : 'Unable to apply current settings.');
    }
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
    let cursorY = topMargin;

    function addNewPage() {
        if (pageNumber > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(122, 131, 145);
            doc.text(String(pageNumber), pageWidth - marginX, pageHeight - 28, { align: 'right' });
            doc.addPage();
        } else {
            pageNumber = 1;
        }

        pageNumber += 1;
        doc.setFillColor(251, 250, 246);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        cursorY = topMargin;
    }

    function drawCover() {
        doc.setFillColor(247, 245, 239);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        pageNumber = 1;

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

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(122, 131, 145);
        doc.text(String(pageNumber), pageWidth - marginX, pageHeight - 28, { align: 'right' });
    }

    function checkPageBreak(spaceNeeded = 20) {
        if (cursorY + spaceNeeded > pageHeight - bottomMargin) {
            addNewPage();
            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(42, 48, 59);
        }
    }

    drawCover();
    addNewPage();

    entries.forEach((entry, index) => {
        checkPageBreak(54);

        doc.setDrawColor(213, 218, 226);
        doc.setLineWidth(0.5);
        doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
        cursorY += 18;

        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(32, 43, 61);
        doc.text(entry.entryDate, marginX, cursorY);
        cursorY += 18;

        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(42, 48, 59);

        const paragraphs = entry.entryContent.split('\n');

        paragraphs.forEach((paragraph, pIdx) => {
            if (paragraph === '') {
                cursorY += 8;
                return;
            }

            const wrappedLines = doc.splitTextToSize(paragraph, contentWidth);

            wrappedLines.forEach((line) => {
                checkPageBreak(18);
                doc.text(line, marginX, cursorY);
                cursorY += 18;
            });
        });

        cursorY += 14;
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(122, 131, 145);
    doc.text(String(pageNumber), pageWidth - marginX, pageHeight - 28, { align: 'right' });

    const safeTitle = title.trim().replace(/[^a-z0-9\-\s]+/gi, '').replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase() || 'presently-journal';
    doc.save(`${safeTitle}.pdf`);
}

buildPdfButton.addEventListener('click', () => {
    try {
        const parsedEntries = allEntries.length > 0 ? allEntries : parsePresentlyCsv(uploadedCsvText);
        const entries = applySettings(parsedEntries);
        const title = bookTitleInput.value.trim() || 'My Presently Journal';
        setError('');
        render(entries);

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
        uploadedCsvText = '';
        allEntries = [];
        updateYearOptions(allEntries);
        refreshPreview();
        return;
    }

    try {
        uploadedCsvText = await file.text();
        const entries = parsePresentlyCsv(uploadedCsvText);
        allEntries = entries;
        setError('');
        updateYearOptions(allEntries);
        refreshPreview();
    } catch (error) {
        uploadedCsvText = '';
        allEntries = [];
        updateYearOptions(allEntries);
        refreshPreview();
        setError(error instanceof Error ? error.message : 'Unable to read the file.');
    }
});

yearFilter.addEventListener('change', () => {
    refreshPreview();
});

dateFromInput.addEventListener('change', () => {
    refreshPreview();
});

dateToInput.addEventListener('change', () => {
    refreshPreview();
});

entryOrder.addEventListener('change', () => {
    refreshPreview();
});

updateYearOptions(allEntries);
updateDateRangeOptions(allEntries);
render([]);