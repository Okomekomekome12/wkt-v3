const express = require("express");
const router = express.Router();
const path = require("path");
const serverYt = require("../services/youtube");

router.use("/back", require("./api/back"));
router.use("/watch", require("./routes/watch"));
router.use("/c", require("./routes/channel"));

router.get("/s", async (req, res) => {
  let query = req.query.q;
  let page = Number(req.query.p || 1);
  try {
    if (page == 1) {
    res.render("tube/opu/search2.ejs", {
      res: await serverYt.search2(query, 2),
      query: query,
      page: 2
    });
    } else {
      res.render("tube/opu/search2.ejs", {
        res: await serverYt.search2(query, page),
        query: query,
        page
      });
    }
  } catch (error) {
    console.error(error);
    try {
      res.render("tube/search.ejs", {
        res: await serverYt.search(query, page),
        query: query
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", {
        title: "ytsr Error",
        content: error
      });
    }
  }
});

router.get('/', (req, res) => {
  res.render('tube/home');
});

router.get('/trend', (req, res) => {
  res.render('tube/trend');
});

router.use("/hashtag", require("./routes/hashtag"));
router.use("/cl", require("./routes/cl"));

// ゴミ箱
router.use("/redirect", require("./routes/redirect"));
router.use("/opu", require("./routes/opu"));

module.exports = router;