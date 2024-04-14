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
    const userVideoConnected = ({ roomId, userConnected }) => {
        handleMapSocketWithTargetId(users, userConnected._id);
        handleMapSocketWithTargetId(roomVideos, roomId);
        io.emit(CHAT_CHANNELS.VIDEO_JOIN_CHAT_ROOM({ roomId }), userConnected);
    }
    const userSendingSignal = ({
        userRequireAnswerSignal,
        roomId,
        userSendSignal,
        signal, }) => {
        io.emit(CHAT_CHANNELS.USER_RECEIVED_SIGNAL_IN_ROOM({ roomId }),
            { userRequireAnswerSignal, signal, userSendSignal });
    };
    const returningSignal = ({ roomId, signal, userReturnSignal, userReceiveReturnSignal }) => {
        io.emit(CHAT_CHANNELS.USER_RECEIVED_RETURN_SIGNAL({ roomId }),
            { signal, userReturnSignal, userReceiveReturnSignal });
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
                    
                    const index = users.findIndex(user => user.toString() == userId);
                    if (index > -1) {
                        const username = users[index].username;

                        if (users.length === 1) {
                            chatRoom.remove()
                                .then(() => {
                                    io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
                                        message: 'chat room deleted',
                                        roomId
                                    });
                                })
                                .catch(err => console.log(err));
                        } else {
                            users.splice(index, 1);
                            chatRoom.save()
                                .then(() => { })
                                .catch(err => console.log(err));
                        }
                        io.emit(CHAT_CHANNELS.LEAVE_CHAT_ROOM({ roomId }), {
                            username,
                        });
                    } else {
                        console.log('chatRoom.js,Line 128: user not found');
                    }
                } else {
                    console.log('chatRoom.js,Line 131:chat room not found');
                }
            });
    }
    const handleUserOffCall = () => {
        const socketId = socket.id;
        const roomId = findItemBySocketId(roomVideos, socketId).key;

        if (roomId && roomVideos[roomId]) {
            roomVideos[roomId] = roomVideos[roomId].filter(socket => socket != socketId);
        }
        io.emit(CHAT_CHANNELS.USER_OFF_CALL, {
            socketId: socketId
        });
    }
    const handleSocketDisconnect = (data) => {
        const socketId = socket.id;
        io.emit(CHAT_CHANNELS.USER_OFF_CALL, {
            socketId
        });
        const filterNotCurrentSocket = socket => socket != socketId;

        try {
            let userId = data?.userId;
            let roomId = data?.roomId;
            let videoRoomId = data?.roomId;
            if (!userId) {
                userId = findItemBySocketId(users, socketId).key;
            }
            if (!roomId) {
                roomId = findItemBySocketId(rooms, socketId).key;
            }
            if (!videoRoomId) {
                videoRoomId = findItemBySocketId(roomVideos, socketId).key;
            }

            if (videoRoomId&&roomVideos[videoRoomId]) {
                roomVideos[videoRoomId] = roomVideos[videoRoomId].filter(filterNotCurrentSocket);
            }
            if (userId&&users[userId]) {
                users[userId] = users[userId].filter(filterNotCurrentSocket);
            }
            if (roomId&&rooms[roomId]) {
                rooms[roomId] = rooms[roomId].filter(filterNotCurrentSocket);
            }
            if (userId && (roomId || videoRoomId)) {
                removeUserInRoom(roomId || videoRoomId, userId);
                io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
                    message: 'user left',
                    socketId: socketId
                });
            }
        }
        catch (e) {
            console.log(e);
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
        handleUserOffCall,
        userLeave,
    };
}