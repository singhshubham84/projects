
const urlModel = require("../model/model.js")
const shortid = require('shortid');
const validUrl = require('valid-url');
// const ObjectId = require('mongoose').Types.ObjectId;
// const userModel = require("../models/userModel.js");

// ========> create url
const createUrl = async function (req, res) {
  try {
    if(Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please enter long url"})
    const longUrl = req.body.longUrl
    if (!validUrl.isUri(longUrl)) {
      return res.status(400).send({ status: false, message: "invalid URL" })
    }

    const isExistUrl = await urlModel.findOne({longUrl});
    if( isExistUrl) {
      return res.status(201).send({status:true, message:"sucess", data: isExistUrl})
    }
    
    const str = req.protocol+"://"+req.headers.host +"/";
    const urlCode = shortid.generate()
    const shortUrl = str + urlCode.toLowerCase()
    const savedData = await  urlModel.create({ longUrl, shortUrl, urlCode }).select({longUrl:1,shortUrl:1,urlCode:1,_id:0});
    
    return res.status(201).send({ status: true, message: "success", data: savedData })

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