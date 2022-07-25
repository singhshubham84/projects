const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

const body = (ele) => {
    if (Object.keys(ele).length) return;
    return `Please send some valid data in request body`;
};

const check = (ele) => {
    if (ele == undefined) { return `is missing` }
    if (typeof ele != "string") { return `should must be a string` }
    ele = ele.trim();
    if (!ele.length) { return `isn't valid` }
    if (ele.match("  ")) return `can't have more than one consecutive spaces'`;
};

const name = (ele) => {
    let regEx = /^[a-zA-z]*$/;
    return regEx.test(ele);
};

const pass = (ele) => {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    return passwordRegex.test(ele);
};

const mobile = (ele) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(ele);
};



const createUser = async function (req, res) {
    try {
        let data = req.body;
        let message;
        if ((message = body(data))) { return res.status(400).send({ status: false, message: message }) };
        let { fname, lname, email, phone, password, address } = data
        if ((message = check(fname))) { return res.status(400).send({ status: false, message: `fname ${message}` }) }
        fname = fname.trim()
        if ((message = name(fname))) { return res.status(400).send({ status: false, message: `please enter a valid fname` }) }

        if ((message = check(fname))) { return res.status(400).send({ status: false, message: `lname ${message}` }) }
        lname = lname.trim()
        if ((message = name(lname))) { return res.status(400).send({ status: false, message: `please enter a valid lname` }) }

        if ((message = check(email))) { return res.status(400).send({ status: false, message: `email ${message}` }) }
        email = email.trim()
        if ((message = name(email))) { return res.status(400).send({ status: false, message: `please enter a valid email` }) }

        if ((message = check(phone))) { return res.status(400).send({ status: false, message: `phone no. ${message}` }) }
        phone = phone.trim()
        if ((message = mobile(phone))) { return res.status(400).send({ status: false, message: `please enter a valid phone no.` }) }

        if ((message = check(password))) { return res.status(400).send({ status: false, message: `password ${message}` }) }
        password = password.trim()
        if ((message = pass(password))) { return res.status(400).send({ status: false, message: `please enter a valid password` }) }


        if ((message = check(address.shipping.street))) { return res.status(400).send({ status: false, message: `street ${message}` }) }

        if ((message = check(address.shipping.city))) { return res.status(400).send({ status: false, message: `city ${message}` }) }

        let pincodeReg = /^[1-9][0-9]{5}$/;
        if (!pincodeReg.test(address.shipping.pincode)) { return res.status(400).send({ status: false, message: `pincode isn't valid` }); }

        if ((message = check(address.billing.street))) { return res.status(400).send({ status: false, message: `street ${message}` }) }

        if ((message = check(address.billing.city))) { return res.status(400).send({ status: false, message: `city ${message}` }) }

        if (!pincodeReg.test(address.billing.pincode)) { return res.status(400).send({ status: false, message: `pincode isn't valid` }); }

        let duplicateEmail = await userModel.findOne({ email });
        if (duplicateEmail) { return res.status(400).send({ status: false, message: "Email is already registered" }) }

        let duplicatePhone = await userModel.findOne({ phone });
        if (duplicatePhone) { return res.status(400).send({ status: false, message: "phone no. is already registered" }) }

        //const pas = new User(body);
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        password.save()

        let userData = await userModel.create(data);

        res.status(201).send({ status: true, message: "user Successfully created", data: userData });
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
  module.exports.createUser = createUser
  module.exports.userLogin = userLogin
