
const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema({

    urlCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // default: shortid.generate
    },
    longUrl: {
        type: String,
        required: true,
        // valid url
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true
    }

}, { timestamps: true });

module.exports = mongoose.model('url', urlSchema) ;

