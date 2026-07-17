---
name: pdf-report
description: Use when adding a new PDF-generating report view, or changing how an existing one builds its PDF (columns, rows, metadata), in this Vue accounting app. Explains the shared PdfReportBuilder engine in src/pdf/ and its contract, instead of hand-rolling jsPDF/jspdf-autotable calls.
---

### PDF report generation (`src/pdf/`)
All PDF-producing views (there are 15) build their PDFs through a shared engine instead of hand-rolling `jsPDF`/`jspdf-autotable` calls:
- `PdfReportBuilder.js` — `buildReportPdf({ orientation, metadata, columns, rows })` is the single entry point every view calls; it composes the header and table renderers and returns the `jsPDF` doc (caller still does `doc.output('blob')` + `saveAs`).
- `PdfHeaderRenderer.js` — draws the shared navy/gold header card (logo, empresa/dirección, tipo de reporte, especificación).
- `PdfTableRenderer.js` — wraps `autoTable` with the shared navy header row, beige highlight rows, green/red coloring for `acredita`/`debita` columns, and the footer (page numbers + generation date).
- `theme.js` / `format.js` — shared color palette and `formatCurrency()` (handles comma-formatted numeric strings from the API, not just plain numbers).
- `logo.js` — base64-embedded logo used by the header renderer.

Contract: `columns` is `[{ header, dataKey, align?, type? }]` (`type` one of `'text' | 'currency' | 'acredita' | 'debita'`); `rows` are plain objects keyed by `dataKey`, optionally with `_variant: 'highlight'` (saldo inicial / totals rows → beige+bold) and/or `_cellColors: { [dataKey]: 'positive'|'negative' }` for one-off cell coloring (e.g. an unbalanced "Partida"). Adding a new report = new columns/rows shape, not a new copy of the drawing code.
