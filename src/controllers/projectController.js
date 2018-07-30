const express = require('express');
const authMiddleware = require('../middlewares/auth')

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
 console.log(req.decoded);   
    res.send({ ok: req.id });
});

module.exports = app => app.use('/projects', router);