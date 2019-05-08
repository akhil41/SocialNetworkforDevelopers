const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

//Load validation
const validationProfileInput = require('../../validation/profile');
const validationExperienceInput = require('../../validation/experience');
const validationEducationInput = require('../../validation/education');
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

//@route  Get api/profile/all
//#desc   Get all profiles
//@access Public
router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
    .populate('users', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofiles = 'There are no profiles';
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
});

//@route  Get api/profile/handle/:handle
//#desc   Get profile by handle
//@access Public

router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.pr.handle })
    .populate('users', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//@route  Get api/profile/user/:user_id
//#desc   Get profile by user ID
//@access Public

router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.pr.user_id })
    .populate('users', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: 'There is no profile for this user' })
    );
});

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

//@route  Post api/profile/experience
//#desc   Add experience to profile
//@access Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, invalid } = validatorExperienceInput(req.body);
    //check validation
    if (!isValid) {
      //Return any errors with 400 status
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user_id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.bosy.description
      };

      //Add to experience array
      profile.experience.unshift(newExp);
      profile.save.then(profile => res.json(profile));
    });
  }
);

//@route  Post api/profile/education
//#desc   Add education to profile
//@access Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, invalid } = validatorEducationInput(req.body);
    //check validation
    if (!isValid) {
      //Return any errors with 400 status
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user_id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.bosy.description
      };

      //Add to education array
      profile.education.unshift(newEdu);
      profile.save.then(profile => res.json(profile));
    });
  }
);

//@route  Delete api/profile/experience/:exp_id
//#desc   Delete experience from profile
//@access Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user_id })
      .then(profile => {
        //Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.param.exp_id);

        //Splice out of array
        profile.experience.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  Delete api/profile/education/:edu_id
//#desc   Delete education from profile
//@access Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user_id })
      .then(profile => {
        //Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.param.edu_id);

        //Splice out of array
        profile.education.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  Delete api/profile
//#desc   Delete user profile
//@access Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user_id }).then(() => {
      User.findOneAndRemove({ _id: req.user._id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
