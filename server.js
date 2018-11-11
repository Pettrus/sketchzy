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

let rooms = [];

io.sockets.on('connection', function (socket) {
    socket.on('joinroom', (user) => {
        socket.join(user.room);
        socket.nickname = user.nickname;
        socket.id = user.id;

        if(rooms[user.room] == null) {
            rooms[user.room] = [{
                id: user.id,
                nickname: user.nickname
            }];
        }else {
            rooms[user.room].push({
                id: user.id,
                nickname: user.nickname
            });
        }

        console.log(rooms[user.room]);

        //io.sockets.in(user.room).emit('users', io.nsps['/'].adapter.rooms[roomNum]);
        io.sockets.in(user.room).emit('users', rooms[user.room]);
    });

    socket.on('userDrawing', (userAction) => {
        socket.broadcast.emit('drawingCoordinates', userAction);
    });
});

server.listen(8081, function(){
    console.log("Server running on port: 8080");
});