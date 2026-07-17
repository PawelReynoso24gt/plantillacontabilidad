# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a Vue 3 + Vite frontend, originally scaffolded from the **CoreUI Free Vue Admin Template**, that has been heavily repurposed into an accounting system for two parallel projects/entities: **"Proyecto Agrícola"** and **"Proyecto Capilla"** (both under "Hogar Santa Luisa"). There is no backend in this repository — the app talks to a separate API expected at `http://127.0.0.1:8000` (referred to as `laravelUrl` in one config file, suggesting a Laravel backend).

## Commands

There is no test suite/framework configured in this repo (no Jest/Vitest/Cypress, no `test` script).

## Architecture

### Path alias
`@` and `@/` both resolve to `src/` (configured in `vite.config.mjs`). Use `@/...` imports for new code.

Note: `vite.config.ts` also exists at the repo root and is a near-empty stub (no aliases, no dev-server proxy, no port). It's dead/leftover — `vite.config.mjs` is the one actually loaded and holds all real config (aliases, `/api` proxy, port 3000). Edit `.mjs`, not `.ts`.

### Auth and the dual-project model
- Login (`src/views/pages/Login.vue`) posts to `POST http://127.0.0.1:8000/api/authenticate` with `{ usuarios, contrasenias, tipoProyecto }` where `tipoProyecto` is `'agricola'` or `'capilla'`.
- On success, the JWT-like token, a human label (`selectedProject`), and a `projectToken` (`'1'` for Agrícola, `'2'` for Capilla) are saved to both Vuex (`src/store/index.js`) and `localStorage`.
- `src/main.js` registers a global `axios.interceptors.request` that attaches `Authorization: Bearer <token>` from `localStorage` to every outgoing request — this happens automatically, no per-call setup needed.
- `src/router/index.js` has a global `beforeEach` guard that redirects to `Login` when a route has `meta: { requiresAuth: true }` and `store.getters.isAuthenticated` is false. Almost every route carries this meta flag.
- The two projects get **different sidebar navigation configs**: `src/_nav.js` is the **Agrícola** nav, `src/_nav2.js` is the **Capilla** nav — confirmed by the route content of each file (`AppSidebarNav.js` uses this mapping correctly). Confusingly, `DefaultLayout.vue` and `AppSidebar.vue` import them with the labels swapped (`useNavAgricola` bound to `_nav2`, `useNavCapilla` bound to `_nav`), but that mismapped `navConfig` is passed as an unused prop — `AppSidebarNav.js` ignores it and recomputes nav from `store.state.projectToken` itself, so the swap is dead/misleading code, not a live bug. Double-check which file you're editing.

### No centralized API client — read the filenames, not the config
Every view hardcodes its own `axios.post('http://127.0.0.1:8000/...')` calls inline, using the absolute URL rather than a relative `/api/...` path. `src/config/constant.js` exports `apiUrl` (currently `http://192.168.19.66:8080`, stale/wrong and not `127.0.0.1:8000`) and `laravelUrl`, but **nothing in the codebase imports them** — it's dead config, not the real source of truth for the backend URL. `vite.config.mjs` also defines a dev-server proxy (`/api` → `http://127.0.0.1:8000`), but since views call the absolute URL directly, that proxy is likewise unused in practice. If you need to change the API host, you have to grep and update every view individually.

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
| `views/theme/Colors.vue` | Colors (route `/theme/colors`) | Proyecto Agrícola landing/home page, component name `Dashboard` |
| `views/dashboard/Dashboard.vue` | Dashboard (route `/honey123`) | Proyecto Capilla landing/home page, component name `DashboardCapilla` |
| `views/widgets/Widgets.vue` | Widgets | "Desarrolladores" (developer credits page), component name `Agradecimientos` |
| `views/base/Accordion.vue` | Accordion | Registro de Egreso (Agrícola) |
| `views/base/Breadcrumbs.vue` | Breadcrumbs | Registro de Egresos (Capilla) |
| `views/buttons/Buttons.vue` | Buttons2 | Registro de Ingreso (Agrícola) |
| `views/buttons/ButtonGroups.vue` | Button Groups | Registro de Ingresos (Capilla) |
| `views/forms/ChecksRadios.vue` | Checks & Radios | Depósitos de Caja (Capilla) |
| `views/forms/Range.vue` | Range | Retiros de Bancos (Capilla) |
| `views/forms/FormControl.vue` | Form Control | Depósitos/Traslados internos de Caja (Agrícola-only; no routed Capilla twin found) |
| `views/forms/Select.vue` | Select | Retiros/Traslados internos de Bancos (Agrícola-only; no routed Capilla twin found) |

The two project landing pages are themselves a gotcha: neither lives at an intuitive `/dashboard` route. Agrícola's home is at `/theme/colors`, Capilla's is at `/honey123`.

Before touching one of these views, read the `<script>` block's `name:` and the template header — don't assume from the path. **Caveat:** for the `Accordion`/`Breadcrumbs`/`Buttons`/`ButtonGroups`/`ChecksRadios`/`Range`/`FormControl`/`Select` group above, the internal `name:` field is itself useless — every one of them was copy-pasted with `name: 'Accordion'` left unchanged. For these, identify the view by its route (`router/index.js`) or the template's `<h1>`/`<h2>` title text instead.

Beyond those, most report views come in explicit Agrícola/Capilla pairs with parallel (largely duplicated) logic: `BalanceGeneralAgricola.vue`/`BalanceGeneralCapilla.vue`, `EstadoResultadosAgricola.vue`/`EstadoResultadosCapilla.vue`, `DetalleCuentaAgricola.vue`/`DetalleCuentaCapilla.vue` ("Libro Mayor" per-account detail), `AnticipoSobreComprasAgricola.vue`/`...Capilla.vue`. A fix or feature typically needs to be applied to both twins.

### Row numbering helper
`aplicarNumeracion` (in `utils/numeracion.js` at the **project root**, not `src/utils/` — the file's own header comment says `src/utils/numeracion.js` but that's stale/wrong, and views import it via `../../../utils/numeracion`) computes hierarchical row numbers (e.g. `1`, `1.1`, `1.2`, `2`) for the Balance General / Estado de Resultados-style reports, based on each row's `nivel` field. Rows without a `nivel` get `cuenta: ''`.

### Styling
Global SCSS entry is `src/styles/style.scss` (imports CoreUI/Bootstrap). Most report views additionally import a dedicated, non-scoped CSS file from `src/styles/css/` directly in their `<script>` block (e.g. `import '../../styles/css/LibroCajaA.css'`) rather than using SFC `<style scoped>`.
