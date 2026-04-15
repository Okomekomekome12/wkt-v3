const axios = require('axios');
const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({ keepAlive: true, freeSocketTimeout: 30000 });
const httpsAgent = new https.Agent({ keepAlive: true, freeSocketTimeout: 30000 });

module.exports = async function image(req, res) {
  try {
    const path = req.query.path;
    const imageUrl = `https://gitlab.com/wakamehaze/rpg/-/raw/main/image/gm/${path}?ref_type=heads`

    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 30000,
      httpAgent,
      httpsAgent,
      headers: { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0' },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const headers = response.headers;
    const contentType = headers['content-type'];
    if (contentType) res.setHeader('Content-Type', contentType);

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (headers['etag']) res.setHeader('ETag', headers['etag']);
    if (headers['last-modified']) res.setHeader('Last-Modified', headers['last-modified']);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    response.data.pipe(res);

    response.data.on('error', (err) => {
      console.error('Stream Error:', err.message);
      if (!res.headersSent) res.status(502).end();
    });

  } catch (err) {
    console.error('Proxy Error:', err.message);
    if (!res.headersSent) {
      const status = err.response ? err.response.status : 500;
      res.status(status).send('Fetch Error');
    }
  }
};