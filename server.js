const express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    path = require('path'),
    io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);

io.sockets.on('connection', function (socket) {
    socket.on('joinroom', (roomNum) => {
        console.log("Sala: " + roomNum);
        socket.join(roomNum);

        io.sockets.in(roomNum).emit('users', io.nsps['/'].adapter.rooms[roomNum]);
    });

    socket.on('userDrawing', (userAction) => {
        socket.broadcast.emit('drawingCoordinates', userAction);
    });
});

server.listen(8081, function(){
    console.log("Rodando o server!");
});

console.log("Server running on port: 8080");