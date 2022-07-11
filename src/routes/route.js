const express = require('express');
const router =express.Router();
const userController =require('../controllers/userController')
const bookController =require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const auth =require('../middleware/auth')


/*_____________________________--====> USER API <====----___________________________________*/
router.post("/register", userController.createUser) //To create a user

router.post("/login", userController.userLogIn) // For login 

/*____________________________---====> BOOK API <====----___________________________________*/

router.post("/books",auth.authentication,auth.userAuthorization, bookController.createBook) // To create a book 

router.get('/books', auth.authentication, bookController.getBook) // get the book data

router.get('/books/:bookId', auth.authentication, bookController.getBookById) // get the book data by its ID

router.put('/books/:bookId',auth.authentication,auth.bookAuthorization,bookController.bookUpdate) // update the book data

router.delete('/books/:bookId',auth.authentication,auth.bookAuthorization,bookController.delBookById)  //delete book data by its ID

/*_________________________----===> REVIEW API <====----_____________________________________ */

router.post('/books/:bookId/review', reviewController.createReview)

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)

router.delete("/books/:bookId/review/:reviewId", reviewController.deletedReview)





module.exports = router;