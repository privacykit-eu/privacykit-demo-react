export {};

declare global {
  /**
   * PrivacyKit web component type declarations.
   *
   * Drop this file into any TypeScript project and add it to the
   * "include" array in tsconfig.json, or place it in a `types/` folder
   * that TypeScript already scans.
   *
   * Supported components:
   *   <consent-dialog>   — cookie consent banner / modal
   *   <consent-guard>    — conditionally renders content based on consent
   *   <consent-missing>  — fallback shown when consent is absent
   *
   * CDN usage:
   *   <script type="module" src="https://cdn.privacykit.eu/privacykit.esm.js"></script>
   *
   * Framework notes:
   *   - React: JSX typings are included below (React 18 global + scoped JSX).
   *   - Vue 3: no extra typings required; configure `compilerOptions.isCustomElement`
   *            for `consent-dialog`, `consent-guard`, and `consent-missing`.
   *   - Angular: no extra typings required; add `CUSTOM_ELEMENTS_SCHEMA` where
   *              these elements are used.
   *   - Svelte: no extra typings required for runtime usage.
   */

  // ── Shared types ──────────────────────────────────────────────────────────────

  /** Visual variant of the consent dialog. */
  type ConsentDialogVariant = 'standard' | 'modern' | 'modest' | 'panel';

  /** Token preset theme of the consent dialog. */
  type ConsentDialogTheme = 'standard' | 'dark' | 'muted' | 'earth' | 'frost' | 'light' | 'vibrant' | 'accessible';

  /** Locale supported by PrivacyKit. Falls back to 'en'. */
  type ConsentDialogLocale = 'da' | 'de' | 'en' | 'es' | 'fi' | 'fr' | 'it' | 'nl' | 'no' | 'pl' | 'sv';

  /**
   * Payload dispatched on `window` as the `privacykit:consent-changed` event.
   *
   * @example
   * window.addEventListener('privacykit:consent-changed', (e) => {
   *   const { consent, mode } = (e as CustomEvent<PrivacyKitConsentChangedDetail>).detail;
   * });
   */
  interface PrivacyKitConsentChangedDetail {
    consent: {
      analytics: boolean;
      marketing: boolean;
      preferences: boolean;
    };
    mode: 'accept-all' | 'accept-selected' | 'reject-all';
    timestamp: string;
  }

  interface PrivacyKitConsentState {
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  }

  interface PrivacyKitSubscriptionStatus {
    status: string | null;
    billingInterval: string | null;
    subscriptionEnd: string | null;
    trailingEnd: string | null;
  }

  interface PrivacyKitGlobalApi {
    readConsent(): PrivacyKitConsentState | null;
    hasConsent(expression?: string): boolean;
    onConsentChanged(callback: (consent: PrivacyKitConsentState | null) => void): () => void;
    openConsentDialog(): void;
    openPrivacyPolicyDialog(): void;
    onConsentDialogClosed(callback: () => void): () => void;
    getSubscriptionStatus(): PrivacyKitSubscriptionStatus | null;
    /**
     * Subscribes to the privacykit:ready event. Callback is called when PrivacyKit is ready.
     * Replay-safe: if PrivacyKit is already ready when you subscribe, the callback still runs once.
     * Returns an unsubscribe function.
     */
    onReady(callback: () => void): () => void;
    subscriptionStatus?: PrivacyKitSubscriptionStatus | null;
  }

  // ── DOM element interfaces ────────────────────────────────────────────────────

  /**
   * `<consent-dialog>` — the public entry component.
   *
   * Manages open/close state, locale resolution, and variant routing.
   * All visual rendering is delegated to the active design variant.
   *
   * Named slots for content overrides:
   *   - `dialog-logo`         Optional logo content shown next to the title
   *   - `dialog-title`        Override the dialog heading
   *   - `dialog-summary-part-1` Override the first summary paragraph
   *   - `dialog-summary-part-2` Override the second summary paragraph
   *   - `necessary-content`   Override "Functional cookies" body text
   *   - `preferences-content` Override "Preferences" body text
   *   - `analytics-content`   Override "Analytics" body text
   *   - `marketing-content`   Override "Marketing" body text
   *   - `read-more-title`     Override the "Read more" label
   *   - `read-more-content`   Override the read-more body text
   *   - `privacy-policy-content` Override the privacy policy content
   *
   * CSS custom properties:
   *   --pk-bg-color        Dialog background color
   *   --pk-text-color      Dialog text color
   *   --pk-primary-color   Accent / primary color
   *   --pk-border-width    Border width
   *   --pk-radius          Border radius
   *   --pk-font-family     Font family
   *   --pk-spacing-unit    Base spacing unit (rem)
   */
  interface HTMLConsentDialogElement extends HTMLElement {
    /** Visual variant for consent UI. @default 'standard' */
    variant: ConsentDialogVariant;
    /** Token preset theme for dialog design tokens. @default 'standard' */
    theme: ConsentDialogTheme;
    /** Cookie TTL in days. @default 180 */
    expiresDays: number;
    /** Schema version string; triggers re-consent when changed. @default 0 */
    version: number;
    /** Explicit locale override. Auto-detected from browser when omitted. */
    locale: string | undefined;
    /** Hide the "Strictly necessary" section from the dialog. */
    hideNecessary: boolean | undefined;
    /** Hide the "Preferences" section from the dialog. */
    hidePreferences: boolean | undefined;
    /** Hide the "Analytics" section from the dialog. */
    hideAnalytics: boolean | undefined;
    /** Hide the "Marketing" section from the dialog. */
    hideMarketing: boolean | undefined;
    /** Hide the expandable "Read more" section from the dialog. */
    hideReadmore: boolean | undefined;
    /** Hide the default Privacy Policy link in the footer. */
    hidePrivacyPolicyLink: boolean | undefined;
    /** Demo mode: disables auto-open and mocks subscription status. */
    demo: boolean | undefined;
    /** Whether the dialog is currently open. @default false */
    open: boolean;

    /** Programmatically open the dialog. */
    openDialog(): Promise<void>;
    /** Programmatically close the dialog. */
    closeDialog(): Promise<void>;
    /** Re-fetch the subscription status from the API. */
    checkSubscriptionStatus(): Promise<void>;
  }

  /**
   * `<consent-guard>` — renders slot content only when the required consent is granted.
   *
   * Activates `<script type="text/plain">` children by cloning them as live scripts.
   * Listens to the `privacykit:consent-changed` window event for reactive updates.
   *
   * @example Single category
   * <consent-guard consent="analytics">...</consent-guard>
   *
   * @example AND — require all listed (space-separated with `+`)
   * <consent-guard consent="analytics+marketing">...</consent-guard>
   *
   * @example OR — require any one (pipe-separated)
   * <consent-guard consent="analytics|marketing">...</consent-guard>
   *
   * @example Default — omit `consent` to require ALL categories
   * <consent-guard>...</consent-guard>
   */
  interface HTMLConsentGuardElement extends HTMLElement {
    /**
     * Consent expression to evaluate. Omit to require ALL categories.
     *
     * Single:    `"analytics"` | `"marketing"` | `"preferences"`
     * AND (all): `"analytics+marketing"` | `"analytics+marketing+preferences"`
     * OR  (any): `"analytics|marketing"` | `"analytics|preferences"`
     */
    consent: string | undefined;
  }

  /**
   * `<consent-missing>` — shows fallback content when a paired `<consent-guard>` is blocked.
   *
   * Observes attribute changes on the target guard element and displays its
   * slot content whenever `data-pk-blocked` is present on the guard.
   *
   * @example
   * <consent-guard consent="analytics" id="analytics-guard">...</consent-guard>
   * <consent-missing for="analytics-guard">Please accept analytics to continue.</consent-missing>
   */
  interface HTMLConsentMissingElement extends HTMLElement {
    /** The `id` of the paired `<consent-guard>` element. */
    for: string;
  }

  interface Window {
    PrivacyKit?: PrivacyKitGlobalApi;
  }

  interface HTMLElementTagNameMap {
    'consent-dialog': HTMLConsentDialogElement;
    'consent-guard': HTMLConsentGuardElement;
    'consent-missing': HTMLConsentMissingElement;
  }

  interface WindowEventMap {
    'privacykit:consent-changed': CustomEvent<PrivacyKitConsentChangedDetail>;
  }
}

