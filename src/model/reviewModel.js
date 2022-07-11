const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        required: true,
        refs: 'Books'
    },
    reviewedBy: {
        type: String,
        trim:true,
        required: true,
        default: "Guest"
       
    },
    reviewedAt: {
        type: Date,
        required: "reviewedAt",
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    review: {
        type:String,
        trim:true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

})
module.exports=mongoose.model('Review',reviewSchema)