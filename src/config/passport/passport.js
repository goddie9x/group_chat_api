// config/passport.js
// load modules
const passport = require('passport');
// load user model
const User = require('../../app/models/User');
const LocalStrategy = require('passport-local').Strategy;
// passport session setup
// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
})
// used to deserialize the user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
})
// local sign-up
passport.use('local.signup', new LocalStrategy({
    // mặc định local strategy sử dụng username và password
    //chúng ta có thể cấu hình lại
    usernameField: 'account',
    passwordField: 'password',
    passReqToCallback: true // cho phép chúng ta gửi reqest lại hàm callback
}, function (req, account, password, done) {
    // Tìm một user theo account
    // chúng ta kiểm tra xem user đã tồn tại hay không
    User.findOne({ 'account': account }, function (err, user) {
        if (err) { return done(err); }
        if (user) {
            return done(null, false, { message: 'Account has already been created.' });
        }
        // Nếu chưa user nào sử dụng account này
        // tạo mới user
        var newUser = new User();
        // lưu thông tin cho tài khoản local
        newUser.account = account;
        newUser.password =
            newUser.encryptPassword(password);
        // lưu user
        newUser.save(function (err, result) {
            if (err) {
                return done(err)
            }
            return done(null, newUser);
        })
    });
}
));

module.exports =passport;