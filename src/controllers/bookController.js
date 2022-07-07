const bookModel = require('../model/booksModel')
const userModel = require('../model/userModel')
const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) {
        return false
    }
    //value given by user should not be undefined and null
    if (typeof value === 'string' && value.trim().length == 0) {
        return false
    }
    //value given by user should  be string and not with only space 
    return true

}

const isValidRequestBody = function (request) {
    return (Object.keys(request).length > 0)
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// const reviewRegex = /^[0-5]$/ // select b/w 0 to 5
const ISBNRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/

const createBook = async (req, res) => {
    try {
        const data = req.body;

        if (!isValidRequestBody(data)) return res.status(400).send({
            status: false, message: "Invalid request parameters. Please provide book details"
        })

        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data;
        if (!isValid(title))
            return res.status(400).send({ status: false, message: "Title is required" })

        const isUniqueTitle = await bookModel.findOne({ title })
        if (isUniqueTitle) {
            return res.status(400).send({ status: false, message: "Title is already present " })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "excerpt is required" })
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is required" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }

        const isUniqueUserId = await userModel.findOne({ userId })
        if (isUniqueUserId.length == 0) {
            return res.status(400).send({ status: false, message: "please provide valid userId" })
        }
        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN is required" })
        }
        if (!(ISBNRegex.test(ISBN))) {
            return res.status(400).send({ status: false, message: "please provide correct ISBN" })
        }
        const isUniqueISBN = await bookModel.findOne({ISBN: ISBN })
        console.log(isUniqueISBN)
        if (isUniqueISBN) {
            return res.status(400).send({ status: false, message: "please provide diffrent ISBN" })

        }
        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "category is required" })
        }
        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "subcategory is required" })
        }


        const bookCreated = await bookModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: bookCreated })

    }
    catch (err) { return res.status(500).send({ message: "Error", error: err.message }) }
}

// ===============================================================================================

const deleteBooksbyId = async function (req, res) {
    try {
      const bookId = req.params.bookId
      console.log(bookId)
      if (!bookId) return res.status(400).send({ status: false, msg: "BookId should be present in params" })
      let check = await bookModel.findOne({ _id: bookId,isDeleted:false })
      
      if (!check) return res.status(404).send({ status: false, msg: "no such book exist" })
     
        let deleteBook = await bookModel.findOneAndUpdate({ _id: bookId,isDeleted:false}, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true }) // we can change new Date() to moment().format()
        if (!deleteBook) return res.status(404).send({ status: false, msg: "no such book exist" })
     
        res.status(200).send({ status: true, msg: "book is deleted successfully" })
  
    }
    catch (err) {
      console.log(err)
      res.status(500).send({ status: false, msg: "error", err: err.message })
    }
  }

module.exports.createBook = createBook
module.exports.deleteBooksbyId  = deleteBooksbyId ;
