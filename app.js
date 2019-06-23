/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const userAdminController = require('./controllers/userAdmin');

const apiController = require('./controllers/api');
const aboutController = require('./controllers/about');
const menuController = require('./controllers/menu');
const chefController = require('./controllers/chef');


const contactController = require('./controllers/contact');
const contactDatabaseController = require('./controllers/contactDatabase');


const eventController = require('./controllers/event');
const elementsController = require('./controllers/elements');
const blogController = require('./controllers/blog-home');
const blogSingleController = require('./controllers/blog-single');
const galleryController = require('./controllers/gallery');
const eventDatabaseController = require('./controllers/eventDatabase');
const userDatabaseController = require('./controllers/userDatabase');


/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.',
    chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload' || req.path === '/contact' || req.path === '/event' || req.path.includes('/event/delete/') || req.path.includes('/event/edit/') || req.path.includes('/event/update/')) {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
// app.use(lusca.xframe("SAMEORIGIN"));
// app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)
  ) {
    req.session.returnTo = req.originalUrl;
  } else if (
    req.user
    && (req.path === '/account' || req.path.match(/^\/api/))
  ) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/',
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/chart.js/dist'), {
    maxAge: 31557600000
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), {
    maxAge: 31557600000
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
    maxAge: 31557600000
  }));
app.use('/js/lib',
  express.static(path.join(__dirname, 'node_modules/jquery/dist'), {
    maxAge: 31557600000
  }));
app.use('/webfonts',
  express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'),
    { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);


app.get('/contactDatabase', contactDatabaseController.getContactDatabase);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.post('/contact/delete/:id', contactController.postDeleteContact);
app.post('/contact/edit/:id', contactController.postEditContact);
app.post('/contact/update/:id', contactController.postUpdateContact);
app.post('/contact/get-report/:id', contactController.postGetReportContact);
app.post('/contact/delete-page/:page', contactController.postDeletePageContact);
app.post('/contact/save-page/:page', contactController.postSavePageContact);


app.post('/contact/send-email-page/:page', contactController.postSendEmailPageContact);
app.post('/contact/email-page/:page', contactController.postEmailPageContact);
app.post('/contact/send-email/:id', contactController.postSendEmailContact);
app.post('/contact/email/:id', contactController.postEmailContact);


app.get('/eventDatabase', eventDatabaseController.getEventDatabase);
app.get('/userDatabase', userDatabaseController.getUserDatabase);
app.post('/event', eventController.postEvent);
app.post('/event/delete/:id', eventController.postDeleteEvent);
app.post('/event/get-report/:id', eventController.postGetReportEvent);
app.post('/event/delete-page/:page', eventController.postDeletePageEvent);
app.post('/event/save-page/:page', eventController.postSavePageEvent);

app.post('/event/send-email-page/:page', eventController.postSendEmailPageContact);
app.post('/event/email-page/:page', eventController.postEmailPageEvent);
app.post('/event/send-email/:id', eventController.postSendEmailEvent);
app.post('/event/email/:id', eventController.postEmailEvent);

app.get('/eventDatabase', eventDatabaseController.getEventDatabase);
app.post('/event/edit/:id', eventController.postEditEvent);
app.post('/event/update/:id', eventController.postUpdateEvent);

app.get('/elements', elementsController.getElements);
app.get('/blog-home', blogController.getBlogHome);
app.get('/blog-single', blogSingleController.getBlogSingle);
app.get('/gallery', galleryController.getGallery);
app.get('/about', aboutController.getAbout);
app.get('/menu', menuController.getMenu);
app.get('/userAdmin', userAdminController.getUserAdmin);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);


app.post('/account/profile',
  passportConfig.isAuthenticated,
  userController.postUpdateProfile);
app.post('/account/password',
  passportConfig.isAuthenticated,
  userController.postUpdatePassword);
app.post('/account/delete',
  passportConfig.isAuthenticated,
  userController.postDeleteAccount);
app.get('/account/unlink/:provider',
  passportConfig.isAuthenticated,
  userController.getOauthUnlink);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode',
    chalk.green('✓'),
    app.get('port'),
    app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
