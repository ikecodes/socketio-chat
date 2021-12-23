const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const router = require('./routes/routes');
const app = express();
app.use(cors());
app.options('*', cors());

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error);
    }
    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to ${user.room}` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` });
    console.log(`${user.name} has joined`);
    socket.join(user.room);
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    callback();
  });

  socket.on('sendMessage', async (message, callback) => {
    const user = await getUser(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    callback();
  });
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has left ${user.room}` });
    }
  });
});

app.use(router);
server.listen(PORT, () => console.log(`running on port ${PORT}`));
