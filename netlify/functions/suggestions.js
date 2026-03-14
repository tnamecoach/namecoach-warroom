// Netlify serverless function: proxy for GitHub suggestions.json
// Keeps the GitHub token out of client-side code.
const REPO  = 'tnamecoach/namecoach-warroom';
const FILE  = 'suggestions.json';
const API   = `https://api.github.com/repos/${REPO}/contents/${FILE}`;

exports.handler = async (event) => {
  const token = process.env.GH_TOKEN;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'ncwarroom-netlify-fn'
  };

  // CORS headers so the browser can call this function
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Fetch current file from GitHub
      const res = await fetch(`${API}?t=${Date.now()}`, { headers });
      const data = await res.json();
      return {
        statusCode: res.status,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    if (event.httpMethod === 'PUT') {
      // Write updated file to GitHub
      const body = JSON.parse(event.body);
      const res = await fetch(API, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return {
        statusCode: res.status,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    return { statusCode: 405, headers: cors, body: 'Method not allowed' };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: err.message })
    };
  }
};
