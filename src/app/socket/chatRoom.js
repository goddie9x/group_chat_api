const ChatRoomModel = require('../../app/models/ChatRoom');
const { CHAT_CHANNELS } = require('../../config/socketChanel');

const roomVideos = {};

module.exports = (io, socket, users, rooms) => {
    const chatRoomUpdated = () => {
        io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
            message: 'let\'s update list chat room',
        });
    };
    const findItemBySocketId = (targetMap, socketId, hasMetadata = false) => {
        const listKey = Object.keys(targetMap);
        const targetKey = hasMetadata ?
            listKey.find(key => targetMap[key]?.items?.includes(socketId))
            : listKey.find(key => targetMap[key]?.includes(socketId));

        return {
            key: targetKey,
            value: targetMap[targetKey]
        }
    }
    const handleMapSocketWithTargetId = (targetMap, targetId, metadata = false) => {
        const socketId = socket.id;

        if (metadata) {
            if (targetMap[targetId]) {
                if (!targetMap[targetId].items.includes(socketId)) {
                    targetMap[targetId].items.push(socketId);
                }
            }
            else {
                targetMap[targetId] = {
                    items: [socketId],
                    ...metadata
                };
            }
        }
        else {
            if (targetMap[targetId]) {
                if (!targetMap[targetId].includes(socketId)) {
                    targetMap[targetId].push(socketId);
                }
            }
            else {
                targetMap[targetId] = [socketId];
            }
        }
    }
    const userConnected = (data) => {
        const {
            roomId,
            username,
            userId
        } = data;
        handleMapSocketWithTargetId(users, userId);
        handleMapSocketWithTargetId(rooms, roomId);

        io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
            message: 'user connected',
        });

        io.emit(CHAT_CHANNELS.JOIN_CHAT_ROOM({ roomId }), {
            username,
        });
    };
    const userVideoConnected = ({ roomId, userId }) => {
        handleMapSocketWithTargetId(users, userId);
        handleMapSocketWithTargetId(rooms, roomId);
        const socketId = socket.id;
        const { value: currentUser } = findItemBySocketId(users, socketId);

        const listSocketInThisRoomExceptCurrentUser = rooms[roomId].filter(id => !currentUser?.includes(id));
        socket.emit(CHAT_CHANNELS.VIDEO_JOIN_CHAT_ROOM({ roomId }), listSocketInThisRoomExceptCurrentUser);
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

    const removeUserInRoom = (roomId, userId) => {
        ChatRoomModel.findById(roomId)
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

                                })
                                .catch(err => console.log(err));
                        }
                        io.emit(CHAT_CHANNELS.LEAVE_CHAT_ROOM({ roomId }), {
                            username,
                        });
                    } else {
                        console.log('user not found');
                    }
                } else {
                    console.log('chat room not found');
                }
            });
    }
    const handleSocketDisconnect = (data) => {
        const socketId = socket.id;
        try {
            let userId = data?.userId??findItemBySocketId(users, socketId).key;
            let roomId = data?.roomId??findItemBySocketId(rooms, socketId).key;
            if (userId && roomId) {
                users[userId] = users[userId].filter(socket => socket != socketId);
                rooms[roomId] = rooms[roomId].filter(socket => socket != socketId);
                if (users[userId].length < 1) {
                    removeUserInRoom(roomId, userId);
                }
                io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
                    message: 'user left',
                });
            }

        }
        catch (e) {
            //console.log(e);
        }
    };
    const userLeave = (data) => {
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