const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');
const { uploadCloud } = require('../config/cloudinary/cloudinary.config');
const getUserInfo = require('../app/middlewares/getUserInfo');
const checkModLogin = require('../app/middlewares/checkModLogin');

router.post('/cloudinary-upload', uploadCloud.single('upload'), siteController.cloudinary);
router.delete('/images/:image', getUserInfo, checkModLogin, siteController.cloudinaryDelete);
router.get('/images', siteController.images);
router.get('/search/:value', siteController.search);
router.get('/common', siteController.common);
router.get('/dashboard', siteController.dashboard);
router.get('/', siteController.index);

module.exports = router;