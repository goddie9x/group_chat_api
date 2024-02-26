const mongoose = require('../../config/db');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const User = new Schema({
    account: { type: String, maxLength: 255, required: true, unique: true },
    password: { type: String, maxLength: 255, required: true },
    gender: String,
    dateOfBirth: { type: String },
    status: { type: Boolean, default: false },
    //0: admin, 1: mod, 2: classmate, 3: normal user
    role: { type: Number, default: 3 },
    image: { type: String, maxLength: 255 },
    fullName: { type: String, maxLength: 255 },
    email: [{ type: String, maxLength: 255 }],
    phone: [{ type: String, maxLength: 255 }],
    address: { type: String, maxLength: 255 },
    quote: { type: String, maxLength: 255 },
    subDescription: { type: String, maxLength: 255 },
    description: String,
}, { timestamps: true });

User.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('User', User);