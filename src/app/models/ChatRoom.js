const mongoose = require('../../config/db');

const ChatRoomSchema = new mongoose.Schema({
    topic: String,
    maximum: Number,
    creater: { username: String, userId: String, avatar: String },
    tags: [String],
    users: [{ username: String, userId: String, avatar: String }],
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', ChatRoomSchema)