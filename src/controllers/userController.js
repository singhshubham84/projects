const userModel = require('../models/userModel')

const createUser = async function (req, res) {
    try {
      let user = req.body;
      let userCreate = await userModel.create(user);
  
      res.status(201).send({status:true, message:"user Successfully created", data: userCreate });
      
    } catch (err) {
      res.status(500).send({ msg: err.message });
    }
  };
  module.exports.createUser = createUser