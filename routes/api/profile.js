const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

//Load validation
const validationProfileInput = require('../../validation/profile');
//Load profile model
const Profile = require('../../models/Profile');
//Load user profile
const User = require('../../models/User');

//@route Get api/profile/test
//#desc Test profile route
//@access Public
router.get('/test', (req, res) => res.json({ msg: 'profile works' }));

//@route Get api/profile
//#desc Get current users profile
//@access Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const error = {};
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
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

//@route Post api/profile
//#desc Create or edit users profile
//@access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, invalid } = validatorProfileInput(req.body);
    //check validation
    if (!isValid) {
      //Return any errors with 400 status
      return res.status(400).json(errors);
    }
    //get fields
    const profileFilelds = {};
    profileFilelds.user = req.user.id;
    if (req.body.handle) profileFilelds.handle = req.body.handle;
    if (req.body.company) profileFilelds.company = req.body.company;
    if (req.body.website) profileFilelds.website = req.body.website;
    if (req.body.location) profileFilelds.location = req.body.location;
    if (req.body.bio) profileFilelds.bio = req.body.bio;
    if (req.body.status) profileFilelds.status = req.body.status;
    if (req.body.githubusername)
      profileFilelds.githubusername = req.body.githubusername;
    //Skills - Split into array
    if (typeof req.body.skills !== 'undefined') {
      profileFilelds.skills = req.body.skills.split(',');
    }
    //Social
    profileFilelds.social = {};
    if (req.body.youtube) profileFilelds.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFilelds.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFilelds.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFilelds.social.linkedin = req.body.linkedin;
    if (req.body.instagram)
      profileFilelds.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFilelds },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({ handle: profileFilelds.handle }).then(profile => {
          if (profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }
          //Save profile
          new Profile(profileFilelds).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
