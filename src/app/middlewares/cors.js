const ALLOWED_ORIGINS = [
    process.env.CORS_ALLOW,
    process.env.CORS_ALLOW2,
    process.env.CORS_ALLOW3,
    process.env.CORS_ALLOW4,
    process.env.CORS_ALLOW5,
];

module.exports = function corsMiddleware(req, res, next) {
    let origin = req.headers.origin;
    let isOriginAllowed = ALLOWED_ORIGINS.includes(origin);
    let theOrigin = (isOriginAllowed) ? origin : '*';
    res.header("Access-Control-Allow-Origin", theOrigin);
    res.header('Access-Control-Allow-Methods', (isOriginAllowed) ? 'GET,PUT,POST,DELETE,PATCH,OPTIONS' : '');
    res.header('Access-Control-Allow-Credentials', isOriginAllowed);
    res.header("Access-Control-Allow-Headers", isOriginAllowed ? "Authorization, Origin, X-Requested-With, Content-Type, X-Auth-Token, Accept" : '');
    next();
}