module.exports = function checkAdminLoginMiddleware(req, res, next) {
    let user = req.data.currentUser;
    if (user.role == 0) {
        next();
    } else {
        res.status(500).json('notPermission');
    }
}