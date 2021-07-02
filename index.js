/* NPM */
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

/* Server Stuff */
const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* Required Files */
const config = require('./config.json')

/* Content To Send New Connections */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/client.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(__dirname + '/client/client.js');
});

var messages = []; // Logged messages { name: senders-name, content: message-content }
var users = [];    // Active users    { id: their-socket-id, name: their-username }

/* New Socket Connection */
io.on('connection', (socket) => {
    // User "logs in", though its basically just setting their name for now
    // TODO: Stop user from having a duplicate name

    let nextMessageTime = new Date().getTime() + config.spamDelay;
    let warned = false;
    let typing = false;

    /* New User Logged In */
    socket.on('USER_LOG_IN', (name) => {
        if (name == null) return io.to(socket.id).emit('BAD_NAME');

        users.forEach(user => {
            if (user.username.toLowerCase() == name.toLowerCase()) return io.to(socket.id).emit('BAD_NAME');
        });

        io.to(socket.id).emit('MESSAGE_BLOCK', messages);
        users.push({ id: socket.id, username: name });
        io.emit('INFO_MESSAGE', `${name} has connected.`);
        console.log(`${name} has connected.`);
    });

    /* User Typing Event */
    socket.on('TYPING', () => {
        if (typing) return; // Avoid spamming clients with typing events
        let user = users.find(user => user.id == socket.id);

        if (!user) {
            io.to(socket.id).emit('RELOAD');
            return;
        }

        typing = true;
        setTimeout(() => { typing = false; }, 5000);

        io.emit('USER_TYPING', user.username);
    });

    /* Incoming Chat Message */
    socket.on('CHAT_MESSAGE', (msg) => {
        let user = users.find(user => user.id == socket.id)

        // If the user tries sending a message after the server restarts, things break. So just reload their page for now.
        if (!user) {
            io.to(socket.id).emit('RELOAD');
            return;
        }

        /* Spam Prevention */
        let now = new Date().getTime();
        let distance = nextMessageTime - now;

        if (distance > 0) {
            if (!warned) io.to(socket.id).emit('INFO_MESSAGE', `Please wait another ${(distance / 1000).toFixed(1)} second(s) to send another message.`);
            warned = true;
            return;
        } else {
            warned = false;
        }

        nextMessageTime = now + config.spamDelay;

        /* Send Message */
        let message = { name: user.username, content: msg.slice(0, config.charLimit), date: Date.now() };

        io.emit('CHAT_MESSAGE', message);
        messages.push(message);
        console.log(`${new Date().toLocaleString()} ${socket.id} ${message.name}: ${message.content}`);
    })

    /* User Disconnect */
    socket.on('disconnect', () => {
        let user = users.find(user => user.id == socket.id)
        if (user) io.emit('INFO_MESSAGE', `${user.username} has disconnected.`);

        // Remove socket from the user array
        let index = users.map(user => user.id).indexOf(socket.id);
        if (index > -1) {
            users.splice(index, 1);
        } else {
            console.log(`${user} not found.`);
        }
        console.log('A user disconnected.');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});