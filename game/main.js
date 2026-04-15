const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

router.use('/kankin', require('./routes/kankin'));
router.use('/aooni', require('./routes/aooni'));
router.use('/kinokonun', require('./routes/kinokonun'));
router.use('/stickman', require('./routes/stickman'));
router.use('/netabare', require('./routes/netabare'));
router.use('/kawaiihakowaseru', require('./routes/kawaiihakowaseru'));
router.use('/menhera', require('./routes/menhera'));
router.use('/shesee', require('./routes/shesee'));
router.use('/sentakusi', require('./routes/sentakusi'));

const GAMES_DIR = path.join(__dirname, '../public/games');

if (fsSync.existsSync(GAMES_DIR)) {
    const gameFolders = fsSync.readdirSync(GAMES_DIR);

    gameFolders.forEach(folder => {
        const fullPath = path.join(GAMES_DIR, folder);
        if (fsSync.statSync(fullPath).isDirectory()) {
            router.use(`/${folder}`, express.static(fullPath));
            console.log(`[Game Router] Mounted: /${folder}`);
        }
    });
}

router.get('/', async (req, res, next) => {
    try {
        if (!fsSync.existsSync(GAMES_DIR)) {
            return res.send('<h1>No games available</h1>');
        }

        const entries = await fs.readdir(GAMES_DIR, { withFileTypes: true });
        const folders = entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        const listItems = folders
            .map(f => `<li><a href="./${f}/">${f}</a></li>`)
            .join('');

        res.send(`<h1>Game List</h1><ul>${listItems}</ul>`);
    } catch (err) {
      next(err);
    }
});

module.exports = router;