const express = require('express');
//@route Get api/posts/test
//#desc Test post route
//@access Public
const router = express.Router();

router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));
module.exports = router;
