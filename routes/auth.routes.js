const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt')
const passport = require('passport')

const User = require('../models/User.model')

/* GET signup page */
router.get('/signup', (req, res) => {
  res.render('signup');
});

/* POST signup */
router.post('/signup', (req, res)=>{
  const {username, password} = req.body

  //Que el usuario y contraseña no estén vacíos
  if(username === '' || password === ''){
    res.render('signup', {errorMessage: 'Tienes que rellenar todos los campos'})
  }
  //Que el usuario que intentas crear no exista ya
  User.findOne({username})
  .then((user)=>{
    if(user){ //El usuario ya existe
      res.render('signup', {errorMessage: 'Este usuario ya existe'})
    } else { //El usuario no existe, por lo tanto puedo crearlo
      const hashedPassword = bcrypt.hashSync(password, 10)
      User.create({username, password: hashedPassword})
      .then(()=>{
        res.redirect('/login')
      })
    }
  })
  .catch((err)=>{
    res.send(err)
  })

})

/* GET login page */
router.get('/login', (req, res)=>{
  res.render('login', {errorMessage: req.flash('error')})
})

/* POST login page */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

/* GET logout page */
router.get('/logout', (req, res)=>{
  req.logout()
  res.redirect('/')
})

module.exports = router;
