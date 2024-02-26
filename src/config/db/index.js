const mongoose = require('mongoose');

async function connect(url, callback) {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("connect successfully");
    } catch (err) {
        console.log(err);
    }
}
connect();

module.exports = mongoose;