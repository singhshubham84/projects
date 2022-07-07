const express = require('express');
const router =express.Router();
const userController =require('../controllers/userController')
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
<<<<<<< remotes/origin/project-3-shubham
const bookController =require('../controllers/bookController')
=======
const bookController =require("../controllers/bookController")
>>>>>>> local
>>>>>>> Stashed changes
=======
const bookController =require('../controllers/bookController')
>>>>>>> c961e749e1da110e9ea87a7015622b2fd3596d5a



router.post("/register", userController.createUser)
router.post("/login", userController.userLogIn )

router.post("/books", bookController.createBook)

router.get("/login", userController.userLogIn)



module.exports = router;