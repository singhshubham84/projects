
const urlModel = require("../model/model.js")
const shortid = require('shortid');
const validUrl = require('valid-url');
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  17807,
  "redis-17807.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("MASbrdL7RJJtrO9aAZ9J1k7Y2N4PRurC", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

// ========> create url
const createUrl = async function (req, res) {
  try {
    const longUrl = req.body.longUrl
       //If URL already Present
       let cachedLongUrl = await GET_ASYNC(`${longUrl}`)
       if(cachedLongUrl){

           let parseLongUrl = JSON.parse(cachedLongUrl)
           return res.status(200).send({status:true,message: "Shorten link already generated ", data:parseLongUrl})
       }

    if(Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please enter long url"})
   
    if (!validUrl.isUri(longUrl)) {
      return res.status(400).send({ status: false, message: "invalid URL" })
    }
    // const isExistUrl = await urlModel.findOne({ longUrl })
    // if (isExistUrl) {
    //   const save={
    //     longUrl:isExistUrl.longUrl,
    //     shortUrl:isExistUrl.shortUrl,
    //     urlCode:isExistUrl.urlCode
    //   }

    //   return res.status(200).send({ status: true, message: "url is already genrated", data: save })
    // }

     const str = 'http://localhost:3000/'
    // const str = req.protocol+"://"+req.headers.host +"/";
   
    const urlCode = shortid.generate()
    const shortUrl = str + urlCode

    const urlData = { longUrl, shortUrl, urlCode }

    //Set cache the newly created url
    if(urlData){
               
      await SET_ASYNC(`${longUrl}`,JSON.stringify(urlData))
  }
    const savedData = await urlModel.create(urlData)

    return res.status(201).send({ status: true, message: "success", data: urlData })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

// ========> get url
const getUrl = async function (req, res) {
  try {

    const urlCode = req.params.urlCode
    let cachedUrlCode = await GET_ASYNC(`${urlCode}`)

    if (cachedUrlCode) {
    
        let parseUrl = JSON.parse(cachedUrlCode)
        let cachedLongUrl = parseUrl.longUrl
        return res.status(302).redirect(cachedLongUrl)
    }

    
   

    if (!shortid.isValid(urlCode)) { return res.status(400).send({ status: false, message: "invalid URL" }) }

    const getUrl = await urlModel.findOne({ urlCode });

    if (!getUrl) { return res.status(404).send({ status: false, message: "URL not found" }) }

    return res.status(302).redirect(getUrl.longUrl)

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl