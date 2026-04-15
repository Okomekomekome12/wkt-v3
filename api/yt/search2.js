const yt = require('../../services/youtube');

module.exports = async function handler(req, res) {
  let { q, page } = req.query;

  if (!q) {
    return res.status(400).json({ error: '検索キーワード(q)が必要です。' });
  }

  if (!page) {
    page = 3;
  }

  try {
    const results = await yt.search2(q, page);

    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};