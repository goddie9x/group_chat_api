module.exports = {
    multipleMongooseToObjects: mongooseArray => mongooseArray.map(mongooseItem => mongooseItem.toObject()),
    mongooseToObject: mongoose => mongoose.toObject(),
}