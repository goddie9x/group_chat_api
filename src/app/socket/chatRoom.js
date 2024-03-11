const ChatRoomModel = require('../../app/models/ChatRoom');
const { CHAT_CHANNELS } = require('../../config/socketChanel');

const users = {};

const socketToRoom = {};

module.exports = (io, socket) => {
    const chatRoomUpdated = () => {
        io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
            message: 'let\'s update list chat room',
        });
    };

    const userConnected = (data) => {
        const {
            _id,
            username,
        } = data;

        io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
            message: 'user connected',
        });

        io.emit(CHAT_CHANNELS.JOIN_CHAT_ROOM({ roomId: _id }), {
            username,
        });
    };
    const userVideoConnected = (roomId) => {
        if (users[roomId]) {
            users[roomId].push(socket.id);
        } else {
            users[roomId] = [socket.id];
        }
        socketToRoom[socket.id] = roomId;
        const usersInThisRoom = users[roomId].filter(id => id !== socket.id);
        socket.emit(CHAT_CHANNELS.VIDEO_JOIN_CHAT_ROOM({ roomId }), usersInThisRoom);
    }
    const userSendingSignal = (payload) => {
        io.to(payload.userToSignal).emit(CHAT_CHANNELS.USER_RECEIVED_SIGNAL,
            { signal: payload.signal, callerID: payload.callerID });
    };
    const returningSignal = (payload) => {
        io.to(payload.callerID).emit(CHAT_CHANNELS.USER_RECEIVED_RETURN_SIGNAL, { signal: payload.signal, id: socket.id });
    }
    const userChat = (data) => {
        const {
            _id,
            message,
            userId,
            username,
            avatar,
            time,
        } = data;
        io.emit(CHAT_CHANNELS.SEND_MESSAGE_IN_ROOM({ roomId: _id }), {
            message,
            userId,
            username,
            avatar,
            time,
        });
    }

    const handleSocketDisconnect = ({
        roomId,
        userId,
    }) => {
        /* const currentSocketId = socket.id;
        const listUserId = Object.keys(mapUserWithSocket);
        const listRoomId = Object.keys(rooms);

        userId = userId ?? listUserId.find(userId => mapUserWithSocket[userId].includes(currentSocketId));
        if (userId) {
            roomId = roomId ?? listRoomId.find(roomId => rooms[roomId] && rooms[roomId][userId].includes(currentSocketId));
            if (roomId) {
                if (!rooms[roomId]) {
                    userLeave({
                        _id: roomId,
                        userId
                    });
                }
            }
        }
        for (let userIdToCkeck of listUserId) {
            if (mapUserWithSocket[userIdToCkeck].includes(currentSocketId)) {
                mapUserWithSocket[userIdToCkeck] = mapUserWithSocket[userIdToCkeck].filter(x => x != currentSocketId);
                break;
            }
        }
        listRoomId.forEach(roomIdToCheck => {
            const listUserIdInRoom = Object.keys(rooms[roomIdToCheck]);

            listUserIdInRoom.forEach(userIdToCheck => {
                if ([userIdToCheck] && rooms[roomIdToCheck][userIdToCheck].includes(currentSocketId)) {
                    rooms[roomIdToCheck][userIdToCheck] = rooms[roomIdToCheck][userIdToCheck].filter(x => x == currentSocketId);
                }
            })
        });
        console.log(mapUserWithSocket);
        console.log(rooms); */
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    };
    const userLeave = (data) => {
        const {
            _id,
            userId,
        } = data;
        ChatRoomModel.findById({ _id })
            .then((chatRoom) => {
                if (chatRoom) {
                    const { users } = chatRoom;
                    const index = users.findIndex(user => user.userId == userId);
                    if (index > -1) {
                        const username = users[index].username;
                        if (users.length === 1) {
                            chatRoom.remove()
                                .then(() => {
                                    io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
                                        message: 'chat room deleted',
                                    });
                                })
                                .catch(err => console.log(err));
                        } else {
                            users.splice(index, 1);
                            chatRoom.save()
                                .then(() => {
                                    io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
                                        message: 'user left',
                                    });
                                })
                                .catch(err => console.log(err));
                        }
                        io.emit(CHAT_CHANNELS.LEAVE_CHAT_ROOM({ roomId: _id }), {
                            username,
                        });
                    } else {
                        console.log('user not found');
                    }
                } else {
                    console.log('chat room not found');
                }
            });
    };
    return {
        chatRoomUpdated,
        userConnected,
        userVideoConnected,
        userSendingSignal,
        returningSignal,
        userChat,
        handleSocketDisconnect,
        userLeave,
    };
}