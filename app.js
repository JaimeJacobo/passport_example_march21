require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

//PASO 2: Importar los paquetes que hemos instalado
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

//PASO 9: Importar modelo User.model
const User = require('./models/User.model')


// ---------DB CONFIG----------
mongoose
  .connect('mongodb://localhost/passport-example', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

// ---------EXPRESS----------
const app = express();


// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//PASO 3: Configurar el middleware de Session
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))

//PASO 4: Configurar la serialización del usuario
passport.serializeUser((user, callback)=>{
  callback(null, user._id)
})

//PASO 5: Configuar la deserialización del usuario
passport.deserializeUser((id, callback)=>{
  User.findById(id)
  .then((result)=>{
    callback(null, result)
  })
  .catch((err)=>{
    callback(err)
  })
})

//PASO 6: Configurar el middleware de flash
app.use(flash())


//PASO 7: Configurar el middleware del Strategy
passport.use(new LocalStrategy({
  usernameField: 'username', 
  passwordField: 'password', 
  passReqToCallback: true
}, (req, username, password, next)=>{
  User.findOne({username})
  .then((user)=>{
    if(!user){ //Si el usuario no existe
      return next(null, false, {message: 'Incorrect username'})
    }

    if(!bcrypt.compareSync(password, user.password)){  //Si la contraseña no coincide
      return next(null, false, {message: 'Incorrect password'})
    }

    return next(null, user)
  })
  .catch((err)=>{
    next(err)
  })
}))

//PASO 10: Configuar middleware de passport
app.use(passport.initialize())
app.use(passport.session())


// Express View engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


// ---------ROUTES----------
app.use('/', require('./routes/index.routes'));
app.use('/', require('./routes/auth.routes'));
app.use('/sports', require('./routes/sports.routes'));


// ---------APP LISTENER----------
//PASO 0.1
app.listen(process.env.PORT, ()=>{
  console.log(`Conectado en puerto ${process.env.PORT}`)
})
