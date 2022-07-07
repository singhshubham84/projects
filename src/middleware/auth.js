const jwt = require('jsonwebtoken')
const booksModel = require('../model/booksModel')
const mongoose = require('mongoose')


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


const authentication = async function (req, res, next) {
    try {
        let token = (req.headers["x-api-key"])

        if (!token) {
            return res.status(400).send({ status: false, msg: "Token must be present", });
        }
        let decodedToken = jwt.verify(token, "functionUp")      // decoding token 

        if (!decodedToken) {
            return res.status(400).send({ status: false, msg: "Token is invalid" });
        }
        next()
    }

    catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }

}
const authorization = async function (req, res, next) {
    try {

        let bookId = req.params.bookId
       
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is invalid" })
        }

        let token = (req.headers["x-api-key"])
        let decodedToken = jwt.verify(token, "functionUp")           // verifying the token 
        let tokenuserId = decodedToken.userId;
        if(bookId){
            let data = await booksModel.findOne({ _id: bookId, userId: tokenuserId })
    
            if (data === null) {
                return res.status(403).send({ status: false, msg: "you are not authorize" });
            
            }
        }
        next()

    }

    catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }

}

module.exports.authentication=authentication
module.exports.authorization=authorization
