require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');

const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

// auth
require('./auth/passport')(passport);
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 900000 },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// parse POST body from json and form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static('public'));
var hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: require('./public/js/helpers.js').helpers,
  partialsDir: [path.join(__dirname, 'views/partials')],
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('index.hbs');
});

const patient = require('./routes/patient');
const clinician = require('./routes/clinician');
const about = require('./routes/about');
app.use('/patient', patient);
app.use('/clinician', clinician);
app.use('/about', about);

require('./models/db').initDb();
const port = process.env.PORT || 8666;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
