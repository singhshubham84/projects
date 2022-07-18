
const urlModel = require("../model/model.js")
const shortid = require('shortid');
const validUrl = require('valid-url');

// ========> create url
const createUrl = async function (req, res) {
  try {
    const longUrl = req.body.longUrl

    if (Object.keys(req.body).length == 0)                    // <======== if the user will not provide URL
    { return res.status(400).send({ status: false, message: "Please Provide Url" })} 

    if (!validUrl.isUri(longUrl.trim())) {                           // <======== if the user will not provide wrong URL
      return res.status(400).send({ status: false, message: "invalid URL" })
    }
    const isExistUrl = await urlModel.findOne({longUrl}).select({ _id: 0, __v:0});
    if( isExistUrl) {                                         // <======== if the URL already present in the DB
      return res.status(200).send({status:true, message:"sucess", data: isExistUrl})
    }
    const str = 'http://localhost:3000/'                      // <======== Base URL
    const urlCode = shortid.generate().toLowerCase()                       // <======== inbuilt function of shortid package  
    const shortUrl = str + urlCode                            // <======== if the URL already present in the DB
    const savedData = await urlModel.create({ longUrl, shortUrl, urlCode }).select({ _id: 0, __v:0});
    // line wise kaise ayenge longurl, shorturl, urlcode <============================
    // how to remove id and version if there is only create  <============================
    // 2 bar click krne p error ht k id version hat k a rhe h 

    return res.status(201).send({ status: true, message: "success", data: savedData }).select({ _id: 0, __v:0});
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

// ========> get url
const getUrl = async function (req, res) {
  try {

    const urlCode = req.params.urlCode
    const getUrl = await urlModel.findOne({ urlCode });

    if (!shortid.isValid(urlCode)) { return res.status(400).send({ status: false, message: "invalid URL" }) }
    if (!getUrl) { return res.status(404).send({ status: false, message: "URL not found" }) }

    return res.status(302).send({ status: true, message: "success", data: getUrl.longUrl })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl