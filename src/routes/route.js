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

router.delete('/books/:bookId', auth.authentication, auth.bookAuthorization, bookController.delBookById)  //delete book data by its ID

/*_________________________----===> REVIEW API <====----_____________________________________ */

router.post('/books/:bookId/review', reviewController.createReview) // create review for a book

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)  // update a review

router.delete("/books/:bookId/review/:reviewId", reviewController.deletedReview) // delete a review






// validation of url
router.all('/', (req, res)=>res.status(400).send({status:false,message:"invaild request 1"}));
router.all('/:y/', (req, res)=>res.status(400).send({status:false,message:"invaild request2"}));
router.all('/:y/:x', (req, res)=>res.status(400).send({status:false,message:"invaild request3"}));


module.exports = router;