# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a Vue 3 + Vite frontend, originally scaffolded from the **CoreUI Free Vue Admin Template**, that has been heavily repurposed into an accounting system for two parallel projects/entities: **"Proyecto Agrícola"** and **"Proyecto Capilla"** (both under "Hogar Santa Luisa"). There is no backend in this repository — the app talks to a separate API expected at `http://127.0.0.1:8000` (referred to as `laravelUrl` in one config file, suggesting a Laravel backend).

## Commands

```bash
npm run dev      # Vite dev server (--force), default port 3000 per vite.config.mjs
npm run build    # production build via vite build
npm run preview  # preview a production build
npm run lint     # eslint "src/**/*.{js,vue}"
```

There is no test suite/framework configured in this repo (no Jest/Vitest/Cypress, no `test` script).

## Architecture

### Path alias
`@` and `@/` both resolve to `src/` (configured in `vite.config.mjs`). Use `@/...` imports for new code.

### Auth and the dual-project model
- Login (`src/views/pages/Login.vue`) posts to `POST http://127.0.0.1:8000/api/authenticate` with `{ usuarios, contrasenias, tipoProyecto }` where `tipoProyecto` is `'agricola'` or `'capilla'`.
- On success, the JWT-like token, a human label (`selectedProject`), and a `projectToken` (`'1'` for Agrícola, `'2'` for Capilla) are saved to both Vuex (`src/store/index.js`) and `localStorage`.
- `src/main.js` registers a global `axios.interceptors.request` that attaches `Authorization: Bearer <token>` from `localStorage` to every outgoing request — this happens automatically, no per-call setup needed.
- `src/router/index.js` has a global `beforeEach` guard that redirects to `Login` when a route has `meta: { requiresAuth: true }` and `store.getters.isAuthenticated` is false. Almost every route carries this meta flag.
- The two projects get **different sidebar navigation configs**: `src/_nav.js` is the **Agrícola** nav, `src/_nav2.js` is the **Capilla** nav — confirmed by the route content of each file (`AppSidebarNav.js` uses this mapping correctly). Confusingly, `DefaultLayout.vue` and `AppSidebar.vue` import them with the labels swapped (`useNavAgricola` bound to `_nav2`, `useNavCapilla` bound to `_nav`), but that mismapped `navConfig` is passed as an unused prop — `AppSidebarNav.js` ignores it and recomputes nav from `store.state.projectToken` itself, so the swap is dead/misleading code, not a live bug. Double-check which file you're editing.

### No centralized API client — read the filenames, not the config
Every view hardcodes its own `axios.post('http://127.0.0.1:8000/...')` calls inline. `src/config/constant.js` exports `apiUrl` and `laravelUrl`, but **nothing in the codebase imports them** — it's dead config, not the real source of truth for the backend URL. If you need to change the API host, you have to grep and update every view individually.

### View files vs. what they actually render
This is the single biggest gotcha in the codebase: many `.vue` files still carry their original CoreUI template demo name (and still live at the original demo route), but their content was fully replaced with a real accounting report. The component's internal `name:` field (not the filename) tells you what it really is. Known mappings:

| File | Route name | Actually is |
|---|---|---|
| `views/icons/CoreUIIcons.vue` | CoreUI Icons | Libro Caja (Agrícola) |
| `views/icons/Brands.vue` | Brands | Libro Bancos (Agrícola) |
| `views/icons/Flags.vue` | Flags | Libro Diario (Agrícola) |
| `views/forms/InputGroup.vue` | Input Group | Libro Caja (Capilla) |
| `views/forms/FloatingLabels.vue` | Floating Labels | Libro Bancos (Capilla) |
| `views/forms/Layout.vue` | Layout | Libro Diario (Capilla) |
| `views/base/Collapses.vue` | Collapses | Reporte Final (Agrícola), component name `ReporteAG` |
| `views/base/ListGroups.vue` | List Groups | Informe/Reporte Final (Capilla), component name `ReporteCapillaFinal` |

Before touching one of these views, read the `<script>` block's `name:` and the template header — don't assume from the path.

Beyond those, most report views come in explicit Agrícola/Capilla pairs with parallel (largely duplicated) logic: `BalanceGeneralAgricola.vue`/`BalanceGeneralCapilla.vue`, `EstadoResultadosAgricola.vue`/`EstadoResultadosCapilla.vue`, `DetalleCuentaAgricola.vue`/`DetalleCuentaCapilla.vue` ("Libro Mayor" per-account detail), `AnticipoSobreComprasAgricola.vue`/`...Capilla.vue`. A fix or feature typically needs to be applied to both twins.

### PDF report generation (`src/pdf/`)
All PDF-producing views (there are 15) build their PDFs through a shared engine instead of hand-rolling `jsPDF`/`jspdf-autotable` calls:
- `PdfReportBuilder.js` — `buildReportPdf({ orientation, metadata, columns, rows })` is the single entry point every view calls; it composes the header and table renderers and returns the `jsPDF` doc (caller still does `doc.output('blob')` + `saveAs`).
- `PdfHeaderRenderer.js` — draws the shared navy/gold header card (logo, empresa/dirección, tipo de reporte, especificación).
- `PdfTableRenderer.js` — wraps `autoTable` with the shared navy header row, beige highlight rows, green/red coloring for `acredita`/`debita` columns, and the footer (page numbers + generation date).
- `theme.js` / `format.js` — shared color palette and `formatCurrency()` (handles comma-formatted numeric strings from the API, not just plain numbers).

Contract: `columns` is `[{ header, dataKey, align?, type? }]` (`type` one of `'text' | 'currency' | 'acredita' | 'debita'`); `rows` are plain objects keyed by `dataKey`, optionally with `_variant: 'highlight'` (saldo inicial / totals rows → beige+bold) and/or `_cellColors: { [dataKey]: 'positive'|'negative' }` for one-off cell coloring (e.g. an unbalanced "Partida"). Adding a new report = new columns/rows shape, not a new copy of the drawing code.

### Row numbering helper
`utils/numeracion.js` (`aplicarNumeracion`) computes hierarchical row numbers (e.g. `1`, `1.1`, `1.2`, `2`) for the Balance General / Estado de Resultados-style reports, based on each row's `nivel` field. Rows without a `nivel` get `cuenta: ''`.

### Styling
Global SCSS entry is `src/styles/style.scss` (imports CoreUI/Bootstrap). Most report views additionally import a dedicated, non-scoped CSS file from `src/styles/css/` directly in their `<script>` block (e.g. `import '../../styles/css/LibroCajaA.css'`) rather than using SFC `<style scoped>`.
