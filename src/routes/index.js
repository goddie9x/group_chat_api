const siteRouter = require('./site');
const userRouter = require('./user');
const ChatRoomRouter = require('./chatRoom');

function router(app) {
    app.use('/user', userRouter);
    app.use('/chat-room', ChatRoomRouter);
    app.use('/', siteRouter);
}

module.exports = router;