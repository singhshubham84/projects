const userModel=require("../models/userModel")
const productModel=require("../models/productModel")
const {  isValidObjectId,isValidRequestBody } = require("../validator/validator")
const  cartModel=require("../models/cartModel")


const creatCart=async function (req,res){
    try{
        const userId= req.param.userId
        const data= req.body
        const {productId}= data
        
   // validation 
      if(!!isValidRequestBody(data)){
        return res.status(400).send({status:false, msg: "please provide request body" }) 
      }
      if(!isValidObjectId(userId)){
        return res.status(400).send({status:false, msg: " please provide userId"})
      }
      if (!isValidObjectId(productId)) {
        return res.status(400).send({ status: false, message: "Invalid ProductId" })
    }
     const findUser= await userModel.findById({_id:userId})
        if(!findUser){
             return res.status(400).send({status:false,msg:"userId not exist"})
        }
        const findProduct= await productModel.findOne({_id:productId,isDeleted:false})
        if(!findProduct){
            return res.status(400).send({status:false,msg:"productid doesnt exist"})
        }

       
        
        // finding cart related to user.
        const findCartOfUser = await cartModel.findOne({ userId: userId })

        if (!findCartOfUser) {

            let priceSum = findProduct.price * 1
            let itemArr = [{ productId: productId, quantity: 1 }]

            const newUserCart = await cartModel.create({
                userId: userId,
                items: itemArr,
                totalPrice: priceSum,
                totalItems: 1
            })
            return res.status(201).send({ status: true, message: "Success", data: newUserCart })
        }

        if (findCartOfUser) {

            //updating price when products get added or removed
            let price = findCartOfUser.totalPrice + (1 * findProduct.price)
            let arr = findCartOfUser.items
         // updating quentity

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    arr[i].quantity += 1
                    let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
                    return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
                }
            }

            arr.push({ productId: productId, quantity: 1 })
            let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
            return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}


const addProductInCart = async function(req,res){

    
    try{
        let carts = new carts({
            cart_id:req.body.cart_id,//passing cart id
            product_id:req.body.product_id, // passing product id
            price:req.body.price // passing product price
            })

        if(!isValidReqBody(carts)) return res.status(400).send({status:false,message:"Please provide the mandatory details"})
        if (carts.userId.email!=req.Token.email ||carts.userId.password!=req.Token.password){
            return res.status(400).send({status:false.valueOf,message:"you are not authorised"})
        }
        const findProduct= await productModel.findOne({_id:productId,isDeleted:false})
        if(!findProduct){
            return res.status(400).send({status:false,msg:"productid doesnt exist"})
        }
        // finding cart related to user.
        const findCartOfUser = await cartModel.findOne({ userId: userId })
        if (!findCartOfUser) {
            return res.status(400).send({ status: false, message: "Cart is not found for this user" })
        }
        if (findCartOfUser) {
            //updating price when products get added or removed
            let price = findCartOfUser.totalPrice + (1 * findProduct.price)
            let arr = findCartOfUser.items
         // updating quantity
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    arr[i].quantity += 1
                    let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
                    return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
                }
            }
            arr.push({ productId: productId, quantity: 1 })
            let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
            return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
        }
    }catch(err){
        return res.status(500).send({status:false,meaasge:"Server error by here"})
    }
}


const removeProductInCart = async function(req,res){
    try{



        let carts = new carts({
            cart_id:req.body.cart_id,//passing cart id
            product_id:req.body.product_id, // passing product id
            price:req.body.price // passing product price
            })

        if(!isValidReqBody(carts)) return res.status(400).send({status:false,message:"Please provide the mandatory details"})
        if (carts.userId.email!=req.Token.email ||carts.userId.password!=req.Token.password){
            return res.status(400).send({status:false.valueOf,message:"you are not authorised"})
        }
        const findProduct= await productModel.findOne({_id:productId,isDeleted:false})
        if(!findProduct){
            return res.status(400).send({status:false,msg:"productid doesnt exist"})
        }
        // finding cart related to user.
        const findCartOfUser = await cartModel.findOne({ userId: userId })
        if (!findCartOfUser) {
            return res.status(400).send({ status: false, message: "Cart is not found for this user" })
        }
        if (findCartOfUser) {
            //updating price when products get added or removed
            let price = findCartOfUser.totalPrice - (1 * findProduct.price)
            let arr = findCartOfUser.items
         // updating quantity
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    arr[i].quantity -= 1
                    let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
                    return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
                }
            }
            arr.pop({ productId: productId, quantity: 1 })
            let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
            return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
        }
    }catch(err){
        return res.status(500).send({status:false,meaasge:"Server error by here"})
    }
}
const getCartData = async function (req, res) {
    try {
        const userId = req.params.userId;
        let userIdFromToken = req.userId

        if (!isValidObjectId(userId)) {return res.status(400).send({ status: false, message: "Invalid userId in path params." })}

        const userFind = await userModel.findById({ _id: userId })
        if (!userFind) {return res.status(400).send({ status: false, message: `User does not exists by this userId ` })}

        if (userFind._id.toString() != userIdFromToken) {return res.status(401).send({ status: false, message: `authentication fail ` })}

        const cartFind = await cartModel.findOne({ userId: userId })

        if (!cartFind) {return res.status(400).send({ status: false, message: `Cart does not exists by this userId ` })}

        return res.status(200).send({ status: true, message: "Successfully get the cart data.", data: cartFind })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let userIdFromToken = req.userId

        if (!isValidObjectId(userId)) {return res.status(400).send({ status: false, message: "Invalid userId in params." })}
        
        const userFind = await userModel.findOne({ _id: userId })
        if (!userFind) {return res.status(400).send({ status: false, message: `User does not exists by this userId ` })}

        if (userFind._id.toString() != userIdFromToken) {return res.status(401).send({ status: false, message: `authentication fail` });
}

        const cartFind = await cartModel.findOne({ userId: userId })
        if (!cartFind) {return res.status(400).send({ status: false, message: `Cart does not exists by this userId ` })}

        await cartModel.findOneAndUpdate({ userId: userId }, {$set: {items: [],totalPrice: 0,totalItems: 0}},{new:true})
        
        return res.status(204).send({ status: true, message: "Cart successfully deleted" })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.creatCart = creatCart;
module.exports.removeProductInCart=removeProductInCart;
module.exports.addProductInCart=addProductInCart;
module.exports.getCartData=getCartData;
module.exports.deleteCart=deleteCart;

