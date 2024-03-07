const CHAT_CHANNELS = {
    REQUEST_UPDATE_CHATROOM: 'chat-room:update',
    USER_CONNECTED: 'chat-room:user-connected',
    USER_VIDEO_CONNECTED: 'chat-room:video-user-connected',
    NOTICE_CHATROOM_UPDATED_STATUS: 'chat-room:updated',
    SENDING_SIGNAL: 'chat-room:sending-signal',
    USER_RECEIVED_SIGNAL: 'chat-room:received-signal',
    RETURNING_SIGNAL: 'chat-room:returning-signal',
    USER_RECEIVED_RETURN_SIGNAL: 'chat-room:received-return-signal',
    USER_LEAVE: 'chat-room:user-leave',
    NEW_MESSAGE: 'chat-room:user-chat',
    VIDEO_JOIN_CHAT_ROOM: ({ roomId }) => 'video-chat-room-join-' + roomId,
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