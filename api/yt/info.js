const yt = require('../../services/youtube');

module.exports = async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: '動画IDが必要です。' });
  }

  try {
    const info = await yt.infoGet(id);
    if (!info) return res.status(404).json({ error: '動画が見つかりませんでした。' });

    res.status(200).json({
      status: 'success',
      data: info
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};