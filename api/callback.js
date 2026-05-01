const https = require('https');
const { SITE_URL } = require('./_cms-oauth');

function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    });
    const req = https.request(
      {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON from GitHub: ' + data));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function html(message, content) {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>CMS přihlášení</title></head>
<body>
<script>
(function () {
  function receiveMessage(e) {
    if (e.origin !== ${JSON.stringify(SITE_URL)}) return;
    window.removeEventListener('message', receiveMessage, false);
    window.opener.postMessage(
      'authorization:github:${message}:${content}',
      e.origin
    );
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`;
}

module.exports = async (req, res) => {
  const { code, error } = req.query || {};

  if (error || !code) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(html('error', JSON.stringify(`GitHub OAuth chyba: ${error || 'chybí kód'}`)));
  }

  try {
    const data = await exchangeCode(code);
    if (data.error || !data.access_token) {
      throw new Error(data.error_description || data.error || 'Nepodařilo se získat token');
    }
    const content = JSON.stringify({ token: data.access_token, provider: 'github' });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html('success', content));
  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html('error', JSON.stringify(`Chyba: ${err.message}`)));
  }
};
