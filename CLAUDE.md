# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Accounting system for "Hogar de Ancianas Santa Luisa de Marillac" — a Vue 3 SPA that manages financial records (income, expenses, bank transfers, balance sheets, etc.) for two independent projects: **Proyecto Agrícola** and **Proyecto Capilla**. Built on CoreUI Free Vue Admin Template.

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (src/**/*.{js,vue})
npm run preview  # Preview production build
```

No test framework is configured.

## Architecture

### Two-Project System

The app serves two accounting projects (Agrícola and Capilla) selected at login. The selected project determines:
- Which sidebar navigation is shown (`_nav.js` = Capilla, `_nav2.js` = Agrícola via `useNavCapilla()` / `useNavAgricola()`)
- Which API endpoints and data the views operate on

The selection is stored in Vuex (`selectedProject`) and persisted to `localStorage`.

### Route-to-Feature Mapping

Routes reuse generic CoreUI template paths but serve domain-specific accounting views. The mapping is non-obvious:

| Route path | Actual feature |
|---|---|
| `/base/accordion` | Egreso Agrícola |
| `/base/breadcrumbs` | Egreso Capilla |
| `/buttons/standard-buttons` | Ingreso Agrícola |
| `/buttons/button-groups` | Ingreso Capilla |
| `/forms/form-control` | Depósito de caja Agrícola |
| `/forms/checks-radios` | Depósito de caja Capilla |
| `/forms/select` | Retiros de bancos Agrícola |
| `/forms/range` | Retiros de bancos Capilla |
| `/icons/coreui-icons` | Libro Caja Agrícola |
| `/forms/input-group` | Libro Caja Capilla |
| `/icons/brands` | Libro Bancos Agrícola |
| `/forms/floating-labels` | Libro Bancos Capilla |
| `/icons/flags` | Libro Diario Agrícola |
| `/forms/layout` | Libro Diario Capilla |
| `/base/collapses` | Ingresos y Egresos Agrícola |
| `/base/list-groups` | Ingresos y Egresos Capilla |
| `/notifications/cuentas` | Gestión de Cuentas Contables |
| `/notifications/modals` | Bancos |
| `/notifications/alerts` | Login CRUD |
| `/base/navs` | Cuentas Bancarias |
| `/base/Partidas` | Partidas Contables |
| `/widgets` | Desarrolladores |

Domain-specific routes use descriptive paths: `/base/EstadoResultadosCapilla`, `/base/BalanceGeneralAgricola`, `/base/AnticipoSobreComprasAgricola`, `/capilla/cuenta/:cuenta`, `/agricola/cuenta/:cuenta`.

### Auth & API

- JWT auth: token stored in Vuex/localStorage, attached to all Axios requests via interceptor in `main.js`
- Route guard in `router/index.js` checks `meta.requiresAuth` and redirects to Login
- API config in `src/config/constant.js`: backend at `apiUrl` (Java) and `laravelUrl` (Laravel)
- Vite proxies `/api` requests to `http://127.0.0.1:8000`

### State Management

Vuex store (`src/store/index.js`) manages: sidebar visibility, `selectedProject`, `projectToken`, and auth `token`. All persisted to `localStorage`.

### Styling

CSS is per-view in `src/styles/css/` (plain CSS files imported in each component's `<script>`). Global SCSS in `src/styles/`. CoreUI and Bootstrap 5 provide the base component library.

### PDF Generation

Several report views generate PDFs using `jspdf` + `jspdf-autotable` and `html2canvas` / `html2pdf.js`.

## Language

The codebase and UI are in Spanish. Variable names, labels, comments, and commit messages are all in Spanish.
