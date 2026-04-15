const yt = require('../../services/youtube');

module.exports = async function handler(req, res) {
  try {
    const { q } = req.query;
    let info = await yt.searchjson(q);
    res.status(200).json({
      status: 'success',
      data: info
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};