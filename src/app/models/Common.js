const mongoose = require('../../config/db');

const CommonSchema = new mongoose.Schema({
    header: {
        logoUrl: String,
        navs: Array
    },
    footer: {
        footerItems: Array,
        socialUrl: Array,
        Copyright: String
    },
    active: Boolean,
    lang: String
}, { timestamps: true });

module.exports = mongoose.model('Common', CommonSchema);