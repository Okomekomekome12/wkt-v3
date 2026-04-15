const yt = require('../../services/youtube');

module.exports = async function handler(req, res) {
  const { q, limit } = req.query;

  if (!q) {
    return res.status(400).json({ error: '検索キーワード(q)が必要です。' });
  }

  try {
    const results = await yt.search(q, limit ? parseInt(limit) : 10);

    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};