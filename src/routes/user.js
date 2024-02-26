const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/userController');
const getUserInfo = require('../app/middlewares/getUserInfo');
const checkUserLogin = require('../app/middlewares/checkUserLogin');
const { uploadCloud } = require('../config/cloudinary/cloudinary.config');
const checkModLogin = require('../app/middlewares/checkModLogin');

router.patch('/profile/avatar/:id', uploadCloud.single('image'), userController.updateAvartar);
router.patch('/profile/:id', userController.updateInfo);
router.post('/ban/:id', checkModLogin, userController.banUser);
router.delete('/delete/:id', checkModLogin, userController.forceDelete);
router.post('/unban/:id', checkModLogin, userController.unbanUser);
router.get('/profile/:id', userController.profile);
router.post('/edit-role/:id', checkModLogin, userController.editRole);
router.post('/manager', checkModLogin, userController.manager);
router.post('/handleMultiAction', checkModLogin, userController.handleMultiAction);
router.post('/banned', checkModLogin, userController.bannedUsers);
router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/reset-password', userController.restore);
router.post('/reset-password/:tokenRestore', userController.resetPassword);
router.post('/', userController.index);

module.exports = router;