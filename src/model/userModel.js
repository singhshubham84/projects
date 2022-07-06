const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    title: {
        type: String,
        trim: true,
        required: true,
        enum: ['Mr', 'Mrs', 'Miss']
    },
    name: {
        type: String,
        trim: true,
        required:true,
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        required:true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required:true,
        
    },
    address: {
        street: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        pincode: {
            type: String,
            trim: true,
        }
    }


}, { timestamps: true });

module.exports =mongoose.model('user',userSchema)