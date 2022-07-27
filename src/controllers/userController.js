const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { isValid, isValidObjectId, isValidRequestBody, isValidEmail, isValidName, isValidPassword, isValidPincode, isValidPhone,isValidCity, uploadFile } = require('../validator/validator')


// const body = (ele) => {
//     if (Object.keys(ele).length) return;
//     return `Please send some valid data in request body`;
// };

// const check = (ele) => {
//     if (ele == undefined) { return `is missing` }
//     if (typeof ele != "string") { return `should must be a string` }
//     // ele = ele.trim();
//     if (!ele.length) { return `isn't valid` }
//     if (ele.match("  ")) return `can't have more than one consecutive spaces'`;
// };

// const name = (ele) => {
//     let regEx = /^[a-zA-z]*$/;
//     return regEx.test(ele);
// };

// const pass = (ele) => {
//     const passwordRegex =
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
//     return passwordRegex.test(ele);
// };

// const mobile = (ele) => {
//     const phoneRegex = /^[6-9]\d{9}$/;
//     return phoneRegex.test(ele);
// };

// const validateEmail = (email) => {
//     return email.match(
//         /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//     );
// };



const createUser = async function (req, res) {
    try {
        let files = req.files
        if (!files) {
            return res.status(400).send({ status: false, message: "Profile Image is required" })
        }

        let userImage = await uploadFile(files[0]);
        let data = req.body;
        let { fname, lname, email, phone, password, address } = data
        // let message;
        // if ((message = body(data))) { return res.status(400).send({ status: false, message: message }) };
       
        // if ((message = check(fname))) { return res.status(400).send({ status: false, message: `fname ${message}` }) }
        // // fname = fname.trim()
        // if ((!name(fname))) { return res.status(400).send({ status: false, message: `please enter a valid fname` }) }

        // if ((message = check(fname))) { return res.status(400).send({ status: false, message: `lname ${message}` }) }
        // // lname = lname.trim()
        // if ((!name(lname))) { return res.status(400).send({ status: false, message: `please enter a valid lname` }) }

        // if ((message = check(email))) { return res.status(400).send({ status: false, message: `email ${message}` }) }
        // // email = email.trim()
        // if ((!validateEmail(email))) { return res.status(400).send({ status: false, message: `please enter a valid email` }) }

        // let duplicateEmail = await userModel.findOne({ email });
        // if (duplicateEmail) { return res.status(400).send({ status: false, message: "Email is already registered" }) }

        // if ((message = check(phone))) { return res.status(400).send({ status: false, message: `phone no. ${message}` }) }
        // // phone = phone.trim()
        // if ((!mobile(phone))) { return res.status(400).send({ status: false, message: `please enter a valid phone no.` }) }

        // let duplicatePhone = await userModel.findOne({ phone });
        // if (duplicatePhone) { return res.status(400).send({ status: false, message: "phone no. is already registered" }) }

        // if ((message = check(password))) { return res.status(400).send({ status: false, message: `password ${message}` }) }
        // // password = password.trim()
        // if ((!pass(password))) { return res.status(400).send({ status: false, message: `please enter a valid password` }) }


        // if ((message = check(address.shipping.street))) { return res.status(400).send({ status: false, message: `street ${message}` }) }

        // if ((message = check(address.shipping.city))) { return res.status(400).send({ status: false, message: `city ${message}` }) }

        // let pincodeReg = /^[1-9][0-9]{5}$/;
        // if (!pincodeReg.test(address.shipping.pincode)) { return res.status(400).send({ status: false, message: `pincode isn't valid` }); }

        // if ((message = check(address.billing.street))) { return res.status(400).send({ status: false, message: `street ${message}` }) }

        // if ((message = check(address.billing.city))) { return res.status(400).send({ status: false, message: `city ${message}` }) }

        // if (!pincodeReg.test(address.billing.pincode)) { return res.status(400).send({ status: false, message: `pincode isn't valid` }); }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please provide valid user Details" })
        }

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "first name is required" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "last name is required" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email-ID is required" })
        }

        if (!isValidEmail(email))
            return res.status(400).send({ status: false, message: "Invalid Email id." })

        const checkEmailFromDb = await userModel.findOne({ email: email })

        if (checkEmailFromDb) {
            return res.status(400).send({ status: false, message: `emailId is Exists. Please try another email Id.` })
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone number is required" })
        }

        if (!isValidPhone(phone))
            return res.status(400).send({ status: false, message: "Phone number must be a valid Indian number." })

        const checkPhoneFromDb = await userModel.findOne({ phone: phone })

        if (checkPhoneFromDb) {
            return res.status(400).send({ status: false, message: `${phone} is already in use, Please try a new phone number.` })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }

        if (!isValid(address)) {
            return res.status(400).send({ status: false, message: "Address is required" })
        }
        console.log(address)

        let userAddress = JSON.parse(address)
        console.log(userAddress)
        data.address = userAddress

        if (!isValid(data.address.shipping && data.address.billing)) {
            return res.status(400).send({ status: false, message: "Please provide Address shipping And Billing Address" });
        }

        if (!isValid(data.address.shipping.street)) {
            return res.status(400).send({ status: false, message: "Please provide address shipping street" });
        }
        if (!isValid(data.address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Please provide address shipping city" });
        }
        if (!isValidCity(data.address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Please provide valid address shipping city" });
        }
        if (!(isValid(data.address.shipping.pincode))) {
            return res.status(400).send({ status: false, message: "Please provide valid address shipping pincode" });
        }
        if (!isValidPincode(data.address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide valid address shipping pincode" })
        }
        if (!isValid(data.address.billing.street)) {
            return res.status(400).send({ status: false, message: "Please provide address billing street" });
        }
        if (!isValid(data.address.billing.city)) {
            return res.status(400).send({ status: false, message: "Please provide address billing city" });
        }
        if (!isValidCity(data.address.billing.city)) {
            return res.status(400).send({ status: false, message: "Please provide valid address billing city" });
        }
        if (!(isValid(data.address.billing.pincode))) {
            return res.status(400).send({ status: false, message: "Please provide valid address billing pincode" });
        }
        if (!isValidPincode(data.address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide valid address billing pincode" })
        }




        const salt = await bcrypt.genSalt(10);
        hashPassword = await bcrypt.hash(password, salt);
        data.profileImage = userImage
        data.password = hashPassword


        let userData = await userModel.create(data);
        res.status(201).send({ status: true, message: "user Successfully created", data: userData })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
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
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: 'provide valid email id' })
        }


        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: 'Provide valid password its should contain atleast  one-lowercase, one uppercase,one numeric ' })
        }

        const userData = await userModel.findOne({ email });

        if (!userData) {
            return res.status(401).send({ status: false, message: `Login failed Email-Id is incorrect.` });
        }

        const checkPassword = await bcrypt.compare(password, userData.password)

        if (!checkPassword) return res.status(401).send({ status: false, message: `Login failed password is incorrect.` });

        let userId = userData._id

        const token = jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
        }, 'ProjectNo-5')

        return res.status(200).send({ status: true, message: "Login Successful", data: { Token: token } });

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


