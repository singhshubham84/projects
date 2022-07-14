const bookModel = require('../model/booksModel')
const reviewsModel = require('../model/reviewModel')
const { isValid, isValidObjectId, isValidRequestBody,isValidDate } = require('../utility/validation')



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
            review,
            reviewedAt
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
        if (isBook.isDeleted==true) return res.status(404).send({ status: false, message: "Book already deleted, can't add review" })
        if (!isValid(reviewedAt)) {
            return res.status(400).send({ status: false, message: "reviewedAt is required" })
        }
        if (!(isValidDate(reviewedAt))) {
            return res.status(400).send({ status: false, message: "Date must be in the format YYYY-MM-DD" })
        }

        let saveData = {
            reviewedBy,
            rating,
            review,
            bookId,
            reviewedAt
        }

        const reviewData = await reviewsModel.create(saveData)

        // if new review created successfully
        if (reviewData) {
            // increment 1 and save book
            let increase = isBook.reviews + 1;
            isBook.reviews = increase
            await isBook.save(); //The save() method is asynchronous, so it returns a promise that you can await on.
        }
        let data = await bookModel.findById(bookId)

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

        const reviewArr = await reviewsModel.find({ bookId: data._id, isDeleted: false })
        obj.reviewsData = reviewArr;


        res.status(201).send({ status: true, data: obj })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
/**_______________________________UPDATE A REVIEW_______________________________________ */

const updateReview = async function (req, res) {

    try {
        const bookId = req.params.bookId
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId invalid" })

        const reviewId = req.params.reviewId
        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "ReviewId invalid" })

        const data = req.body

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Data is required" })

        const isBook = await bookModel.findById(bookId)

        if (!isBook) return res.status(404).send({ status: false, message: 'Book not found' })

        if (isBook.isDeleted==true) return res.status(404).send({ status: false, message: "Book already deleted, can't edit review" })

        const isReview = await reviewsModel.findById(reviewId)

        if (!isReview) return res.status(404).send({ status: false, message: 'Review not found' })

        if (isReview.bookId.toString() !== bookId) return res.status(404).send({ status: false, message: "ReviewId does not belong to particular book " })

        if (isReview.isDeleted==true) return res.status(404).send({ status: false, message: "Review already deleted" })

        let {
            review,
            rating,
            reviewedBy
        } = data
        if (Object.keys(data).indexOf("review") !== -1) {
            if (!isValid(review)) return res.status(400).send({ status: false, message: "Declared review is empty, You need to add some value" })
        }
        if (isValid(review)) {
            isReview.review = review
        }
        
        if (isValid(rating)) {
            if (typeof rating !== 'number') return res.status(400).send({ Status: false, message: "rating must be number only" })
            // Rating must be in 1 to 5
            if (rating < 1 || rating > 5) return res.status(400).send({ status: false, message: 'Rating must be in 1 to 5' })

            isReview.rating = rating
        }
        if (Object.keys(data).indexOf("reviewedBy") !== -1) {
            if (!isValid(reviewedBy)) return res.status(400).send({ status: false, message: "Declared reviewedBy is empty, You need to add some value" })
        }
        if (isValid(reviewedBy)) {
            isReview.reviewedBy = reviewedBy
        }

        await isReview.save()
        
        let bookData = await bookModel.findById(bookId)

        let obj = {
            _id: bookData._id,
            title: bookData.title,
            excerpt: bookData.excerpt,
            userId: bookData.userId,
            category: bookData.category,
            subcategory: bookData.subcategory,
            isDeleted: bookData.isDeleted,
            reviews: bookData.reviews,
            deletedAt: bookData.deletedAt,
            releasedAt: bookData.releasedAt,
            createdAt: bookData.createdAt,
            updatedAt: bookData.updatedAt
        }

        const reviewArr = await reviewsModel.find({ bookId: bookId, isDeleted: false }).select({ __v: 0, isDeleted: 0 })
        obj.reviewsData = reviewArr;

        res.status(200).send({ status: true, data: obj })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
/**_________________________________DELETE A REVIEW _________________________________________________________ */
const deletedReview = async function(req, res)  {
    try {
      
        const bookId = req.params.bookId
        if (!isValidObjectId(bookId)) return res.status(400).send({status: false, message: "BookId is invalid" })
       
        const reviewId = req.params.reviewId
        if (!isValidObjectId(reviewId)) return res.status(400).send({status: false, message: "ReviewId is invalid"})
       
        const isBook = await bookModel.findById(bookId)
       
        if (!isBook) return res.status(404).send({ status: false,message: 'Book not found'})

     
        if (isBook.isDeleted) return res.status(404).send({status: false,message: "Book already deleted " })
     
        const isReview = await reviewsModel.findById(reviewId)
       
        if (!isReview) return res.status(404).send({ status: false, message: 'Review not found'})
   
        if (isReview.bookId.toString() !== bookId) return res.status(404).send({status: false, message: "ReviewId does not belong to particular book "})
   
        if (isReview.isDeleted) return res.status(404).send({ status: false, message: "Review already deleted" })
     
        isReview.isDeleted = true
        await isReview.save()

     
        let dec = isBook.reviews - 1;
        isBook.reviews = dec
        await isBook.save();

        res.status(200).send({status: true, message: "Review deleted successfully and book doc updated",data:isReview})

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports.createReview = createReview
module.exports.updateReview = updateReview
module.exports.deletedReview = deletedReview
