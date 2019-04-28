const express = require('express');
//@route Get api/profile/test
//#desc Test profile route
//@access Public
const router = express.Router();

router.get('/test', (req, res) => res.json({ msg: 'profile works' }));
module.exports = router;
