'use strict';
require('dotenv').config();
const express = require('express');
// const mongoose = require('mongoose');
const morgan = require('morgan');
// const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const app = express();
// const server = require('http').createServer(app)


const { PORT, DATABASE_URL } = require('./config');
let users = [];
let connections = [];

// server.listen(PORT)

//allow cors
app.use(cors());

//parse request body
app.use(express.json());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))


let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
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
  runServer(DATABASE_URL).catch(err => console.error(err));
}
const io = require('socket.io').listen(server)
console.log(server)
app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});
io.on('connection', function(socket) {
  connections.push(socket);
  console.log('Connected: %s sockets conected', connections.length)

  //disconnect
  connections.splice(connections.indexOf(socket), 1);
  console.log('Disconnected: %s sockets connected', connections.length)
})
app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});
module.exports = { app, runServer, closeServer };

// module.exports = { app };

