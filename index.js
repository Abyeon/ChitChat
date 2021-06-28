const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const config = require('./config.json')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/client.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(__dirname + '/client/client.js');
});

var messages = []; // Logged messages { name: senders-name, content: message-content }
var users = []; //Active users        { id: their-socket-id, name: their-username }

io.on('connection', (socket) => {
  // User "logs in", though its basically just setting their name for now
  // TODO: Stop user from having a duplicate name
  socket.on('USER_LOG_IN', (name) => {
    io.to(socket.id).emit('MESSAGE_BLOCK', messages);
    users.push({id: socket.id, username: name});
    io.emit('USER_CONNECT', name);
    console.log(`${name} has connected.`);
  });

  socket.on('CHAT_MESSAGE', (msg) => {
    let user = users.find(user => user.id == socket.id)

    // If the user tries sending a message after the server restarts, things break. So just reload their page for now.
    if (!user) {
      io.to(socket.id).emit('RELOAD');
      return;
    }

    let message = {name: user.username, content: msg.slice(0, config.charLimit), date: new Date().toLocaleString()};

    io.emit('CHAT_MESSAGE', message);
    messages.push(message);
    console.log(`${message.date} ${socket.id} ${message.name}: ${message.content}`);
  })

  // On user disconnect
  socket.on('disconnect', () => {
    // Remove socket from the user array
    let index = users.map(user => user.id).indexOf(socket.id);
    if (index > -1) users.splice(index, 1);

    io.emit('USER_DISCONNECT');
    console.log('A user disconnected.');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});