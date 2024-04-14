const { CHAT_CHANNELS } = require('../../config/socketChanel/index.js');


const users = {};

const rooms = {};

const connectIo = (io) => {
    io.on('connection', (socket) => {
        const {
            chatRoomUpdated,
            userConnected,
            userVideoConnected,
            userChat,
            userSendingSignal,
            returningSignal,
            handleSocketDisconnect,
            handleUserOffCall,
            userLeave,
        } = require('./chatRoom.js')(io, socket, users, rooms);
        socket.on(CHAT_CHANNELS.USER_CONNECTED, userConnected);
        socket.on(CHAT_CHANNELS.REQUEST_UPDATE_CHATROOM, chatRoomUpdated);
        socket.on(CHAT_CHANNELS.NOTICE_CHATROOM_UPDATED_STATUS, chatRoomUpdated);
        socket.on(CHAT_CHANNELS.USER_VIDEO_CONNECTED, userVideoConnected);
        socket.on(CHAT_CHANNELS.NEW_MESSAGE, userChat);
        socket.on(CHAT_CHANNELS.SENDING_SIGNAL, userSendingSignal);
        socket.on(CHAT_CHANNELS.RETURNING_SIGNAL, returningSignal);
        socket.on(CHAT_CHANNELS.USER_OFF_CALL, handleUserOffCall);
        socket.on(CHAT_CHANNELS.USER_LEAVE, handleSocketDisconnect);
        socket.on('disconnect', () => {
            try {
                handleSocketDisconnect();
            }
            catch (e) {
                console.log('socket/index.js 29', e);
            }
        });
    });
}

module.exports = connectIo;