const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const aws_s3 = require('../validator/aws-s3')
const { isValid, isValidObjectId,isValidRequestBody ,isValidEmail,isValidName,isValidPassword,isValidPincode,isValidPhone,uploadFile } = require('../validator/validator')

const createUser = async function (req, res) {
    try {
      let files=req.files
      let user = req.body;
      let userCreate = await userModel.create(user);
  
      res.status(201).send({status:true, message:"user Successfully created", data: userCreate });
      
    } catch (err) {
      res.status(500).send({ msg: err.message });
    }
  };
  const userLogin = async function (req, res) {

    try {

        const loginDetails = req.body;

        const { email, password } = loginDetails;

        if (!isValidRequestBody(loginDetails)) {
            return res.status(400).send({ status: false, message: 'Please provide login details' })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email-Id is required' })
        }
        if(!isValidEmail(email)){
          return res.status(400).send({ status: false, message: 'provide valid email id' })
        }


        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        if(!isValidPassword(password)){
          return res.status(400).send({ status: false, message: 'Provide valid password its should contain atleast  one-lowercase, one uppercase,one numeric ' })
        }

        const userData = await userModel.findOne({ email });

        if (!userData) {
            return res.status(401).send({ status: false, message: `Login failed Email-Id is incorrect.` });
        }

        const checkPassword = await bcrypt.compare(password, userData.password)

        if (!checkPassword) return res.status(401).send({ status: false, message: `Login failed password is incorrect.` });
        
        let userId=userData._id
        const token = jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000)  +  24 * 60 * 60
        }, 'ProjectNo-5')

        return res.status(200).send({ status: true, message: "Login Successful", data: {Token:token} });

    } catch (err) {

        return res.status(500).send({ status: false, error: err.message });

    }
}
const getUserDetails = async function (req, res) {

  try {

      const userId = req.params.userId
      const userIdFromToken = req.userId


      if (!isValidObjectId(userId)) {
          return res.status(400).send({ status: false, message: "Invalid userId" })
      }

      const findUserDetails = await userModel.findById(userId)

      if (!findUserDetails) {
          return res.status(404).send({ status: false, message: "User Not Found" })
      }

      if (findUserDetails._id.toString() != userIdFromToken) {
          return res.status(403).send({ status: false, message: "You Are Not Authorized" });
      }

      return res.status(200).send({ status: true, message: "Profile Fetched Successfully", data: findUserDetails })

  } catch (err) {

      return res.status(500).send({ status: false, error: err.message })

  }
}


  module.exports.createUser = createUser
  module.exports.userLogin = userLogin
  module.exports.getUserDetails=getUserDetails
