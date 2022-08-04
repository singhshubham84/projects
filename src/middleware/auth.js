const jwt = require('jsonwebtoken')


const userAuthentication = async function(req, res, next){

    try {

        let bearerHeader = req.headers.authorization;
        if(typeof bearerHeader == "undefined") return res.status(400).send({ status: false, message: "Token is missing" });
        // console.log(bearerHeader)
        let bearerToken = bearerHeader.split(' ');
        // console.log(bearerToken)
        let token = bearerToken[1];

        // if (!token) {
        // return res.status(400).send({ status: false, message: `Token Not Found` })}


        let decodeToken = jwt.verify(token, 'ProjectNo-5')
    
        if (!decodeToken) {

        return res.status(401).send({ status: false, message: `Invalid Token` })}

        req.userId = decodeToken.userId
        // console.log(req.userId)

        next()


    } catch (err) {

        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports.userAuthentication  = userAuthentication