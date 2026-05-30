export {};

declare global {
  interface Window {
    /**
     * Demo-only global set by the guarded preferences, analytics and marketing scripts in `index.html`.
     * Present only after consent is granted and the script executes.
     */
    preferencesScript?: { message: string };
    analyticsScript?: { message: string };
    marketingScript?: { message: string };
  }
}
