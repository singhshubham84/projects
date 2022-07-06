const userModel = require('../model/userModel')


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) {
        return false
    }
    //value given by user should not be undefined and null
    if (typeof value === 'string' && value.trim().length == 0) {
        return false
    }
    //value given by user should  be string and not with only space 
    return true

}
// function for title validation
const isValidTitle = function (title) {
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
}

const isValidRequestBody = function (request) {
    return (Object.keys(request).length > 0)
}

const nameRegex = /^[.a-zA-Z\s,-]+$/
//regex for name 

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
// regex for email validation
const mobileRegex = /^[0]?[6789]\d{9}$/
//10 didgit mobile number stating with any(6,7,8,9) and 0 if you want to use in mobile number 

const passwordregex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#@$%&? "])[a-zA-Z0-9!#@$%&?]{8,15}$/
//  One digit, one upper case , one lower case , its b/w 8 to 15

const createUser = async function (req, res) {
    try {
        let data = req.body

        let { title, name, phone, email, password, address } = data

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "Invalid request parameters. Please provide author details" })
        }
        //here checking the data come from request body should not be empty

        if (!isValid(title))
            return res.status(400).send({ status: false, message: "Title is required" })
        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: "Title should be among Mr, Mrs, Miss" })
        }
        //validating the title with above two function

        if (!isValid(name))
            return res.status(400).send({ status: false, message: "First name is required" })

        if (!(nameRegex.test(name))) {
            return res.status(400).send({ status: false, message: "please provide correct user name" })
        }
        //    validating the name with regex       

        if (!isValid(phone))
            return res.status(400).send({ status: false, message: "phone number is required" })
       
        if (!(mobileRegex.test(phone))) {
            return res.status(400).send({ status: false, message: "Please provide a valid mobile number, it should start 6-9.(you can also use STD code 0)" })
        } //    validating the phone with regex       
        const isUniquePhone = await userModel.findOne({ phone })
        if (isUniquePhone) return res.status(400).send({ status: false, message: "phone no already exists. Please provide another phone number" })

        if (!isValid(email))
            return res.status(400).send({ status: false, message: "E-mail is required" })
        // validating the email

        if (!(emailRegex.test(email))) {
            return res.status(400).send({ status: false, message: "E-mail should be a valid e-mail address" })
        }
        // validating the email with regex

        let isUniqueEmail = await userModel.findOne({ email: email })
        if (isUniqueEmail)
            return res.status(400).send({ status: false, message: "This e-mail address is already exist , Please enter valid E-mail address" })
        //checking the user email is correct or not 

        if (!isValid(password))
            return res.status(400).send({ status: false, message: "password is not exist" })
        // password is present or not

        if (!(passwordregex.test(password))) {
            return res.status(400).send({ status: false, message: "password should contain at least One digit, one upper case , one lower case , its b/w 8 to 15" })
        }
        //validating the password with regex

        let userCreated = await userModel.create(data)
        return res.status(201).send({ status: true, message: "user created successfully", data: userCreated })

    }
    catch (err) {
        return res.status(500).send({ message: "Error", error: err.message })
    }

}

// ==========loginuser=========================================================

const userLogIn = async function (req, res) {
    try {
      let userEmail = req.body.email;
      if (!userEmail) {
        return res
          .status(400)
          .send({ status: false, message: "email is required" });
      }
      if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(req.body.email)) {
        return res
          .status(400)
          .send({ status: false, data: "plz enter the valid Email" });
      }
      let userPassword = req.body.password;
      if (!userPassword) {
        return res
          .status(400)
          .send({ status: false, message: "passworrd is required" });
      }
      if (req.body.password.trim().length <= 6) {
        return res
          .status(400)
          .send({ status: false, data: "plz enter the valid Password" });
      }
      let isUser = await userModel.findOne({
        email: userEmail,
        password: userPassword,
      });
      if (!isUser) {
        return res
          .status(404)
          .send({ status: false, data: "No such author exists" });
      }
      let token = jwt.sign(
        {
          userId: isUser._id.toString(),
        },
        "functionUp",
        { expiresIn: "1200s" }
      );
      // res.setHeader("x-api-key",token)
      res.status(201).send({ status: true, data: { token: token } });
    } catch (err) {
      res.status(500).send({ status: false, data: err.message });
    }
  };
  
  module.exports.userLogIn = userLogIn;



module.exports.createUser = createUser