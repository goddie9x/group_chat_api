const ChatRoom = require('../models/ChatRoom');
const mongoose = require('../../config/db');
class ChatRoomController {
    index(req, res) {
        const page = req.params.page;
        const reload = req.query.reload;
        const limit = 12;
        const skip = (reload == 1) ? 0 : ((page - 1) * limit);
        ChatRoom.find({})
            .populate('creator')
            .populate('users')
            .sort({ createdAt: -1 })
            .skip(skip)
            .then(chatRooms => {
                res.json(chatRooms);
            })
            .catch(err => {
                console.log('line:17', err);
                res.status(500).json(err);
            });
    }
    create(req, res) {
        const { topic, maximum, tags } = req.body;
        const creator = req.data.currentUser;
        ChatRoom.create({
            topic,
            maximum,
            tags,
            creator: creator._id,
            users: [creator._id],
        })
            .then(chatRoom => {
                res.status(200).json(chatRoom._id);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    }
    search(req, res) {
        const search = req.query.search?.trim();
        if (!search || search.length < 1) {
            res.status(404).json('Not found');
        }
        else {
            const criteria = {};
            const regex = '.*' + search + '.*';
            criteria.$or = [{ tags: { $elemMatch: { $regex: regex, $options: 'i' } } }, { topic: { $regex: regex, $options: 'i' } }];

            if (mongoose.Types.ObjectId.isValid(search)) {
                criteria.$or.push({ _id: search })
            }
            ChatRoom.find(criteria)
                .then(chatRooms => {
                    const rooms = chatRooms.map(chatRoom => {
                        return {
                            url: '/room-chat/' + chatRoom._id,
                            value: chatRoom.topic,
                            tags: chatRoom.tags,
                        };
                    });
                    res.json(rooms);
                })
                .catch(err => {
                    console.log('line 57:', err);
                    res.status(500).json(err);
                });
        }
    }
    join(req, res) {
        const userId = req.data.currentUser._id.toString();
        const roomId = req.params.id;
        if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
            ChatRoom.findOne({ _id: roomId })
                .populate('creator')
                .populate('users')
                .then(chatRoom => {
                    if (chatRoom) {
                        if (chatRoom.users.findIndex(user => user._id == userId) > -1) {
                            res.json(chatRoom);
                        } else if (chatRoom.users.length >= chatRoom.maximum) {
                            res.status(400).json({
                                message: 'This room is full',
                            });
                        } else {
                            chatRoom.users.push(userId);
                            return chatRoom.save();
                        }
                    } else {
                        res.status(400).json({
                            message: 'This room does not exist',
                        });
                    }
                })
                .then(chatRoom => {
                    res.json(chatRoom);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json(err);
                });
        } else {
            res.status(400).json({
                message: 'This room does not exist',
            });
        }
    }
    leave(req, res) {
        const userId = req.params.id;
        ChatRoom.updateMany({
            users: userId
        }, {
            $pull: {
                users: userId
            }
        })
            .then(chatRoom => {
                res.json(chatRoom);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
    update(req, res) {
        const { topic, maximum, tags } = req.body;
        const creator = req.data.currentUser;
        ChatRoom.findOneAndUpdate({
            _id: req.params.id,
            creator: creator._id
        }, {
            topic,
            maximum,
            tags,
        })
            .then(chatRoom => {
                res.json(chatRoom);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
    delete(req, res) {
        ChatRoom.findByIdAndDelete(req.params.id)
            .then(chatRoom => {
                res.json(chatRoom);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
}

module.exports = new ChatRoomController;
