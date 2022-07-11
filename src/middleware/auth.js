const jwt = require('jsonwebtoken')
const booksModel = require('../model/booksModel')
const userModel = require('../model/userModel')
const mongoose = require('mongoose')



const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

// const authToken = (token)=>{
//     let tokenValidate = jwt.verify(token,"project-3",(err,data)=>{
//         if(err) 
//         return null
//         else{
//             return data
//         }    
//     })
//     return tokenValidate
// }

const authentication = async function (req, res, next) {
    try {
        let token = (req.headers["x-api-key"])

        if (!token) {
            return res.status(400).send({ status: false, msg: "Token must be present", });
        }

        let decodedToken = jwt.verify(token, "functionUp")      // decoding token 
        // let decodedToken = jwt.verify(token,"functionUp",(err,data)=>{
        //     if(err) 
        //     return null
        //     else{
        //         return data
        //     }    
        // })
         
        if (!decodedToken) {
            return res.status(400).send({ status: false, msg: "Token is invalid" });
        }
        next()
    }

    catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }

}

const userAuthorization = async (req, res, next) => {
    try {

        let userId = req.body.userId

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }

        let token = (req.headers["x-api-key"])
        let decodedToken = jwt.verify(token, "functionUp")           // verifying the token 

        let tokenUserId = decodedToken.userId

        const isIdExist = await userModel.findOne({ _id: userId });

        if (!isIdExist) return res.status(404).send({ status: false, message: "User Id does not exist" })


        if (userId !== tokenUserId) return res.status(403).send({ status: false, message: "User not Authorised to create a new Book" })

        next();

    } catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }

}

const bookAuthorization = async function (req, res, next) {
    try {

        let bookId = req.params.bookId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is invalid" })
        }

        let token = (req.headers["x-api-key"])
        let decodedToken = jwt.verify(token, "functionUp")           // verifying the token 
        let tokenuserId = decodedToken.userId;
        if (bookId) {
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

module.exports.authentication = authentication
module.exports.bookAuthorization = bookAuthorization
module.exports.userAuthorization = userAuthorization
