const express = require('express');
const exphbs = require('express-handlebars');
const hbs_sections = require('express-handlebars-sections');
const morgan = require('morgan');
const numeral = require('numeral');
const Handlebars = require('handlebars');
const momment = require('moment');

const session=require("express-session");
const H = require('just-handlebars-helpers');
require('express-async-errors');
const app = express();
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
}))
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));


app.engine('hbs', exphbs({
  defaultLayout: 'main.hbs',
  layoutsDir: 'views/_layouts',
  helpers: {
    section: hbs_sections(),
    format: val => numeral(val).format('0,0'),
  }
}));
app.set('view engine', 'hbs');

// Register just-handlebars-helpers with handlebars
H.registerHelpers(Handlebars);
require('./middlewares/locals.mdw')(app);
require('./middlewares/routes.mdw')(app);

// app.get('/', (req, res) => {
//   // res.end('hello from expressjs');
//   res.render('home');
// })

app.get('/faq', (req, res) => {
  res.render('faq');
})

app.get('/about', (req, res) => {
  res.render('about');
})

app.get('/terms_conditions', (req, res) => {
  res.render('terms_conditions');
})

app.use((req, res, next) => {
  res.render('vwError/404');
  //res.send('You\'re lost');
})

//
// default error handler

app.use((err, req, res, next) => {
  // res.render('vwError/index');
  console.error(err.stack);
  res.status(500).render('vwError/error');
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})