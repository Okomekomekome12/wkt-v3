const express = require('express');
const router = express.Router();
const { stream } = require('undici');

router.get('/:file(*)?', async (req, res) => {
    const fileName = req.params.file || 'index.html';
    const targetUrl = `https://cdn.jsdelivr.net/gh/renrender0209/kawaiihakowaseru@master/www/${fileName}`;

    try {
        await stream(targetUrl, {
            method: 'GET',
            maxRedirections: 3,
        }, ({ statusCode, headers }) => {
            if (statusCode !== 200) {
                res.status(statusCode).send('Resource not found');
                return;
            }
            const contentType = fileName === 'index.html' 
                ? 'text/html' 
                : headers['content-type'];

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', `public, max-age=31536000, immutable`);
            return res;
        });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

module.exports = router;