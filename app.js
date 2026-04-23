const DATE_LINE_RE = /^(\d{4}-\d{2}-\d{2}),(.*)$/;

const fileInput = document.getElementById('fileInput');
const bookTitleInput = document.getElementById('bookTitle');
const buildPdfButton = document.getElementById('buildPdfButton');
const settingsToggleButton = document.getElementById('settingsToggleButton');
const exportStyleButton = document.getElementById('exportStyleButton');
const exportStylePanel = document.getElementById('exportStylePanel');
const exportStyleOptions = Array.from(document.querySelectorAll('[data-export-style]'));
const settingsPanel = document.getElementById('settingsPanel');
const actionsHint = document.getElementById('actionsHint');
const resultsList = document.getElementById('resultsList');
const errorBanner = document.getElementById('errorBanner');
const entryCount = document.getElementById('entryCount');
const yearFilterWrap = document.getElementById('yearFilterWrap');
const yearFilter = document.getElementById('yearFilter');
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');
const dateRangeHint = document.getElementById('dateRangeHint');
const entryOrder = document.getElementById('entryOrder');
const dateFormat = document.getElementById('dateFormat');
const includeWeekdayInput = document.getElementById('includeWeekday');
const includeWeekdayWrap = includeWeekdayInput.closest('.setting-field');
const MONTH_ABBR_WITH_PERIOD = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];

