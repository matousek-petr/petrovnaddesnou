const https = require('https');

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
  // Escape content for safe embedding in JS string
  const escaped = content.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>CMS přihlášení</title></head>
<body>
<p id="msg">Přihlašování...</p>
<script>
(function () {
  var msg = 'authorization:github:${message}:${escaped}';
  function send(origin) {
    window.opener.postMessage(msg, origin);
  }
  if (window.opener) {
    var received = false;
    window.addEventListener('message', function handler(e) {
      if (received) return;
      received = true;
      window.removeEventListener('message', handler);
      send(e.origin);
      setTimeout(function() { window.close(); }, 500);
    });
    // Initiate handshake
    window.opener.postMessage('authorizing:github', '*');
    // Fallback: if no response after 2s, send anyway and close
    setTimeout(function() {
      if (!received) {
        received = true;
        send('*');
        setTimeout(function() { window.close(); }, 500);
      }
    }, 2000);
  } else {
    document.getElementById('msg').textContent = 'Chyba: okno nemá opener. Zavři toto okno a zkus znovu.';
  }
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
