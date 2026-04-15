const yt = require('../../services/youtube');

module.exports = async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'チャンネルIDが必要です。' });
  }

  try {
    const channelData = await yt.getChannel(id);
    if (!channelData) return res.status(404).json({ error: 'チャンネルが見つかりませんでした。' });

    res.status(200).json({
      status: 'success',
      data: channelData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};