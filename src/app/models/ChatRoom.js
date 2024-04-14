const mongoose = require('../../config/db');
const User = require('./User');
const Schema = mongoose.Schema;

const ChatRoomSchema = new mongoose.Schema({
    topic: String,
    maximum: Number,
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', ChatRoomSchema)