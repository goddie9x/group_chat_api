const User = require('../models/User');
const Common = require('../models/Common');
const Dashboard = require('../models/Dashboard');
const Image = require('../models/Image');
const { multipleMongooseToObjects } = require('../../utils/mongoose');
const { destroySingleCloudinary } = require('../../config/cloudinary/cloudinary.config');
class SiteController {
    index(req, res) {
        User.find({ account: { $regex: 'UHC.' } })
            .then((UsersRaw) => {
                let listUser = multipleMongooseToObjects(UsersRaw);
                const users = listUser.map((User) => {
                    let { account, fullName, quote, ...user } = User;
                    account = account.replace('UHC', '');
                    return { account, fullName, quote };
                });
                res.send({ users });
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error');
            });
    }
    common(req, res) {
        Common.findOne({ active: true })
            .then(data => {
                res.send({ data });
            })
    }
    search(req, res) {
        const search = req.params.value;
        const regex = '.*' + search + '.*';
        User.find({ $or: [{ account: { $regex: regex } }, { fullName: { $regex: regex } }] })
        .then(users => {
                let result = [];
                const usersResult = users.map((user) => {
                    const url = '/user/profile/' + user._id.toString();
                    const value = user.fullName || user.account;
                    return {
                        url,
                        value,
                        type: 'user'
                    }
                });
                res.send({ usersResult });
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error');
            });
    }
    images(req, res) {
        let page = req.query.page || 1;
        if (page < 1) page = 1;
        const perPage = req.query.perPage || 12;
        const skip = (page - 1) * perPage;
        const imagesFind = Image.find({})
            .sort({ updatedAt: -1 })
            .limit(perPage)
            .skip(skip);
        const imagesCount = Image.countDocuments();
        Promise.all([imagesFind, imagesCount])
            .then(([rawImages, count]) => {
                let images = rawImages.map((image) => {
                    let { _id, url, ...imageObj } = image;
                    _id = _id.toString();
                    return { url, _id };
                });
                const totalPage = Math.ceil(count / perPage);
                res.json({ images, totalPage: totalPage });
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error');
            });
    }
    cloudinaryDelete(req, res) {
        let image = req.params.image;
        if (image.match(/^[0-9a-fA-F]{24}$/)) {
            Image.findOneAndDelete({ _id: image })
                .then(() => {
                    destroySingleCloudinary(image, function(error, result) {
                        if (result) {
                            res.status(200).send(result);
                        } else {
                            res.status(500).send('error');
                        }
                    });
                })
                .catch(error => {
                    console.log(error);
                    res.status(404).send('error');
                });
        } else {
            console.log('invalid id');
            res.status(404).send('error');
        }
    }
    cloudinary(req, res) {
        if (!req.file) {
            next(new Error('No file uploaded!'));
            return;
        }
        //type 1: ckeditor, 2: image upload
        let url = req.file.path;
        let msg = 'Upload successfully';
        let funcNum = req.query.CKEditorFuncNum;
        Image.create({
                url: url,
                public_id: req.file.public_id
            })
            .then(data => {
                if (funcNum != undefined) {
                    res.status(201).send("<script>window.parent.CKEDITOR.tools.callFunction('" +
                        funcNum + "','" + url + "','" + msg + "');</script>");
                } else {
                    res.status(201).json(url);
                }
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error');
            });
    }
    dashboard(req, res) {
        Dashboard.findOne({})
            .then(data => {
                res.send(data);
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('error');
            });
    }
}
module.exports = new SiteController;