const EXPORT_STYLES = {
    default: {
        label: 'Default',
        colors: {
            paper: [255, 255, 255],
            paperAccent: [250, 252, 255],
            text: [28, 36, 48],
            muted: [96, 104, 116],
            line: [215, 219, 224],
            pageNumber: [129, 138, 150],
            accent: [3, 105, 161]
        },
        fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            date: 'helvetica',
            dateStyle: 'bold'
        },
        typography: {
            coverTitleSize: 32,
            coverBodySize: 13,
            dateSize: 16,
            bodySize: 11.25,
            lineHeight: 17,
            paragraphGap: 10,
            emptyLineHeight: 10,
            dateGap: 30
        },
        layout: {
            card: true,
            accentStripe: true,
            entryGap: 8,
            pageNumberAlign: 'right',
            runningHeader: true
        }
    },
    ink: {
        label: 'Ink saver',
        colors: {
            paper: [255, 255, 255],
            paperAccent: [255, 255, 255],
            text: [28, 28, 28],
            muted: [88, 88, 88],
            line: [206, 206, 206],
            pageNumber: [122, 122, 122],
            accent: [60, 60, 60]
        },
        fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            date: 'helvetica',
            dateStyle: 'bold'
        },
        typography: {
            coverTitleSize: 32,
            coverBodySize: 13,
            dateSize: 16,
            bodySize: 11,
            lineHeight: 17,
            paragraphGap: 9,
            emptyLineHeight: 9,
            dateGap: 28
        },
        layout: {
            card: true,
            accentStripe: false,
            entryGap: 8,
            pageNumberAlign: 'right',
            runningHeader: true
        }
    },
    typewriter: {
        label: 'Typewriter',
        colors: {
            paper: [252, 250, 245],
            paperAccent: [248, 245, 237],
            text: [31, 29, 26],
            muted: [90, 84, 75],
            line: [202, 196, 186],
            pageNumber: [106, 100, 92],
            accent: [78, 68, 54]
        },
        fonts: {
            heading: 'courier',
            body: 'courier',
            date: 'courier',
            dateStyle: 'normal'
        },
        typography: {
            coverTitleSize: 30,
            coverBodySize: 12,
            dateSize: 15,
            bodySize: 10.75,
            lineHeight: 17,
            paragraphGap: 9,
            emptyLineHeight: 9,
            dateGap: 26
        },
        layout: {
            card: true,
            accentStripe: true,
            entryGap: 8,
            pageNumberAlign: 'right',
            runningHeader: true
        }
    },
    editorial: {
        label: 'Minimal Editorial',
        colors: {
            paper: [255, 255, 255],
            paperAccent: [255, 255, 255],
            text: [22, 22, 22],
            muted: [98, 98, 98],
            line: [214, 214, 214],
            pageNumber: [128, 128, 128],
            accent: [76, 76, 76]
        },
        fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            date: 'helvetica',
            dateStyle: 'bold'
        },
        typography: {
            coverTitleSize: 33,
            coverBodySize: 13,
            dateSize: 15,
            bodySize: 10.9,
            lineHeight: 17,
            paragraphGap: 9,
            emptyLineHeight: 9,
            dateGap: 22
        },
        layout: {
            marginX: 72,
            card: false,
            accentStripe: false,
            sectionRule: true,
            entryGap: 14,
            pageNumberAlign: 'center',
            runningHeader: true
        }
    },
    paperback: {
        label: 'Warm Paperback',
        colors: {
            paper: [252, 248, 238],
            paperAccent: [247, 242, 230],
            text: [56, 44, 34],
            muted: [114, 98, 83],
            line: [214, 200, 182],
            pageNumber: [130, 115, 101],
            accent: [153, 123, 95]
        },
        fonts: {
            heading: 'times',
            body: 'times',
            date: 'times',
            dateStyle: 'bold'
        },
        typography: {
            coverTitleSize: 33,
            coverBodySize: 13,
            dateSize: 17,
            bodySize: 11.2,
            lineHeight: 17,
            paragraphGap: 10,
            emptyLineHeight: 10,
            dateGap: 26
        },
        layout: {
            card: true,
            cardRadius: 6,
            accentStripe: false,
            entryGap: 10,
            pageNumberAlign: 'center',
            runningHeader: true
        }
    },
    notebook: {
        label: 'Notebook',
        colors: {
            paper: [255, 255, 255],
            paperAccent: [255, 255, 255],
            text: [26, 34, 44],
            muted: [94, 109, 126],
            line: [204, 223, 240],
            pageNumber: [116, 128, 142],
            accent: [28, 100, 156]
        },
        fonts: {
            heading: 'helvetica',
            body: 'courier',
            date: 'helvetica',
            dateStyle: 'bold'
        },
        typography: {
            coverTitleSize: 31,
            coverBodySize: 13,
            dateSize: 15,
            bodySize: 10.8,
            lineHeight: 17,
            paragraphGap: 9,
            emptyLineHeight: 9,
            dateGap: 21
        },
        layout: {
            card: false,
            accentStripe: false,
            sectionRule: false,
            notebookLines: true,
            notebookLineOffset: 2,
            entryGap: 14,
            pageNumberAlign: 'right',
            runningHeader: true
        }
    },
    zen: {
        label: 'Zen Journal',
        colors: {
            paper: [253, 254, 254],
            paperAccent: [248, 251, 250],
            text: [40, 52, 56],
            muted: [109, 124, 127],
            line: [218, 226, 227],
            pageNumber: [134, 146, 149],
            accent: [80, 123, 122]
        },
        fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            date: 'helvetica',
            dateStyle: 'bold'
        },
        typography: {
            coverTitleSize: 31,
            coverBodySize: 13,
            dateSize: 14,
            bodySize: 10.9,
            lineHeight: 17,
            paragraphGap: 10,
            emptyLineHeight: 10,
            dateGap: 26
        },
        layout: {
            card: true,
            cardRadius: 14,
            accentStripe: false,
            entryGap: 14,
            pageNumberAlign: 'right',
            runningHeader: true
        }
    },
    timeline: {
        label: 'Timeline',
        colors: {
            paper: [255, 255, 255],
            paperAccent: [252, 254, 255],
            text: [24, 38, 54],
            muted: [95, 114, 128],
            line: [205, 217, 227],
            pageNumber: [120, 133, 145],
            accent: [30, 102, 158]
        },
        fonts: {
            heading: 'helvetica',
            body: 'helvetica',
            date: 'helvetica',
            dateStyle: 'bold'
        },
        typography: {
            coverTitleSize: 31,
            coverBodySize: 13,
            dateSize: 15,
            bodySize: 10.9,
            lineHeight: 17,
            paragraphGap: 9,
            emptyLineHeight: 9,
            dateGap: 22
        },
        layout: {
            card: false,
            accentStripe: false,
            sectionRule: false,
            timeline: true,
            timelineOffset: 18,
            entryGap: 14,
            pageNumberAlign: 'right',
            runningHeader: true
        }
    }
};

