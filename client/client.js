const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');

/* Send Server A Request To Log In As Name */
let username = window.prompt("Please enter a name");
socket.emit('USER_LOG_IN', username);

let messageCache = [];

/* Format and add a new message to the document */
function addMessage(msg) {
    var item = document.createElement('li');

    var span = document.createElement('span');
    span.textContent = msg.content;

    if (messageCache.length == 0 || messageCache[messageCache.length - 1].name != msg.name || messages.lastElementChild.className == "infomessage") {
        var header = document.createElement('h4');
        header.textContent = msg.name;

        var timestamp = document.createElement('span');

        let date = new Date(msg.date);

        timestamp.textContent = " - " + date.toLocaleString();

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

/* Format and add a server message to the document */
function addInfoMessage(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    item.className = "infomessage";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

/* We (client) sends message */
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('CHAT_MESSAGE', input.value);
        input.value = '';
    }
});

/* Sent name was taken, retry */
socket.on('BAD_NAME', () => {
    // TODO: Show warning before reloading
    location.reload();
});

/* Recieved previous messages */
socket.on('MESSAGE_BLOCK', (messages) => {
    messages.forEach(msg => {
        addMessage(msg);
        messageCache.push(msg);
    });
});

/* Server asked client to refresh page */
socket.on('RELOAD', () => { // In case the server restarts, things will break
    location.reload();
})

/* New message recieved */
socket.on('CHAT_MESSAGE', (msg) => {
    addMessage(msg);
    messageCache.push(msg);
});

/* Server message recieved */
socket.on('INFO_MESSAGE', (msg) => {
    addInfoMessage(msg);
});