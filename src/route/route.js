const express = require('express');
const router = express.Router();
const Controller = require('../controllers/userController')

router.post("/register", Controller.createUser)
router.post("/login",Controller.userLogin)



module.exports = router;