// ── React JSX augmentation ────────────────────────────────────────────────────
//
// React passes custom element props as DOM attributes. Boolean Stencil props
// (e.g. `noNecessary`) map to their kebab-case HTML attribute names (e.g.
// `no-necessary`). Presence without a value or `={true}` both set the attribute.
//
// Ref: React 19 (used by Next.js 15+) has full custom-element support — props
// that are not event handlers are passed as attributes automatically.

type CKRef<T> = { current: T | null } | ((instance: T | null) => void) | null;

interface ConsentDialogJSXProps {
  /** Visual variant. @default 'standard' */
  'variant'?: ConsentDialogVariant;
  /** Token preset theme. @default 'standard' */
  'theme'?: ConsentDialogTheme;
  /** Cookie TTL in days. @default 180 */
  'expires-days'?: number;
  /** Policy version; bump to force re-consent. @default 0 */
  'version'?: number;
  /** Locale override. Defaults to browser locale. */
  'locale'?: string;
  /** Hide the "Strictly necessary" section. */
  'hide-necessary'?: boolean | '';
  /** Hide the "Preferences" section. */
  'hide-preferences'?: boolean | '';
  /** Hide the "Analytics" section. */
  'hide-analytics'?: boolean | '';
  /** Hide the "Marketing" section. */
  'hide-marketing'?: boolean | '';
  /** Enable demo mode. */
  'demo'?: boolean | '';
  /** Open/close state. */
  'open'?: boolean | '';
  'ref'?: CKRef<HTMLConsentDialogElement>;
  'children'?: unknown;
  /** Inline styles — pass CSS custom properties like `--pk-primary-color` here. */
  'style'?: Record<string, string | number>;
  'class'?: string;
  'className'?: string;
  'id'?: string;
}