let uploadedCsvText = '';
let allEntries = [];
let currentEntries = [];
let exportStyleKey = 'default';

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

function setSettingsPanelOpen(isOpen) {
    settingsPanel.classList.toggle('is-hidden', !isOpen);
    settingsToggleButton.setAttribute('aria-expanded', String(isOpen));
}

function setExportStylePanelOpen(isOpen) {
    exportStylePanel.classList.toggle('is-hidden', !isOpen);
    exportStyleButton.setAttribute('aria-expanded', String(isOpen));
}

function getExportStyle(styleKey) {
    return EXPORT_STYLES[styleKey] || EXPORT_STYLES.default;
}

function setExportStyle(styleKey) {
    exportStyleKey = EXPORT_STYLES[styleKey] ? styleKey : 'default';
    const activeStyle = getExportStyle(exportStyleKey);

    exportStyleOptions.forEach((optionButton) => {
        optionButton.classList.toggle('is-active', optionButton.dataset.exportStyle === exportStyleKey);
    });

    exportStyleButton.setAttribute('aria-label', `Choose export style. Current style: ${activeStyle.label}.`);
}

function updateActionAvailability() {
    const hasEntries = allEntries.length > 0;
    settingsToggleButton.disabled = !hasEntries;
    exportStyleButton.disabled = !hasEntries;
    buildPdfButton.disabled = !hasEntries;

    if (!hasEntries) {
        setSettingsPanelOpen(false);
        setExportStylePanelOpen(false);
        actionsHint.textContent = 'Upload a CSV to enable settings and download.';
        return;
    }

    actionsHint.textContent = 'Settings and download are enabled.';
}

function getYear(entryDate) {
    return entryDate.slice(0, 4);
}

function updateWeekdayToggleState() {
    const choice = dateFormat.value || 'iso';
    const canIncludeWeekday = choice === 'long' || choice === 'short';

    includeWeekdayWrap.classList.toggle('is-hidden', !canIncludeWeekday);
    includeWeekdayInput.disabled = !canIncludeWeekday;
    if (!canIncludeWeekday) {
        includeWeekdayInput.checked = false;
    }
}

