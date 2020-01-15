'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const socket = require('socket.io');
let socketSingleton = require('./configureSocketIO');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

// const localStrategy = require('./passport/localStrategy');
// const jwtStrategy = require('./passport/jwtStrategy');

let users = {}
let rooms = {}
// default namespace is /
class Main {
  //dont know if need to pass in socket server object
  constructor(io) {
    // this.host = 'host';
    this.name = 'main';
    this.users = {};
    this.rooms = []
    this.timer = 20;
    this.io = io;
    this.initiateIO();
  }
  initiateIO() {
    this.io.on('connection', (socket) => {
      console.log('user connected', socket.id)
      this.users[socket.id] = ''
      console.log(this.users)
      // socket.emit('join-main', 'Hello, there are' + this.users.length + 'users and '+ this.rooms.length + 'rooms in the session.')
      socket.on('createRoom', (roomName, host) => {
       this.createRoom(roomName, host)
       io.emit('A new game was created: ', roomName)
       this.rooms.push(newRoom)
      })
      socket.on('registerUsername', (name)=> {
        if(this.users[socket.id] === name){
          socket.emit('err', 'name already exists')
        }else{
          this.setUsername(socket.id, name)
        }
      })
      socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
        delete this.users[socket.id]
      })
    })
  }
  setUsername(id, name){
    this.users[id] = name
    console.log(this.users)
  }
  createRoom(roomName, host) {
    const newRoom = new Room(roomName, host, this.io);
    //where host creates a socket.io room with this.name
    //add host to object or something
    
  }
  joinRoom() {
    
  }
  startSession() {
    //once all users are present. Initiate game
    // by having the host click start
  }
  initiateTimer() {
    // once user starts typing, setInterval timer 
    //broadcast to every client in room using io.sockets.in('room').emit
    //if timer expires while still typing and user hasn't submitted
    //autoSubmit by calling onSubmit, then clear interval
  }
  userTyping(){
    //when user starts typing, 
  }
  onSubmit() {
    // when a user submits their sentence, cycle to the next user for their turn
    // and clear/ reset the timer until they start typing
  }
  endRoom() {
    //do end room stuff
  }
}


class Room {
  constructor(name, host, io) {
    this.host = host;
    this.name = name;
    this.io = io
    this.timer = 20;
  }

}
const app = express();
// const jwtAuth = passport.authenticate('jwt', { session: false });
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

// passport.use(localStrategy);
// passport.use(jwtStrategy);



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

let server;

function runServer(port = PORT) {
  server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
  // console.log('server:', server);
  let io = socket(server);
  //getting info we recieved from client (author and mesage) and sending it to everyone else
  // io.on('connection', (socket) => {
  //   console.log('user connected:', socket.id);
  //   socket.emit('hello, there are users here');
  //   socket.on('CREATE_ROOM', ()=> {

  //   });
  //   socket.on('TYPING', function(msg){
  //     io.sockets.emit('typeUpdate', msg )
  //   });
  //   socket.on('subscribe', chat => {
  //     socket.join(chat);
  //   });
  //   socket.on('CHAT', function (data) {
  //     io.sockets.in(data.room).emit('CHAT', data);
  //   });
  // });
  const main = new Main(io)
  // main.createRoom('jews', 'jeff')
}

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          // let io = socket(server);
          socketSingleton.configure(server);
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
  dbConnect();
  runServer();
}

module.exports = app;