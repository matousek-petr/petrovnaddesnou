const { createVercelHandlers } = require('netlify-cms-oauth-provider-node');

function resolveSiteUrl() {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:4321';
}

let cachedHandlers;

function getHandlers() {
  if (cachedHandlers) return cachedHandlers;

  const siteUrl = resolveSiteUrl();
  cachedHandlers = createVercelHandlers(
    {
      origin: process.env.CMS_OAUTH_ORIGIN || siteUrl,
      completeUrl: process.env.CMS_OAUTH_COMPLETE_URL || `${siteUrl}/api/callback`,
      oauthClientID: process.env.GITHUB_CLIENT_ID,
      oauthClientSecret: process.env.GITHUB_CLIENT_SECRET,
      oauthProvider: 'github',
      adminPanelUrl: `${siteUrl}/admin/`,
      dev: process.env.NODE_ENV !== 'production',
    },
    {
      useEnv: false,
    },
  );

  return cachedHandlers;
}

module.exports = { getHandlers };
