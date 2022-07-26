const express = require('express');
const router = express.Router();
const Controller = require('../controllers/userController')
const auth = require('../middleware/auth')

router.post("/register", Controller.createUser)

router.post("/login",Controller.userLogin)

router.get("/abc",auth.userAuthentication, Controller.getUserDetails)



module.exports = router;