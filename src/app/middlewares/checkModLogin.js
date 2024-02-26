module.exports = function checkModLoginMiddleware(req, res, next) {
    let user = req.data.currentUser;
    if (user.role <= 1) {
        next();
    } else {
        res.status(500).json('notPermission');
    }
}