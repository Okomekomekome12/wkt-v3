const ytedu = require("../../services/ytedu.js");

module.exports = async function handler(req, res) {
  const params = await ytedu.get();

  res.status(200).json({
    status: 'success',
    params
  });
};