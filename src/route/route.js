const express = require('express');
const router = express.Router();
const Controller = require('../controllers/userController')
const auth = require('../middleware/auth')

/*_____________________-----===> API FOR USER <====-----______________________________*/ 

router.post("/register", Controller.createUser)

router.post("/login",Controller.userLogin)

router.get('/user/:userId/profile',auth.userAuthentication, Controller.getUserDetails)

router.put('/user/:userId/profile',auth.userAuthentication, Controller.updateUserDetails)



module.exports = router;