const updateUserDetails = async function (req, res) {

    try {

        let files = req.files
        let userDetails = req.body
        let userId = req.params.userId
        let userIdFromToken = req.userId

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid UserId" })
        }

        const userData = await userModel.findById(userId)

        if (!userData) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        if (userData._id.toString() != userIdFromToken) {
            return res.status(403).send({ status: false, message: "You Are Not Authorized!!" })
        }

        let { fname, lname, email, phone, password, address, profileImage } = userDetails


        if (!isValidRequestBody(userDetails)) {
            return res.status(400).send({ status: false, message: "Please provide user's details to update." })
        }
        if (fname) {
            if (!isValid(fname)) {
                return res.status(400).send({ status: false, message: 'first name is Required' })
            }
            if (!isValidName(fname)) {
                return res.status(400).send({ status: false, message: `${fname} is not valid` })
            }
            userData.fname = fname
        }
        if (lname) {
            if (!isValid(lname)) {
                return res.status(400).send({ status: false, message: 'last name is Required' })
            }
            if (!isValidName(lname)) {
                return res.status(400).send({ status: false, message: `${lname} is not valid` })
            }
            userData.lname = lname
        }

        if (email) {


            if (!isValid(email)) {
                return res.status(400).send({ status: false, message: 'email is Required' })
            }
            if (!isValidEmail(email))
                return res.status(400).send({ status: false, message: "Invalid Email id." })

            const checkEmailFromDb = await userModel.findOne({ email: email })

            if (checkEmailFromDb)
                return res.status(404).send({ status: false, message: `emailId is Exists. Please try another email Id.` })
            userData.email = email
        }

        if (phone) {

            if (!isValid(phone)) {
                return res.status(400).send({ status: false, message: 'phone number is Required' })
            }

            if (!isValidPhone(phone))
                return res.status(400).send({ status: false, message: "Phone number must be a valid Indian number.it should start with 6,7,8 or 9" })

            const checkPhoneFromDb = await userModel.findOne({ phone: phone })

            if (checkPhoneFromDb) {
                return res.status(400).send({ status: false, message: `${phone} is already in use, Please try a new phone number.` })
            }
            userData.phone = phone
        }

        if (password) {

            if (!isValid(password)) {
                return res.status(400).send({ status: false, message: 'password is Required' })
            }

            if (!isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 and also contain atleast one lowercase one uppercase one numeric" })
            }
            const salt = await bcrypt.genSalt(10);
            let hashPassword = await bcrypt.hash(password, salt);
            userData.password = hashPassword

        }


        if (address) {

            if (!isValid(address)) {
                return res.status(400).send({ status: false, message: 'Address is Required' })
            }

            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street' })
                    }
                    userData.address.shipping.street = address.shipping.street

                }
                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city' })
                    }
                    if (!isValidCity(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide valid city' })
                    }
                    userData.address.shipping.city = address.shipping.city

                }
                if (address.shipping.pincode) {
                    if (!isValid(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, msg: 'Please provide pincode' })
                    }
                    if (!isValidPincode(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, message: 'please provide a valid pincode' })
                    }
                    userData.address.shipping.pincode = address.shipping.pincode
                }
            }

            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street' })
                    }
                    userData.address.shipping.pincode = address.shipping.pincode
                }

                if (address.billing.city) {
                    if (!isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city' })
                    }
                    if (!isValidCity(address.billing.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide valid city' })
                    }
                    userData.address.billing.city = address.billing.city
                }

                if (address.billing.pincode) {
                    if (!isValid(address.billing.pincode)) {
                        return res.status(400).send({ status: false, msg: 'please provide pincode' })
                    }
                    if (!isValidPincode(address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: 'Please provide valid pincode' })
                    }
                    userData.address.billing.pincode = address.billing.pincode
                }
            }
        }

        if (files && files.length) {
            var userImage = await aws_s3.uploadFile(files[0])
            userData.profileImage = userImage
        }

        userData.save()

        return res.status(200).send({ status: true, message: "Update succesful", data: userData })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}



module.exports.createUser = createUser
module.exports.userLogin = userLogin
module.exports.getUserDetails = getUserDetails
module.exports.updateUserDetails = updateUserDetails
