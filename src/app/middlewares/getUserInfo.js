const User = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports = function getUserInfo(req, res, next) {
    let temp = req.body.tokenUser;
    if (!temp) {
        next();
    } else {
        try {
            let userId = jwt.verify(temp, process.env.JWT);
            User.findById(userId)
                .then((user) => {
                    if (user) {
                        let { password, ...data } = user._doc;
                        if (req.data) {
                            req.data = {...req.data, currentUser: data }
                        } else {
                            req.data = { currentUser: data }
                        }
                        next();
                    } else {
                        console.error('không thấy');
                        next();
                    }
                })
                .catch(err => {
                    console.log(err)
                    next();
                });
        } catch (err) {
            next();
        }
    }
}