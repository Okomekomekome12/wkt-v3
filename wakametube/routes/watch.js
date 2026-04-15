const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const http = require('http');
const serverYt = require("../../services/youtube.js");
const wakamess = require("../../services/wakame.js");
const ytedu = require("../../services/ytedu.js");

const user_agent = process.env.USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36";

router.get('/:id', async (req, res) => {
    const videoId = req.params.id;
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return res.status(400).send('videoIDが正しくありません');
    }
    const wakames = req.cookies.playbackMode;
    try {
        const videoInfo = await serverYt.infoGet(videoId);
        let src;
        let type;
        
        if (wakames == "edu") {
            const params = await ytedu.get();
            src = `https://www.youtubeeducation.com/embed/${videoId}${params}`
            type = "iframe";
        } else if (wakames == "nocookie") {
            src = `https://www.youtube-nocookie.com/embed/${videoId}`;
            type = "iframe";
        } else{
            src = await wakamess.getKatuoTube(videoId);
            type = "video";
        }
        
          res.render('tube/watch', { videotype: type, src, videoInfo, videoId });
  } catch (error) {
      res.status(500).render('tube/mattev.ejs', { 
      videoId,
      error: '動画を取得できません', 
      details: error.message 
    });
  }
});

module.exports = router;