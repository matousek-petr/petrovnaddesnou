const { CALLBACK_URL } = require('./_cms-oauth');

module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: CALLBACK_URL,
    scope: 'repo,user',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};