function formatEntryDate(entryDate) {
    const [yearStr, monthStr, dayStr] = entryDate.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const choice = dateFormat.value || 'iso';
    const date = new Date(Date.UTC(year, month - 1, day));
    let formatted = entryDate;

    if (choice === 'long') {
        formatted = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(date);
    } else if (choice === 'short') {
        formatted = `${MONTH_ABBR_WITH_PERIOD[month - 1]} ${day}, ${year}`;
    } else if (choice === 'us') {
        formatted = new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(date);
    }

    const canIncludeWeekday = choice === 'long' || choice === 'short';
    if (!canIncludeWeekday || !includeWeekdayInput.checked) {
        return formatted;
    }

    const weekday = new Intl.DateTimeFormat('en-US', {
        weekday: choice === 'short' ? 'short' : 'long',
        timeZone: 'UTC'
    }).format(date);

    return `${weekday}, ${formatted}`;
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

    dateRangeHint.textContent = `Available range: ${formatEntryDate(minDate)} to ${formatEntryDate(maxDate)}`;
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

function getExportTimeframeLabel() {
    const selectedYear = yearFilter.value || 'all';
    const selectedFrom = dateFromInput.value;
    const selectedTo = dateToInput.value;

    if (selectedFrom && selectedTo) {
        return `Entries from ${formatEntryDate(selectedFrom)} to ${formatEntryDate(selectedTo)}`;
    }

    if (selectedFrom) {
        return `Entries from ${formatEntryDate(selectedFrom)} onward`;
    }

    if (selectedTo) {
        return `Entries through ${formatEntryDate(selectedTo)}`;
    }

    if (selectedYear !== 'all') {
        return `Entries from ${selectedYear}`;
    }

    return '';
}

function toFileNameSegment(value) {
    return value.trim()
        .replace(/[^a-z0-9\-\s]+/gi, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
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
                <time datetime="${entry.entryDate}">${formatEntryDate(entry.entryDate)}</time>
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

function buildBookPdf(entries, title, styleKey = 'default') {
    const pdfApi = window.jspdf;
    if (!pdfApi?.jsPDF) {
        throw new Error('PDF library failed to load. Check your internet connection and try again.');
    }

    const style = getExportStyle(styleKey);
    const layout = style.layout || {};
    const typography = style.typography || {};

    const { jsPDF } = pdfApi;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = layout.marginX || 56;
    const topMargin = layout.topMargin || 72;
    const bottomMargin = layout.bottomMargin || 58;
    const contentWidth = pageWidth - marginX * 2;
    let pageNumber = 0;
    let cursorY = topMargin;

    const colors = style.colors;
    const headingFont = style.fonts?.heading || 'helvetica';
    const bodyFont = style.fonts?.body || 'helvetica';
    const dateFont = style.fonts?.date || headingFont;
    const dateFontStyle = style.fonts?.dateStyle || 'bold';
    const coverTitleSize = typography.coverTitleSize || 32;
    const coverBodySize = typography.coverBodySize || 13;
    const dateSize = typography.dateSize || 16;
    const bodySize = typography.bodySize || 11.25;
    const lineHeight = typography.lineHeight || 17;
    const paragraphGap = typography.paragraphGap || 10;
    const emptyLineHeight = typography.emptyLineHeight || 10;
    const dateGap = typography.dateGap || 30;
    const entryTopPadding = layout.entryTopPadding || 18;
    const entryBottomPadding = layout.entryBottomPadding || 12;
    const entryInnerPaddingX = layout.entryInnerPaddingX || 18;
    const entryGap = layout.entryGap || 8;
    const cardRadius = layout.cardRadius || 10;
    const showCard = layout.card !== false;
    const showAccentStripe = layout.accentStripe !== false;
    const showSectionRule = layout.sectionRule !== false;
    const showNotebookLines = Boolean(layout.notebookLines);
    const notebookLineOffset = layout.notebookLineOffset ?? 2;
    const isTimeline = Boolean(layout.timeline);
    const timelineOffset = layout.timelineOffset || 18;
    const pageNumberAlign = layout.pageNumberAlign || 'right';
    const showRunningHeader = layout.runningHeader !== false;

    function setBodyFont(size = 12) {
        doc.setFont(bodyFont, 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...colors.text);
    }

    function drawRunningHeader(label) {
        if (!showRunningHeader) {
            return;
        }

        doc.setFont(headingFont, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...colors.accent);
        doc.text(label, marginX, 34);

        doc.setDrawColor(...colors.line);
        doc.setLineWidth(0.75);
        doc.line(marginX, 44, pageWidth - marginX, 44);
    }

    function drawPageFooter() {
        doc.setFont(bodyFont, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colors.pageNumber);
        if (pageNumberAlign === 'center') {
            doc.text(String(pageNumber), pageWidth / 2, pageHeight - 26, { align: 'center' });
            return;
        }

        doc.text(String(pageNumber), pageWidth - marginX, pageHeight - 26, { align: 'right' });
    }

    function paintPageBackground(isCover = false) {
        doc.setFillColor(...(isCover ? colors.paperAccent : colors.paper));
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    function measureEntryHeight(entry, innerWidth) {
        setBodyFont(bodySize);

        const paragraphs = entry.entryContent.split('\n');
        const bodyHeight = paragraphs.reduce((total, paragraph, index) => {
            if (paragraph === '') {
                return total + emptyLineHeight;
            }

            const wrappedLines = doc.splitTextToSize(paragraph, innerWidth);
            const wrappedHeight = wrappedLines.length * lineHeight;
            const trailingGap = index < paragraphs.length - 1 ? paragraphGap : 0;
            return total + wrappedHeight + trailingGap;
        }, 0);

        return entryTopPadding + dateGap + bodyHeight + entryBottomPadding;
    }

    function getJournalHeadingLabel() {
        const timeframeLabel = getExportTimeframeLabel();
        return timeframeLabel ? `Journal - ${timeframeLabel}` : 'Journal';
    }

    function addNewPage() {
        if (pageNumber > 0) {
            drawPageFooter();
            doc.addPage();
        } else {
            pageNumber = 1;
        }

        pageNumber += 1;
        paintPageBackground();
        drawRunningHeader(getJournalHeadingLabel());
        cursorY = topMargin;
    }

    function drawCover() {
        paintPageBackground(true);
        pageNumber = 1;
        const timeframeLabel = getExportTimeframeLabel();

        drawRunningHeader(getJournalHeadingLabel());

        doc.setFont(headingFont, 'bold');
        doc.setFontSize(coverTitleSize);
        doc.setTextColor(...colors.text);
        doc.text(title, marginX, 152);

        doc.setDrawColor(...colors.line);
        doc.setLineWidth(1);
        doc.line(marginX, 172, marginX + 118, 172);

        doc.setFont(bodyFont, 'normal');
        doc.setFontSize(coverBodySize);
        doc.setTextColor(...colors.muted);
        const lines = doc.splitTextToSize('A journal built from your entries.', contentWidth * 0.72);
        doc.text(lines, marginX, 198);
        if (timeframeLabel) {
            doc.setFontSize(11);
            doc.setTextColor(...colors.accent);
            const timeframeLines = doc.splitTextToSize(timeframeLabel, contentWidth * 0.72);
            doc.text(timeframeLines, marginX, 232);
        }
        doc.setFont(headingFont, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...colors.muted);
        doc.text(`${entries.length} entries`, marginX, timeframeLabel ? 266 : 252);

        drawPageFooter();
    }

    function checkPageBreak(spaceNeeded = 20) {
        if (cursorY + spaceNeeded > pageHeight - bottomMargin) {
            addNewPage();
            setBodyFont();
        }
    }

    drawCover();
    addNewPage();

    entries.forEach((entry, index) => {
        const innerWidth = showCard
            ? contentWidth - (entryInnerPaddingX * 2)
            : (isTimeline ? contentWidth - (timelineOffset + 26) : contentWidth);
        const entryBlockHeight = measureEntryHeight(entry, innerWidth);

        if (cursorY + entryBlockHeight > pageHeight - bottomMargin) {
            addNewPage();
            setBodyFont(bodySize);
        }

        let entryX = marginX;
        let entryY = cursorY + entryTopPadding + 2;

        if (showCard) {
            doc.setDrawColor(...colors.line);
            doc.setLineWidth(0.7);
            doc.roundedRect(marginX, cursorY, contentWidth, entryBlockHeight, cardRadius, cardRadius, 'S');

            if (showAccentStripe) {
                doc.setDrawColor(...colors.accent);
                doc.setLineWidth(2.2);
                doc.line(marginX + 10, cursorY + 10, marginX + 10, cursorY + entryBlockHeight - 10);
            }

            entryX = marginX + entryInnerPaddingX;
        } else if (isTimeline) {
            const timelineX = marginX + timelineOffset;
            doc.setDrawColor(...colors.line);
            doc.setLineWidth(1);
            doc.line(timelineX, cursorY + 6, timelineX, cursorY + entryBlockHeight - 6);
            doc.setFillColor(...colors.accent);
            doc.circle(timelineX, entryY - 4, 2.8, 'F');
            entryX = timelineX + 14;
        } else {
            entryX = marginX;
            if (showSectionRule && index > 0) {
                doc.setDrawColor(...colors.line);
                doc.setLineWidth(0.7);
                doc.line(marginX, cursorY + 2, pageWidth - marginX, cursorY + 2);
                entryY += 10;
            }
        }

        doc.setFont(dateFont, dateFontStyle);
        doc.setFontSize(dateSize);
        doc.setTextColor(...colors.text);
        doc.text(formatEntryDate(entry.entryDate), entryX, entryY);
        entryY += dateGap;

        setBodyFont(bodySize);

        if (showNotebookLines) {
            doc.setDrawColor(...colors.line);
            doc.setLineWidth(0.55);
            let lineY = entryY + notebookLineOffset;
            const bodyBottomY = cursorY + entryBlockHeight - 4;
            while (lineY < bodyBottomY) {
                doc.line(entryX, lineY, entryX + innerWidth, lineY);
                lineY += lineHeight;
            }
        }

        const paragraphs = entry.entryContent.split('\n');

        paragraphs.forEach((paragraph, pIdx) => {
            if (paragraph === '') {
                entryY += emptyLineHeight;
                return;
            }

            const wrappedLines = doc.splitTextToSize(paragraph, innerWidth);

            wrappedLines.forEach((line) => {
                doc.text(line, entryX, entryY);
                entryY += lineHeight;
            });

            if (pIdx < paragraphs.length - 1) {
                entryY += paragraphGap;
            }
        });

        cursorY += entryBlockHeight + entryGap;
    });

    drawPageFooter();

    const safeTitle = toFileNameSegment(title) || 'presently-journal';
    const timeframeLabel = getExportTimeframeLabel();
    const timeframeSuffix = timeframeLabel ? `-${toFileNameSegment(timeframeLabel)}` : '';
    doc.save(`${safeTitle}${timeframeSuffix}.pdf`);
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

        buildBookPdf(entries, title, exportStyleKey);
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
        updateActionAvailability();
        refreshPreview();
        return;
    }

    try {
        uploadedCsvText = await file.text();
        const entries = parsePresentlyCsv(uploadedCsvText);
        allEntries = entries;
        setError('');
        updateYearOptions(allEntries);
        updateActionAvailability();
        refreshPreview();
    } catch (error) {
        uploadedCsvText = '';
        allEntries = [];
        updateYearOptions(allEntries);
        updateActionAvailability();
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

dateFormat.addEventListener('change', () => {
    updateWeekdayToggleState();
    refreshPreview();
});

includeWeekdayInput.addEventListener('change', () => {
    refreshPreview();
});

settingsToggleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = !settingsPanel.classList.contains('is-hidden');
    setSettingsPanelOpen(!isOpen);
});

exportStyleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = !exportStylePanel.classList.contains('is-hidden');
    setExportStylePanelOpen(!isOpen);
});

exportStyleOptions.forEach((optionButton) => {
    optionButton.addEventListener('click', () => {
        setExportStyle(optionButton.dataset.exportStyle || 'default');
        setExportStylePanelOpen(false);
    });
});

document.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof Node) {
        const clickedInSettings = settingsPanel.contains(target) || settingsToggleButton.contains(target);
        const clickedInExportStyle = exportStylePanel.contains(target) || exportStyleButton.contains(target);

        if (!clickedInSettings) {
            setSettingsPanelOpen(false);
        }

        if (!clickedInExportStyle) {
            setExportStylePanelOpen(false);
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setSettingsPanelOpen(false);
        setExportStylePanelOpen(false);
    }
});

updateYearOptions(allEntries);
updateWeekdayToggleState();
updateDateRangeOptions(allEntries);
updateActionAvailability();
setExportStyle(exportStyleKey);
setSettingsPanelOpen(false);
setExportStylePanelOpen(false);
render([]);