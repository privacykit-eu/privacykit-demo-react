import { useEffect, useState } from 'react';
import { deleteCookies, gtmScriptString, preferencesScriptString, analyticsScriptString, marketingScriptString } from './utils';

function App() {
  const [consent, setConsent] = useState<PrivacyKitConsentState | null>();

  useEffect(() => {
    /**
     * Keep a local React snapshot of consent.
     *
     * Why two listeners?
     * - `onReady`: fires once when PrivacyKit has finished initializing, so this
     *   is the safest time to do the first `readConsent()` (initial hydration).
     * - `onConsentChanged`: fires whenever the user changes consent. We update
     *   state so React re-renders and any UI derived from consent stays current.
     */
    const unsubscribeReady = window.PrivacyKit?.onReady(() => setConsent(window.PrivacyKit?.readConsent()));
    const unsubscribeConsentChanged = window.PrivacyKit?.onConsentChanged(setConsent);
    return () => {
      unsubscribeReady?.();
      unsubscribeConsentChanged?.();
    };
  }, []);

  const openDialogBtnClick = () => {
    window.PrivacyKit?.openConsentDialog();
  };

  const openPrivacyPolicyDialogBtnClick = () => {
    window.PrivacyKit?.openPrivacyPolicyDialog();
  };

  const deleteCookiesBtnClick = () => {
    deleteCookies();
  };

  const showMessageFromScript = (message: string | undefined) => {
    alert(message);
  };

  const showMessageFromGtmScript = () => {
    const gtmLoaded = performance.getEntriesByType('resource').some(e => e.name.includes('googletagmanager.com/gtm.js'));
    const gtmMessage = gtmLoaded ? 'Google Tag Manager loaded.' : undefined;
    showMessageFromScript(gtmMessage);
  };

  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="hero__title">
            <h1>Beaver Creek Construction</h1>
            <p className="hero__subtitle">A GDPR-compliant company</p>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="section">
          <div className="section__header">
            <h2>PrivacyKit with React</h2>
            <a
              className="icon-btn"
              href="https://github.com/privacykit-eu/privacykit-demo-react"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View demo repository on GitHub"
              title="View on GitHub"
            >
              <span className="icon-btn__icon" aria-hidden="true"></span>
            </a>
          </div>

          <div className="card">
            <div className="card__content card__title">
              <h3>Test Panel</h3>
              <span>Use these controls to manually test consent behavior — open the dialog, view the privacy policy, or wipe all cookies to simulate a first-time visitor.</span>
            </div>
            <div className="card__content action-row">
              <div className="action-row__group">
                <button id="open-consent-dialog" className="btn btn--primary" type="button" onClick={openDialogBtnClick}>
                  Open Consent Dialog
                </button>
                <button id="open-privacy-policy" className="btn btn--primary" type="button" onClick={openPrivacyPolicyDialogBtnClick}>
                  Open Privacy Policy
                </button>
              </div>
              <div className="action-row__group">
                <button id="delete-cookies" className="btn btn--danger" type="button" onClick={deleteCookiesBtnClick}>
                  Delete Cookies
                </button>
              </div>
            </div>
          </div>

          <div className="card card__content" role="status" aria-live="polite">
            <code>window.PrivacyKit.readConsent(): PrivacyKitConsentState</code>
            <pre>{JSON.stringify(consent, null, 2)}</pre>
          </div>

          <div className={`card card--terminal${window.PrivacyKit?.hasConsent('analytics+marketing') ? ' card--consent-granted' : ''}`}>
            <div className="card__container card__content">
              <pre className="pre-terminal">{gtmScriptString}</pre>
              <button id="open-consent-dialog" className="btn btn--secondary" type="button" onClick={showMessageFromGtmScript}>
                Try It
              </button>
            </div>
          </div>

          <div className={`card card--terminal${window.PrivacyKit?.hasConsent('preferences') ? ' card--consent-granted' : ''}`}>
            <div className="card__container card__content">
              <pre className="pre-terminal">{preferencesScriptString}</pre>
              <button id="open-consent-dialog" className="btn btn--secondary" type="button" onClick={() => showMessageFromScript(window.preferencesScript?.message)}>
                Try It
              </button>
            </div>
          </div>

          <div className={`card card--terminal${window.PrivacyKit?.hasConsent('analytics') ? ' card--consent-granted' : ''}`}>
            <div className="card__container card__content">
              <pre className="pre-terminal">{analyticsScriptString}</pre>
              <button id="open-consent-dialog" className="btn btn--secondary" type="button" onClick={() => showMessageFromScript(window.analyticsScript?.message)}>
                Try It
              </button>
            </div>
          </div>

          <div className={`card card--terminal${window.PrivacyKit?.hasConsent('marketing') ? ' card--consent-granted' : ''}`}>
            <div className="card__container card__content">
              <pre className="pre-terminal">{marketingScriptString}</pre>
              <button id="open-consent-dialog" className="btn btn--secondary" type="button" onClick={() => showMessageFromScript(window.marketingScript?.message)}>
                Try It
              </button>
            </div>
          </div>

          <div className={`card ${window.PrivacyKit?.hasConsent('analytics+marketing') ? ' card--consent-granted' : ''}`}>
            <consent-guard consent="analytics+marketing" id="video-guard">
              <iframe
                className="video"
                data-src="https://www.youtube.com/embed/NxVd_cA8Ick"
                title="Bridgestone - Beaver-Super Bowl Commercial"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </consent-guard>
            <consent-missing for="video-guard">
              <div className="video--consent-missing">Please accept analytics cookies and marketing cookies to view this content.</div>
            </consent-missing>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer__text">
            This is a demonstration of PrivacyKit Consent Management. Return to the PrivacyKit website{' '}
            <a className="footer__link" href="https://www.privacykit.eu">
              here
            </a>
            .
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
