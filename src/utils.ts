export const gtmScriptString = `<consent-guard consent="analytics+marketing">
  <script type="text/plain" data-src="https://www.googletagmanager.com/gtm.js?id=G-XZ20MQ3ZHE"></script>
</consent-guard>`;

export const preferencesScriptString = `<consent-guard consent="preferences">
  <script type="text/plain">
      window.preferencesScript = {
        message: 'Preferences script loaded.',
      };
    </script>
</consent-guard>`;

export const analyticsScriptString = `<consent-guard consent="analytics">
  <script type="text/plain">
      window.analyticsScript = {
        message: 'Analytics script loaded.',
      };
    </script>
</consent-guard>`;

export const marketingScriptString = `<consent-guard consent="marketing">
  <script type="text/plain">
      window.marketingScript = {
        message: 'Marketing script loaded.',
      };
    </script>
</consent-guard>`;

export const deleteCookies = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const cookies = document.cookie ? document.cookie.split(';') : [];
  const hostname = window.location.hostname;

  const domainVariants = new Set(['', hostname, `.${hostname}`]);
  const hostnameParts = hostname.split('.').filter(Boolean);
  for (let i = 0; i < hostnameParts.length - 1; i += 1) {
    const parentDomain = hostnameParts.slice(i).join('.');
    domainVariants.add(parentDomain);
    domainVariants.add(`.${parentDomain}`);
  }

  const pathVariants = new Set(['/']);
  const pathname = window.location.pathname || '/';
  const segments = pathname.split('/').filter(Boolean);
  let cumulativePath = '';
  for (const segment of segments) {
    cumulativePath += `/${segment}`;
    pathVariants.add(cumulativePath);
    pathVariants.add(`${cumulativePath}/`);
  }

  const expirationAttributes = ['expires=Thu, 01 Jan 1970 00:00:00 GMT', 'max-age=0'];
  const attributeVariants = [
    `${expirationAttributes.join('; ')}; path=/`,
    `${expirationAttributes.join('; ')}; path=/; Secure`,
    `${expirationAttributes.join('; ')}; path=/; SameSite=Lax`,
    `${expirationAttributes.join('; ')}; path=/; SameSite=None; Secure`,
  ];

  const deleteCookieEverywhere = (name: string) => {
    for (const path of pathVariants) {
      for (const domain of domainVariants) {
        const domainAttr = domain ? `; domain=${domain}` : '';
        document.cookie = `${name}=; ${expirationAttributes.join('; ')}; path=${path}${domainAttr};`;

        for (const attrs of attributeVariants) {
          const pathAttr = `; path=${path}`;
          const attrsWithPath = attrs.replace(/; path=\/($|;)/, `${pathAttr}$1`);
          document.cookie = `${name}=; ${attrsWithPath}${domainAttr};`;
        }
      }
    }
  };

  for (const cookie of cookies) {
    const name = cookie.split('=')[0]?.trim();
    if (!name) continue;
    deleteCookieEverywhere(name);
  }

  window.location.reload();
};
