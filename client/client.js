const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');

const username = window.prompt("Please enter a name");
socket.emit('USER_LOG_IN', username);

function addMessage(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
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
        addMessage(`${msg.name}: ${msg.content}`);
    });
});

socket.on('RELOAD', () => { // In case the server restarts, things will break
    location.reload();
})

socket.on('CHAT_MESSAGE', function(msg) {
    addMessage(`${msg.name}: ${msg.content}`);
});

socket.on('USER_DISCONNECT', function() {
    addMessage('User disconnected.');
});

socket.on('USER_CONNECT', (name) => {
    addMessage(`${name} has connected.`);
})