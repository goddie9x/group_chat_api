const User = require('../models/User');
const Image = require('../models/Image');
const Dashboard = require('../models/Dashboard');
const { multipleMongooseToObjects, mongooseToObject } = require('../../utils/mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const ITEM_PER_PAGE = 8;
const SALT_ROUNDS = 10;
const PRE_CLASSMATE_STRING = 'UHC';
const startSendMail = require('../../utils/sendAmail');
class UserController {
    index(req, res) {
        const dataDashBoardUpdate = {
            $inc: { amountConnectPerMonth: 1 },
        };
        dataDashBoardUpdate.$inc[`amountConnectAnalyticsMonthByWeek.${currentWeek}`] = 1;
        Dashboard.findOneAndUpdate({}, dataDashBoardUpdate)
            .then(() => {
                res.json(req.data);
            })
            .catch(err => {
                console.log(err);
                res.json(req.data);
            });
    }
    register(req, res) {
        const account = req.body.account;
        const password = req.body.password;
        const email = req.body.email;
        if (!email) {
            res.status(403).json({ message: 'email must not be empty' });
            return;
        }
        const isClassmate = account.slice(0, 3) == PRE_CLASSMATE_STRING;
        const checkAccountExit = User.findOne({
            account: account
        });
        const checkEmailExit = User.findOne({
            email: email
        });
        Promise.all([checkAccountExit, checkEmailExit])
            .then(([accountExit, emailExit]) => {
                if (accountExit) {
                    res.status(401).json({ message: 'account existed' });
                    return;
                }
                if (emailExit) {
                    res.status(402).json({ message: 'email existed' });
                    return;
                }
                try {
                    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
                    const passwordEncrypted = bcrypt.hashSync(password, salt);
                    if (isClassmate) {
                        User.create({ account, password: passwordEncrypted, email: [email], role: 2 })
                            .then((user) => {
                                let token = jwt.sign({ _id: user._id }, process.env.JWT, { expiresIn: '720h' });
                                Dashboard.findOneAndUpdate({}, { $inc: { amountUser: 1 } })
                                    .then(() => {
                                        res.send({ token });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.send({ token });
                                    });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).send('Create account failed');
                            });
                    } else {
                        User.create({ account, password: passwordEncrypted, email: [email] })
                            .then((user) => {
                                let token = jwt.sign({ _id: user._id }, process.env.JWT, { expiresIn: '720h' });
                                Dashboard.findOneAndUpdate({}, { $inc: { amountUser: 1 } })
                                    .then(() => {
                                        res.send({ token });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.send({ token });
                                    });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).send('Create account failed');
                            });
                    }
                } catch (err) {
                    console.log(err);
                    res.status(500).send('Create account failed');
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Create account failed');
            });
    }
    login(req, res) {
        const { account, password } = req.body;
        const checkDeleted = User.findOneDeleted({ account: account });
        const checkAccount = User.findOne({ account: account });
        Promise.all([checkDeleted, checkAccount])
            .then(([deleted, account]) => {
                if (deleted) {
                    res.status(403).json({ message: 'Account is baned' });
                } else {
                    if (account) {
                        const isMatch = bcrypt.compareSync(password, account.password);
                        if (isMatch) {
                            let token = jwt.sign({ _id: account._id }, process.env.JWT, { expiresIn: '720h' });
                            res.send({ token });
                        } else {
                            res.status(402).json({ message: 'Wrong password' });
                        }
                    } else {
                        res.status(404).json({ message: 'Account not found' });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: 'Login failed' });
            });
    }
    profile(req, res) {
        let accountID = req.params.id;
        if (accountID.match(/^[0-9a-fA-F]{24}$/)) {
            User.findOneWithDeleted({ _id: accountID })
                .then(user => {
                    let userInfoRaw = mongooseToObject(user);
                    delete userInfoRaw.password;
                    delete userInfoRaw.createdAt;
                    delete userInfoRaw.updatedAt;
                    let { account, ...userInfo } = userInfoRaw;
                    userInfo.account = account.replace('UHC', '');
                    res.json(userInfo);
                    return;
                })
                .catch(function(err) {
                    res.status(404).json('404');
                    return;
                });
        } else {
            console.log('accountID is not correct');
            res.status(500).json({ message: 'error' });
        }
    }
    updateInfo(req, res) {
        let currentUserId = req.data.currentUser._id;
        let userID = req.params.id;
        if (userID.match(/^[0-9a-fA-F]{24}$/)) {
            if (currentUserId == userID) {
                let { currentUser, role, account, ...userInfo } = req.body;
                if (userInfo.image) {
                    User.updateOne({ _id: userID }, { $set: { image: userInfo.image } })
                        .then(() => {
                            res.status(200).json({ message: 'Update success' });
                            return;
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: err });
                            return;
                        });
                } else {
                    User.findOne({
                            email: {
                                $in: userInfo.email,
                            }
                        })
                        .then((data) => {
                            if (data && data.length > 0) {
                                res.status(500).json({ message: 'Email existed' });
                                return;
                            } else {
                                User.updateOne({ _id: userID }, { $set: userInfo })
                                    .then(() => {
                                        res.status(200).json({ message: 'Update success' });
                                        return;
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        res.status(500).json({ message: 'Update failed' });
                                        return;
                                    });
                            }
                        })
                }
            } else {
                res.status(401).json('not permition');
                return;
            }
        } else {
            console.log('accountID is not correct');
            res.status(500).json({ message: 'error' });
        }
    }
    updateAvartar(req, res) {
        let currentUserId = req.data.currentUser._id;
        let userID = req.params.id;
        const imageUrl = (req.file) ? (req.file.path) : (process.env.MAIN_CLIENT_SITE + '/images/default.png');
        const uploadImage = Image.create({
            url: imageUrl,
            public_id: req.file ? req.file.public_id : '',
        });

        if (currentUserId == userID) {
            const updateAvartar = User.updateOne({ _id: userID }, { $set: { image: imageUrl } })
            Promise.all([uploadImage, updateAvartar])
                .then((data) => {
                    res.status(200).json({ message: 'Update success' });
                    return;
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ message: 'Update failed' });
                    return;
                });
        } else {
            console.log('not permition');
            res.status(401).json('not permition');
        }
    }
    bannedUsers(req, res) {
        const currentUser = req.data.currentUser;
        if (currentUser.role < 2) {
            let query = {};
            if (currentUser.role == 1) {
                query = { role: { $gte: 1 } };
            }
            const page = +req.query.page;
            const perPage = req.query.perPage || ITEM_PER_PAGE;
            if (page < 1) {
                page = 1;
            }
            let pageSkip = (page - 1) * perPage;
            const userBanned = User.findDeleted(query)
                .sort({ createdAt: -1 })
                .skip(pageSkip)
                .limit(perPage);
            const userNotBannedCount = User.count(query);
            const userBannedCount = User.countDeleted(query);
            Promise.all([userBanned, userNotBannedCount, userBannedCount])
                .then(([userBanned, countOpositeStored, countCurrentStored]) => {
                    const users = multipleMongooseToObjects(userBanned);
                    res.send({ users, countOpositeStored, countCurrentStored });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json('500');
                });
        } else {
            res.status(500).json('500');
        }
    }
    banUser(req, res) {
        const userID = req.params.id;
        const currentUser = req.data.currentUser;
        if (currentUser.role < 2) {
            User.delete({ _id: userID, role: { $gte: currentUser.role } })
                .then(() => {
                    res.status(200).json({ message: 'Band user success' });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ message: 'Band user failed' });
                });
        } else {
            res.status(500).json('500');
        }
    }
    unbanUser(req, res) {
        const userID = req.params.id;
        const currentUser = req.data.currentUser;
        if (currentUser.role < 2) {
            User.restore({ _id: userID, role: { $gte: currentUser.role } })
                .then(() => {
                    res.status(200).json({ message: 'Unband user success' });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ message: 'Unband user failed' });
                });
        } else {
            res.status(500).json('500');
        }
    }
    manager(req, res) {
        const currentUser = req.data.currentUser;
        if (currentUser.role < 2) {
            let query = {};
            if (currentUser.role == 1) {
                query = { role: { $gte: 1 } };
            }
            let page = req.query.page;
            const perPage = +req.query.perPage || ITEM_PER_PAGE;
            if (page < 1) {
                page = 1;
            }
            let pageSkip = (page - 1) * perPage;
            const userBannedCount = User.countDeleted(query);
            const userNotBanned = User.count(query);
            const userFound = User.find(query)
                .sort({ updatedAt: 'desc' })
                .limit(perPage)
                .skip(pageSkip);
            Promise.all([userBannedCount, userNotBanned, userFound])
                .then(([countOpositeStored, countCurrentStored, userFound]) => {
                    const users = multipleMongooseToObjects(userFound);
                    res.send({ users, countOpositeStored, countCurrentStored });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json('500');
                });
        } else {
            res.status(500).json('500');
        }
    }
    restore(req, res) {
        const emailCheck = req.body.email;
        console.log(emailCheck);
        User.find({ email: { $elemMatch: { $eq: emailCheck } } })
            .then(user => {
                if (user.length > 0) {
                    const tokenRestore = jwt.sign({ _id: user[0]._id }, process.env.JWT, { expiresIn: '10m' });
                    startSendMail({
                        to: emailCheck,
                        subject: 'Khôi phục tài khoản',
                        html: `<div style="text-align: center;color:#fff;background-color:#0a1929;padding:16px;border-radius:10px;"><h2>Bạn đã yêu cầu khôi phục tài khoản tại trang TE11</h2>
                            <p>Bấm vào <a href="${process.env.MAIN_CLIENT_SITE + '/user/reset-password/' + tokenRestore}">link này</a> để khôi phục mật khẩu</p>
                            <p>Lưu ý: Link chỉ có hiệu lực trong vòng 10p</p><div>`,
                    }, (err, info) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json('500');
                            return;
                        } else {
                            res.json('success');
                            return;
                        }
                    });
                } else {
                    res.status(404).json('email not found');
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(404).send('Account not found');
            })
    }
    editRole(req, res) {
        const userID = req.params.id;
        const currentUser = req.data.currentUser;
        const currenUserRole = currentUser ? currentUser.role : 4;
        const role = req.body.role;

        if (currenUserRole < 2 && role > currenUserRole) {
            User.findOne({ _id: userID, role: { $gte: currenUserRole } })
                .then(user => {
                    if (user) {
                        user.role = role;
                        user.save()
                            .then(() => {
                                res.status(200).json({ message: 'Edit role success' });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({ message: 'Edit role failed' });
                            });
                    } else {
                        res.status(404).json('404');
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json('500');
                });
        } else {
            res.status(500).json('500');
        }
    }
    resetPassword(req, res) {
        const tokenRestore = req.params.tokenRestore;
        const newPassword = req.body.password;
        try {
            const salt = bcrypt.genSaltSync(SALT_ROUNDS);
            const passwordEncrypted = bcrypt.hashSync(newPassword, salt);
            const userId = jwt.verify(tokenRestore, process.env.JWT);
            const updatePasswordStatus = User.updateOne({ _id: userId }, { $set: { password: passwordEncrypted } });
            const userInfo = User.findOne({ _id: userId });

            Promise.all([updatePasswordStatus, userInfo])
                .then(([updatePasswordStatus, userInfo]) => {
                    if (updatePasswordStatus.modifiedCount > 0) {
                        res.json({ account: userInfo.account });
                        return;
                    } else {
                        res.status(404).json('404');
                        return;
                    }
                });
        } catch (err) {
            console.log(err);
            res.status(500).send('token expired or invalid');
        }
    }
    handleMultiAction(req, res) {
        const method = req.body.method;
        const userIds = req.body.ids;
        const currentUser = req.data.currentUser;
        const currenUserRole = currentUser ? currentUser.role : 4;

        if (currentUser && currenUserRole < 2) {
            switch (method) {
                case 'delete':
                    {
                        User.delete({ '_id': userIds, role: { $gte: currenUserRole } })
                        .then(
                            function(done) {
                                res.status(200).json('done');
                            }
                        )
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json('error');
                        });
                        break;
                    }
                case 'restore':
                    {
                        User.restore({ '_id': userIds, role: { $gte: currenUserRole } })
                        .then(
                            function(done) {
                                res.status(200).json('done');
                            }
                        )
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json('error');
                        });
                        break;
                    }
                case 'forceDelete':
                    {
                        User.deleteMany({ '_id': userIds, role: { $gte: currenUserRole } })
                        .then(
                            function(data) {
                                const amount = data.deletedCount;
                                Dashboard.findOneAndUpdate({}, { $inc: { amountUser: -amount } })
                                    .then(() => {
                                        res.status(200).json('done');
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        res.status(200).json('done');
                                    });
                            }
                        )
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json('error');
                        });
                        break;
                    }
                case 'editRole':
                    {
                        const role = req.body.role;
                        if (role > currenUserRole) {
                            User.updateMany({ '_id': userIds, role: { $gte: currenUserRole } }, { $set: { role: req.body.role } })
                                .then(
                                    function(done) {
                                        res.status(200).json('done');
                                    }
                                )
                                .catch((err) => {
                                    console.log(err);
                                    res.status(500).json('error');
                                });
                        } else {
                            res.status(500).json('error');
                        }
                        break;
                    }
            }
        } else {
            res.status(500).json('500');
        }
    }
    forceDelete(req, res) {
        const userID = req.params.id;
        const currentUser = req.data.currentUser;
        if (currenUserRole < 2) {
            User.deleteOne({ _id: userID, role: { $gte: currentUser.role } })
                .then(() => {
                    Dashboard.findOneAndUpdate({}, { $inc: { amountUser: -1 } })
                        .then(() => {
                            res.status(200).json({ message: 'Delete user success' });
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(200).json({ message: 'Delete user success' });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ message: 'Delete user failed' });
                });
        } else {
            res.status(500).json('500');
        }
    }
}

module.exports = new UserController;