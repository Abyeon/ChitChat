const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');

const username = window.prompt("Please enter a name");
socket.emit('log in', username);

function addMessage(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', {name: username, content: input.value});
        input.value = '';
    }
});

socket.on('MESSAGE_BLOCK', (messages) => {
    messages.forEach(msg => {
        addMessage(`${msg.name}: ${msg.content}`);
    });
});

socket.on('chat message', function(msg) {
    addMessage(`${msg.name}: ${msg.content}`);
});

socket.on('user disconnect', function() {
    addMessage('User disconnected.');
});

socket.on('user connect', (name) => {
    addMessage(`${name} has connected.`);
})