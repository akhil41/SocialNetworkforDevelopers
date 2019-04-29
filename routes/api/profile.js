const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

//Load profile model
const Profile = require('../../models/Profile');
//Load user profile
const User = require('../../models/User');

//@route Get api/profile/test
//#desc Test profile route
//@access Public
router.get('/test', (req, res) => res.json({ msg: 'profile works' }));
module.exports = router;

//@route Get api/profile
//#desc Get current users profile
//@access Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const error = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          error.noprofile = 'There is no profile for this user';
          return res.status(404).json(error);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(error));
  }
);
