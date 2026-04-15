"use strict";
const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const YouTubeJS = require("youtubei.js");
const serverYt = require("./services/youtube.js");
const compression = require("compression");

let client;

app.use(compression());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use((req, res, next) => {
    const path = req.path;
    const cookies = req.cookies;
    if (path.includes('api') || path.includes('index')) {
        return next();
    }
    if (cookies.login !== 'ok') {
      const fullPath = req.originalUrl;
      return res.render('auth', { path: fullPath });
    }
    next();
});

app.get('/', (req, res) => {
  res.redirect(`/wkt`);
});

app.all('/api/*', async (req, res) => {
  try {
    const routePath = req.path.replace(/^\/api\//, '');
    const filePath = path.join(__dirname, 'api', routePath + '.js');
    const handler = require(filePath);
    if (typeof handler !== 'function') {
      return res.status(500).send('not function');
    }
    await handler(req, res);
  } catch (err) {
    res.status(404).send('Route not found');
  }
});


app.use("/wkt", require("./wakametube/main"));
app.use("/gm", require("./game/main"));

app.get('/r/*', async (req, res) => {
  try {
    const routePath = req.path.replace(/^\/r\//, '');
    const filePath = path.join(__dirname, 'routes', routePath + '.js');
    const handler = require(filePath);
    if (typeof handler !== 'function') {
      return res.status(500).send('not function');
    }
    await handler(req, res);
  } catch (err) {
    res.status(404).send('Route not found');
  }
});

app.get('/logout', (req, res) => {
  if (req.cookies.userlogin === 'ok') {
    res.cookie('userlogin', 'false', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });
  }
  res.redirect('/');
});

app.get("/tools/:id", (req, res) => {
  res.render(`tools/${req.params.id}`);
});

app.use((req, res) => {
  res.status(404).render("error.ejs", {
    title: "404 Not found",
    content: "そのページは存在しません。",
  });
});
app.on("error", console.error);
async function initInnerTube() {
  try {
    client = await YouTubeJS.Innertube.create({ lang: "ja", location: "JP"});
    serverYt.setClient(client);
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log(process.pid, "Ready.", listener.address().port);
    });
  } catch (e) {
    console.error(e);
    setTimeout(initInnerTube, 10000);
  };
};
process.on("unhandledRejection", console.error);
initInnerTube();