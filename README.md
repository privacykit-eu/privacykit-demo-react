# PrivacyKit React Demo

Small Vite + React demo showing how to use **PrivacyKit** web components and the **PrivacyKit JavaScript API** in a React app.

### What this demo shows

- Using `<consent-dialog>`, `<consent-guard>`, and `<consent-missing>` in a React project
- Loading PrivacyKit from the CDN (no bundler integration required)
- React-friendly updates when consent changes (listeners → state → re-render)
- Guarded scripts (`<script type="text/plain">`) that only execute after consent is granted
- TypeScript typings for the custom elements + `window.PrivacyKit` API

### Quickstart

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run preview
npm run lint
```

### How it works

#### 1) PrivacyKit is loaded in `index.html`

PrivacyKit is added via `<script>` tags in `index.html`. This registers the web components and (optionally) exposes the global API on `window.PrivacyKit`.

This file also contains examples of guarded scripts:

- A `<consent-guard consent="preferences">` block that creates `window.preferencesScript`
- A `<consent-guard consent="analytics">` block that creates `window.analyticsScript`
- A `<consent-guard consent="marketing">` block that creates `window.marketingScript`

Those globals only exist **after** the corresponding guard evaluates and activates its `type="text/plain"` scripts.

#### 2) React listens to PrivacyKit events in `src/App.tsx`

React does not automatically re-render when `window.PrivacyKit` or other `window.*` globals change. This demo subscribes to PrivacyKit events and updates React state so the UI stays in sync:

- `onReady` + `onConsentChanged`: keep a local snapshot of consent and trigger re-renders when consent changes.
- `onGuardEvaluated`: update the “script executed / blocked” messages, because that’s when guarded scripts have actually been processed.

The relevant code is documented inline in `src/App.tsx`.

#### 3) TypeScript support

This repo includes type declarations for:

- PrivacyKit custom elements + the `window.PrivacyKit` API: `privacykit.d.ts`
- Demo-only globals created by guarded scripts: `demo.d.ts`

They are included via `tsconfig.app.json`, so you get proper TS/JSX types in `src/App.tsx`.

### Useful files

- `index.html` — loads PrivacyKit + contains guarded script examples
- `src/App.tsx` — React UI + PrivacyKit event subscriptions
- `privacykit.d.ts` — TypeScript declarations for PrivacyKit
- `demo.d.ts` — demo globals (`window.*Script`) used by the UI
- `src/utils.ts` — `deleteCookies()` helper used to simulate first-time visits

### Notes

- This is a demo project meant to illustrate integration patterns; adapt as needed for production.

### Resetting consent during testing

The “Delete Cookies” button calls `deleteCookies()` in `src/utils.ts`, which tries to delete all cookies across common path/domain variants and then reloads the page to simulate a first-time visit.
