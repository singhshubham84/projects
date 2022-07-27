const mongoose = require('mongoose')
const aws=require('aws-sdk')


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false 
    if (typeof value === 'string' && value.trim().length === 0) return false 
    return true;
};
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
//to check id is valid or not

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0; 
};
//to check any  data available or not
const isValidName = function (name) {
    let nameRegex = /^[a-zA-z]*$/
    return nameRegex.test(name)
}
//regex for name 
const isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}
// regex for email validation

const isValidPhone = function (phone) {
    let mobileRegex = /^[0]?[6789]\d{9}$/
    return mobileRegex.test(phone)
}
//10 didgit mobile number stating with any(6,7,8,9) and 0 if you want to use in mobile number 

const isValidPincode = function (pincode) {
    let pincodeRegex = /^\d{6}$/
    return pincodeRegex.test(pincode)
}
// pincode should be 6 digit

const isValidPassword = function (password) {
    let passwordregex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#@$%&? "])[a-zA-Z0-9!#@$%&?]{8,15}$/
    return passwordregex.test(password)

}
//  One digit, one upper case , one lower case , its b/w 8 to 15

const isValidCity = function (city) {
    let cityRegex = /^[a-zA-z]+([\s][a-zA-Z]+)*$/

    return cityRegex.test(city)
}


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    let s3= new aws.S3({apiVersion: '2006-03-01'}); 

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  
        Key: "abc/" + file.originalname,  
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        return resolve(data.Location)
    })

   })
}



module.exports = { isValid, isValidObjectId,isValidRequestBody ,isValidEmail,isValidName,isValidPassword,isValidPincode,isValidPhone,isValidCity, uploadFile }