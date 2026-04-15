const express = require("express");
const router = express.Router();
const ytedu = require("../../services/ytedu.js");

router.get("/umekomi", async (req, res) => {
  const { id, type } = req.query;
  let src;
  if (type === "edu") {
    const params = await ytedu.get();
    src = `https://www.youtubeeducation.com/embed/${id}${params}`
  } else if (type === "nocookie") {
    src = `https://www.youtube-nocookie.com/embed/${id}`;
  }
  res.render('tube/opu/umekomi', { url: src });
});

module.exports = router;