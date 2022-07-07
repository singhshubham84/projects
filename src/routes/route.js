const express = require('express');
const router =express.Router();
const userController =require('../controllers/userController')
<<<<<<< Updated upstream
=======
<<<<<<< remotes/origin/project-3-shubham
const bookController =require('../controllers/bookController')
=======
const bookController =require("../controllers/bookController")
>>>>>>> local
>>>>>>> Stashed changes



router.post("/register", userController.createUser)
router.post("/login", userController.userLogIn )








module.exports = router;