interface ConsentGuardJSXProps {
  /**
   * Consent expression. Omit to require ALL categories.
   *
   * Single:    `"analytics"` | `"marketing"` | `"preferences"`
   * AND (all): `"analytics+marketing"` | `"analytics+marketing+preferences"`
   * OR  (any): `"analytics|marketing"` | `"analytics|preferences"`
   */
  consent?: string;
  ref?: CKRef<HTMLConsentGuardElement>;
  children?: unknown;
  style?: Record<string, string | number>;
  class?: string;
  className?: string;
  id?: string;
}

interface ConsentMissingJSXProps {
  /** ID of the paired `<consent-guard>` element. */
  for: string;
  ref?: CKRef<HTMLConsentMissingElement>;
  children?: unknown;
  style?: Record<string, string | number>;
  class?: string;
  className?: string;
  id?: string;
}

// React 18 global JSX namespace (also consumed by older Next.js setups)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace JSX {
  interface IntrinsicElements {
    'consent-dialog': ConsentDialogJSXProps;
    'consent-guard': ConsentGuardJSXProps;
    'consent-missing': ConsentMissingJSXProps;
  }
}

// React 18+ scoped JSX namespace (preferred in modern Next.js / React setups)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'consent-dialog': ConsentDialogJSXProps;
      'consent-guard': ConsentGuardJSXProps;
      'consent-missing': ConsentMissingJSXProps;
    }
  }
}
