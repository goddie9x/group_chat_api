let sockets = {};

const connectIo = (io) => {
    io.on('connection', (socket) => {
        const { createNotifDone } = require('./notification.js')(io);
        const {
            chatRoomUpdated,
            userLeave,
            userConnected,
            userChat
        } = require('./chatRoom.js')(io);

        socket.on("notif:created", createNotifDone);
        socket.on("chat-room:updated", chatRoomUpdated);
        socket.on("chat-room:user-leave", userLeave);
        socket.on("chat-room:user-connected", (data) => {
            const {
                _id,
                userId,
            } = data;
            if (sockets[socket.id]) {
                if (!sockets[socket.id].userId) {
                    sockets[socket.id].userId = userId;
                }
                sockets[socket.id].rooms.push(_id);
            } else {
                sockets[socket.id] = { userId, rooms: [_id] };
            }
            userConnected(data);
        });
        socket.on("chat-room:user-chat", userChat);
        socket.on('disconnect', () => {
            const currentSocket = sockets[socket.id];
            if (currentSocket) {
                sockets[socket.id].rooms.forEach(room => {
                    userLeave({
                        _id: room,
                        userId: currentSocket.userId,
                    });
                });
            }

            console.log('user disconnected');
        });
    });
}

module.exports = connectIo;