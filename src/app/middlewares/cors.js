const ALLOWED_ORIGINS = [
    process.env.CORS_ALLOW,
    process.env.CORS_ALLOW2,
    process.env.CORS_ALLOW3,
    process.env.CORS_ALLOW4,
    process.env.CORS_ALLOW5,
];

module.exports = function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    console.log(origin);
    const isOriginAllowed = ALLOWED_ORIGINS.includes(origin);
    console.log(isOriginAllowed);
    const theOrigin = (isOriginAllowed) ? origin : '*';
    res.header("Access-Control-Allow-Origin", theOrigin);
    res.header('Access-Control-Allow-Methods', (isOriginAllowed) ? 'GET,PUT,POST,DELETE,PATCH,OPTIONS' : '');
    res.header('Access-Control-Allow-Credentials', isOriginAllowed);
    res.header("Access-Control-Allow-Headers", isOriginAllowed ? "*" : '');

    next();
}