const mongoose = require('mongoose')
const ObjectId = mongoose.type.Schema.ObjectId

const bookSchema = mongoose.Schema({

    title: {
        type:String,
        required: true,
        unique: true
    },
    excerpt: {
        type:String,
        required: true,
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: 'user'
    },
    ISBN: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
    },
    subcategory: [{
        type: String,
        required: true
    }],
    reviews: {
        type: Number,
        default: 0,
        //   comment: Holds number of reviews of this book
    },
    deletedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        required: true,
    }


}, { timestamps: true })

module.exports = mongoose.model('books', bookSchema)