const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectRedis = require('connect-redis');

const redis = require('./redis');
const routes = require('./routes');

const corsOptions = {
  origin(origin, cb) {
    const whitelist = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [];
    if (process.env.NODE_ENV === 'development') {
      whitelist.push('http://localhost:8081');
    }
    cb(null, whitelist.includes(origin));
  },
  credentials: true
};

const app = express();

app.set('trust proxy', 'loopback');

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(
  session({
    store: new (connectRedis(session))({client: redis.client}),
    name: 'sid',
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
  })
);
app.use(cors(corsOptions));

// app.options('*', cors());
app.use('/api', routes);

module.exports = app;
