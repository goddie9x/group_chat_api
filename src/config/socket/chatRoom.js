const ChatRoomModel = require('../../app/models/ChatRoom');

module.exports = (io) => {
    const chatRoomUpdated = () => {
        io.emit('chat-room:update', {
            message: 'new chat room created',
        });
    };
    const userLeave = (data) => {
        const {
            _id,
            userId,
        } = data;
        /* console.log('user leave', data); */
        ChatRoomModel.findById({ _id })
            .then((chatRoom) => {
                if (chatRoom) {
                    const { users } = chatRoom;
                    const index = users.findIndex(user => user.userId === userId);
                    if (index > -1) {
                        const username = users[index].username;
                        if (users.length === 1) {
                            chatRoom.remove()
                                .then(() => {
                                    io.emit('chat-room:update', {
                                        message: 'chat room deleted',
                                    });
                                })
                                .catch(err => console.log(err));
                        } else {
                            users.splice(index, 1);
                            chatRoom.save()
                                .then(() => {
                                    io.emit('chat-room:update', {
                                        message: 'user left',
                                    });
                                })
                                .catch(err => console.log(err));
                        }
                        io.emit('chat-room-leave-' + _id, {
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
    const userConnected = (data) => {
        const {
            _id,
            username,
        } = data;
        io.emit('chat-room-join-' + _id, {
            username,
        });
        io.emit('chat-room:update', {
            message: 'user connected',
        });
    };
    const userChat = (data) => {
        const {
            _id,
            message,
            userId,
            username,
            avatar,
            time,
        } = data;
        io.emit('chat-room-' + _id + '-message', {
            message,
            userId,
            username,
            avatar,
            time,
        });
    }

    return {
        chatRoomUpdated,
        userLeave,
        userConnected,
        userChat,
    };
}