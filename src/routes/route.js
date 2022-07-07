const express = require('express');
const router =express.Router();
const userController =require('../controllers/userController')
const bookController =require('../controllers/bookController')
const auth =require('../middleware/auth')



router.post("/register", userController.createUser)

router.post("/books",auth.authentication, bookController.createBook)

router.post("/login", userController.userLogIn)

router.get('/books', auth.authentication, bookController.getBook)

router.get('/books/:bookId',auth.authentication,bookController.getBookById)

router.put('/books/:bookId',auth.authentication,auth.authorization,bookController.bookUpdate)




module.exports=router