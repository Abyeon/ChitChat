const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');

const username = window.prompt("Please enter a name");
socket.emit('USER_LOG_IN', username);

let messageCache = [];

function addMessage(msg) {
    var item = document.createElement('li');

    var span = document.createElement('span');
    span.textContent = msg.content;

    if (messageCache.length == 0 || messageCache[messageCache.length - 1].name != msg.name || messages.lastElementChild.className == "infomessage") {
        var header = document.createElement('h4');
        header.textContent = msg.name;

        var timestamp = document.createElement('span');
        timestamp.textContent = " - " + msg.date;

        header.appendChild(timestamp);

        item.appendChild(header);
        item.appendChild(span);

        messages.appendChild(item);
    } else {
        var lastMessage = messages.lastElementChild;
        lastMessage.appendChild(span);
    }

    window.scrollTo(0, document.body.scrollHeight);
}

function addInfoMessage(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    item.className = "infomessage";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('CHAT_MESSAGE', input.value);
        input.value = '';
    }
});

socket.on('MESSAGE_BLOCK', (messages) => {
    messages.forEach(msg => {
        addMessage(msg);
        messageCache.push(msg);
    });
});

socket.on('RELOAD', () => { // In case the server restarts, things will break
    location.reload();
})

socket.on('CHAT_MESSAGE', function(msg) {
    addMessage(msg);
    messageCache.push(msg);
});

socket.on('USER_DISCONNECT', function() {
    addInfoMessage('User disconnected.');
});

socket.on('USER_CONNECT', (name) => {
    addInfoMessage(`${name} has connected.`);
})