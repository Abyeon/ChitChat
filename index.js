const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/client.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(__dirname + '/client/client.js');
});

io.on('connection', (socket) => {
    io.emit('user connect');
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log(`${msg.name}: ${msg.content}`);
    })

    socket.on('disconnect', () => {
        io.emit('user disconnect');
        console.log('A user disconnected.');
    });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});