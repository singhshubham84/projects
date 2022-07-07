const bookModel = require('../model/booksModel')
const userModel = require('../model/userModel')
const mongoose = require('mongoose')
const moment = require('moment')


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
        const isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
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

const getBook = async function (req, res) {
    try {
        const data = req.query;

        let obj = { isDeleted: false }

        if (!isValidRequestBody(data)) return res.status(400).send({
            status: false, message: "Invalid request parameters. Please provide book details"
        })

        let { userId, category, subcategory } = data;

        if (userId) {
            if (!isValidObjectId(userId)) {
                return res.status(400).send({ status: false, msg: "userId is not valid author id please check it" })
            }
        }

        if (isValid(userId)) {
            let user = await bookModel.find({ userId: userId });
            if (user.length == 0) {
                res.status(400).send({ status: false, msg: "no data found with this user id " })
                return;
            }
            obj.userId = userId
        }

        if (isValid(category)) {
            let cat = await bookModel.find({ category: category });
            if (cat.length == 0) {
                res.status(400).send({ status: false, msg: "category is not matching with any blog category" })
                return;
            }
            obj.category = category
        }


        if (isValid(subcategory)) {
            let subcat = await bookModel.find({ subcategory: subcategory });
            if (subcat.length == 0) {
                res.status(400).send({ status: false, msg: "subcategory is not matching with any one of blog subcategory" })
                return;
            }
            obj.subcategory = subcategory
        }
        let findQuery = await bookModel.find(obj).select({ title: 1, category: 1, excerpt: 1, userId: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })
        if (findQuery.length == 0) {
            return res.status(404).send({ status: false, message: "No such book found" })
        }
        res.status(200).send({ status: true, message: 'Books list', data: findQuery })

    }
    catch (err) { return res.status(500).send({ message: "Error", error: err.message }) }
}
const getBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId invalid" })
        // checking book present in db
        const data = await bookModel.findOne({ _id: bookId }).catch(e => null)

        if (!data) return res.status(404).send({ status: false, message: "Book does not exist" })

        if (data.isDeleted) return res.status(404).send({
            status: false, message: "Book already deleted"
        })

        let obj = {
            _id: data._id,
            title: data.title,
            excerpt: data.excerpt,
            userId: data.userId,
            category: data.category,
            subcategory: data.subcategory,
            isDeleted: data.isDeleted,
            reviews: data.reviews,
            deletedAt: data.deletedAt,
            releasedAt: data.releasedAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt

        }

        // we have to add review also//-----------------------------------

        return res.status(200).send({ status: true, message: "Book List", data: obj })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const bookUpdate = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let updateData = req.body
        // let userId = req.decodeToken.userId
        if (!isValidRequestBody(updateData)) return res.status(400).send({
            status: false, message: "Invalid request parameters. Please provide book details"
        })

        let { title, excerpt, ISBN, releasedAt } = updateData
        //check valid book id
        let validBook = await bookModel.findOne({ _id: bookId })

        if (!validBook) return res.status(404).send({ status: false, message: "Book not found" })

        if (validBook.isDeleted) { return res.status(404).send({ status: false, message: "Book is already Deleted" }) }
        if (isValid(excerpt)) { validBook.excerpt = excerpt; }

        if (isValid(title)) {
            let checktitle = await bookModel.findOne({ title: title })
            // console.log(checktitle)
            if (checktitle) {
                return res.status(400).send({ status: false, message: "Title is already exits plz enter a new title" })
            } else {
                validBook.title = title
            }
        }
        if (isValid(ISBN)) {
            let checkISBN = await bookModel.findOne({ ISBN })
            if (checkISBN) {
                return res.status(400).send({ status: false, message: "ISBN is already exits plz enter a new ISBN" })
            } else {
                validBook.ISBN = ISBN
            }
        }
        
        validBook.save();

        res.status(200).send({ status: true, message: "Update succesful", data: validBook })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
}



module.exports.createBook = createBook
module.exports.getBook = getBook
module.exports.getBookById = getBookById
module.exports.bookUpdate = bookUpdate