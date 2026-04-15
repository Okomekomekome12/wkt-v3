const express = require("express");
const router = express.Router();
const path = require("path");
const serverYt = require("../../services/youtube.js");

router.get("/", async (req, res) => {
  let query = req.query.q;
  try {
    const results = await serverYt.hashtag(query);
    if (!results) {
      res.redirect(`/wkt/s?q=%23${query}`);
    }
    res.render("tube/hashtag.ejs", {
      res: results,
      query: `#${query}`
    });
  } catch (error) {
    res.redirect(`/wkt/s?q=%23${query}`);
  }
});

module.exports = router;