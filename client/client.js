const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const username = window.prompt("Please enter a name");
socket.emit('set name', username);

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', {name: username, content: input.value});
        input.value = '';
    }
});

socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = `${msg.name}: ${msg.content}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user disconnect', function() {
    var item = document.createElement('li');
    item.textContent = "User disconnected";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user connect', function() {
    var item = document.createElement('li');
    item.textContent = "User connected";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
})