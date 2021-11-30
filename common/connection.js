const mongoose = require("mongoose");
global.ObjectId = mongoose.Types.ObjectId;
var config = require('../config/config')

module.exports.mongodb = async () => {
    await mongoose.connect(
        config.databaseSettings.MONGODB_URL,
        {
            useUnifiedTopology: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useCreateIndex: true,
        },
        (error, result) => {
            error ? console.error("Mongo", error) : console.log("Mongo Connected");
        }
    );
};
