
const bookModel = require('../model/booksModel')
const reviewsModel = require('../model/reviewModel')
const { isValid, isValidObjectId, isValidRequestBody, } = require('../utility/validation')



const createReview = async function (req, res) {
    try {
        // get book id
        const bookId = req.params.bookId
        //check valid Book ID
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId invalid" })
        // get review data from body
        const revData = req.body
        if (!isValidRequestBody(revData)) return res.status(400).send({ status: false, message: 'body is required for create review!' })

        let {
            reviewedBy,
            rating,
            review
        } = revData

        // VALIDATION
        if (!isValid(reviewedBy)) { reviewedBy = "Guest" }

        if (!isValid(rating)) return res.status(400).send({ status: false, message: 'Rating is required!' })


        if (typeof rating !== 'number') return res.status(400).send({ Status: false, message: "rating must be number only" })   

        if (rating < 1 || rating > 5) return res.status(400).send({ status: false, message: 'Rating must be in 1 to 5' })
        // Rating must be in 1 to 5
        if (Object.keys(revData).indexOf("review") !== -1) {
            if (!isValid(review)) return res.status(400).send({ status: false, message: "Declared review is empty, You need to add some value" })
        }


        const isBook = await bookModel.findById(bookId)
        // check if exist or not
        if (!isBook) return res.status(404).send({ status: false, message: 'Book not found' })
        // check if book is deleted
        if (isBook.isDeleted) return res.status(404).send({ status: false, message: "Book already deleted, can't add review" })

        let saveData = {
            reviewedBy,
            rating,
            review,
            bookId,
            reviewedAt: new Date()
        }

        const reviewData = await reviewsModel.create(saveData)

        // if new review created successfully
        if (reviewData) {
            // increment 1 and save book
            let increase = isBook.reviews + 1;
            isBook.reviews = increase
            await isBook.save(); //The save() method is asynchronous, so it returns a promise that you can await on.
        }
        let data=await bookModel.findById(bookId)

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
       
        const reviewArr = await reviewsModel.find({ bookId: data._id, isDeleted: false }).select({ __v: 0, isDeleted: 0 })
        obj.reviewsData = reviewArr;
    

        res.status(201).send({ status: true, data : obj })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createReview = createReview