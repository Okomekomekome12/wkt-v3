const express = require("express");
const router = express.Router();
const serverYt = require("../../services/youtube.js");

router.get("/:id", async (req, res) => {
  try {
    const channel = await serverYt.getChannel(req.params.id);

    res.render("tube/channel.ejs", channel);
  } catch (err) {
    console.error("Failed to fetch channel", req.params.id, err);
    res.status(500).render("error.ejs", {
      title: "Sorry. Something went wrong",
      content: "Failed to fetch channel information:\n" + err.toString()
    });
  }
});

module.exports = router;