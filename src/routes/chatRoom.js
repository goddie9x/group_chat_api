const express = require('express');
const router = express.Router();
const ChatRoomController = require('../app/controllers/ChatRoomController');
const checkUserLogin = require('../app/middlewares/checkUserLogin');

router.post('/create', checkUserLogin, ChatRoomController.create);
router.post('/update/:id', checkUserLogin, ChatRoomController.update);
router.post('/delete/:id', checkUserLogin, ChatRoomController.delete);
router.post('/leave/:id', checkUserLogin, ChatRoomController.leave);
router.post('/join/:id', checkUserLogin, ChatRoomController.join);
router.get('/search', ChatRoomController.search);
router.get('/', ChatRoomController.index);

module.exports = router;