const SITE_URL =
  process.env.PUBLIC_SITE_URL ||
  (process.env.VERCEL_ENV === 'production'
    ? 'https://petrovnaddesnou.vercel.app'
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:4321');

const CALLBACK_URL = `${SITE_URL}/api/callback`;

module.exports = { SITE_URL, CALLBACK_URL };
