const CHAT_CHANNELS = {
    REQUEST_UPDATE_CHATROOM: 'chat-room:update',
    USER_CONNECTED: 'chat-room:user-connected',
    NOTICE_CHATROOM_UPDATED_STATUS: 'chat-room:updated',
    SENDING_SIGNAL: 'chat-room:sending-signal',
    RETURNING_SIGNAL: 'chat-room:returning-signal',
    USER_OFF_CALL: 'chat-room:user-off-call',
    USER_LEAVE: 'chat-room:user-leave',
    NEW_MESSAGE: 'chat-room:user-chat',
    USER_RECEIVED_RETURN_SIGNAL: ({ roomId }) => 'chat-room:received-return-signal'+roomId,
    USER_RECEIVED_SIGNAL_IN_ROOM: ({ roomId }) => 'chat-room:received-signal' + roomId,
    SEND_MESSAGE_IN_ROOM: ({ roomId }) => 'chat-room-' + roomId + '-message',
    LEAVE_CHAT_ROOM: ({ roomId }) => 'chat-room-leave-' + roomId,
    JOIN_CHAT_ROOM: ({ roomId }) => 'chat-room-join-' + roomId,
};

const PEER_CHANNEL = {
    SIGNAL: 'signal',
    STREAM: 'stream',
};

module.exports = {
    CHAT_CHANNELS,
    PEER_CHANNEL,
}