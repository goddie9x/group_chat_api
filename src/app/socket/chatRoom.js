const ChatRoomModel = require('../../app/models/ChatRoom');
const { CHAT_CHANNELS } = require('../../config/socketChanel');

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
            user
        } = data;
        handleMapSocketWithTargetId(users, user._id);
        handleMapSocketWithTargetId(rooms, roomId);
        io.emit(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, {
            message: 'user connected',
        });

        io.emit(CHAT_CHANNELS.JOIN_CHAT_ROOM({ roomId }), user);
    };
    const userSendingSignal = ({
        userRequireAnswerSignal,
        roomId,
        userSendSignal,
        signal,
        peerVersion }) => {
        io.emit(CHAT_CHANNELS.USER_RECEIVED_SIGNAL_IN_ROOM({ roomId }),
            { userRequireAnswerSignal, signal, userSendSignal, peerVersion });
    };
    const returningSignal = ({ roomId, signal, userReturnSignal, userReceiveReturnSignal, peerVersion }) => {
        io.emit(CHAT_CHANNELS.USER_RECEIVED_RETURN_SIGNAL({ roomId }),
            { signal, userReturnSignal, userReceiveReturnSignal, peerVersion });
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
            .populate('users')
            .then((chatRoom) => {
                if (chatRoom) {
                    const { users } = chatRoom;

                    const index = users.findIndex(user => user._id == userId);
                    if (index > -1) {
                        const userInfo = users[index];

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
                        io.emit(CHAT_CHANNELS.LEAVE_CHAT_ROOM({ roomId }), userInfo);
                    } else {
                        console.log('chatRoom.js,Line 118: user not found');
                    }
                } else {
                    console.log('chatRoom.js,Line 121:chat room not found');
                }
            });
    }
    const handleSocketDisconnect = (data) => {
        const socketId = socket.id;
        const filterNotCurrentSocket = socket => socket != socketId;

        try {
            let userId = data?.userId;
            let roomId = data?.roomId;

            if (!userId) {
                userId = findItemBySocketId(users, socketId).key;
            }
            if (!roomId) {
                roomId = findItemBySocketId(rooms, socketId).key;
            }

            if (userId && users[userId]) {
                users[userId] = users[userId].filter(filterNotCurrentSocket);
            }
            if (roomId && rooms[roomId]) {
                rooms[roomId] = rooms[roomId].filter(filterNotCurrentSocket);
            }
            if (userId && (roomId)) {
                removeUserInRoom(roomId, userId);
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
        userSendingSignal,
        returningSignal,
        userChat,
        handleSocketDisconnect,
        userLeave,
    };
}