'use strict';
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const socket = require('socket.io');
const Main = require('./configureSocketIO');  

const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
// const { dbConnect } = require('./db-mongoose');

// const localStrategy = require('./passport/localStrategy');
// const jwtStrategy = require('./passport/jwtStrategy');


var indexRouter = require('./routes/index');

const app = express();
// const jwtAuth = passport.authenticate('jwt', { session: false });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// passport.use(localStrategy);
// passport.use(jwtStrategy);


app.use('/', indexRouter);

// Custom 404 Not Found Error Handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: `Server Error: ${err}` });
  }
});


// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;
function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, { useNewUrlParser: true}, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          let io = socket(server, {forceNew: true});
          new Main(io)
          // app.set('socketio', io);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));

}

module.exports = app;