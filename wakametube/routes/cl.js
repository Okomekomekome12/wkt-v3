const router = require("express").Router();

router.get('/:route', (req, res) => {
    const file = req.params.route;
    res.render(`tube/cl/${file}.ejs`);
});

module.exports = router;