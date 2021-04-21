const express = require('express');
const router  = express.Router();

const Sport = require('../models/Sport.model')
const User = require('../models/User.model')


//Middleware de checkForAuth
//req.isAuthenticated() //IMPORTANTE: devuleve verdadero o flaso dependiendo de si el usuario está logueado o no
const checkForAuth = (req, res, next)=>{
  if(req.isAuthenticated()){
    return next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page */
router.get('/new', checkForAuth, (req, res) => {
  res.render('sports/newSport');
});

router.post('/new', (req, res)=>{
  // req.user  // IMPORTANT!! req.user te da acceso al usuario que tiene la sesión iniciada
  console.log(req.user)

  Sport.create(req.body)
  .then((result) => {
    User.findByIdAndUpdate(req.user._id, {$push: {sports: result._id}})
    .then(()=>{
      res.redirect('/profile')
    })
  })
  .catch((err) => {
    res.render('error')
  });
})

module.exports = router;
