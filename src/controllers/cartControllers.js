const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")
const { isValid,isValidObjectId, isValidRequestBody } = require("../validator/validator")



const createCart = async function (req, res) {

    try {
        const userId = req.params.userId
        const data = req.body
        const { productId } = data
        let userIdFromToken = req.userId

        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Invalid userId in path params." }) }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide data in body" })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid ProductId" })
        }

        const findUser = await userModel.findById({ _id: userId })

        if (!findUser) {
            return res.status(400).send({ status: false, msg: "userId not exist" })
        }

        if (findUser._id.toString() != userIdFromToken) { return res.status(403).send({ status: false, message: `authentication fail ` }) }

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(400).send({ status: false, msg: "productid doesnt exist" })
        }
        // finding cart related to user.
        const findCartOfUser = await cartModel.findOne({ userId: userId })

        if (!findCartOfUser) {

            let priceSum = findProduct.price
            let itemArr = [{ productId: productId, quantity: 1 }]

            const newUserCart = await cartModel.create({ userId: userId, items: itemArr, totalPrice: priceSum, totalItems: 1 })

            return res.status(201).send({ status: true, message: "Success", data: newUserCart })
        }

        if (findCartOfUser) {

            let price = findCartOfUser.totalPrice + (findProduct.price)
            let arr = findCartOfUser.items

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

// const updateCart = async function (req, res) {
//     try {

//         let carts = new carts({
//             cart_id: req.body.cart_id,//passing cart id
//             product_id: req.body.product_id, // passing product id
//             price: req.body.price // passing product price
//         })
//         // const userId= req.params.userId
//         // const data= req.body
//         // const {productId,cartId} = data


//         if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Please provide the mandatory details" })
//         if (carts.userId.email != req.Token.email || carts.userId.password != req.Token.password) {
//             return res.status(400).send({ status: false.valueOf, message: "you are not authorised" })
//         }
//         const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
//         if (!findProduct) {
//             return res.status(400).send({ status: false, msg: "productid doesnt exist" })
//         }
//         // finding cart related to user.
//         const findCartOfUser = await cartModel.findOne({ userId: userId })
//         if (!findCartOfUser) {
//             return res.status(400).send({ status: false, message: "Cart is not found for this user" })
//         }
//         if (findCartOfUser) {
//             //updating price when products get added or removed
//             let price = findCartOfUser.totalPrice - (1 * findProduct.price)
//             let arr = findCartOfUser.items
//             // updating quantity
//             for (let i = 0; i < arr.length; i++) {
//                 if (arr[i].productId == productId) {
//                     arr[i].quantity -= 1
//                     let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
//                     return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
//                 }
//             }
//             arr.pop({ productId: productId, quantity: 1 })
//             let cartUpdate = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
//             return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
//         }
//     } catch (err) {
//         return res.status(500).send({ status: false, message: err.message })
//     }
// }


const updateCart = async function (req, res) {
    try { 

        let userId = req.params.userId;
        let data = req.body
        let { cartId, productId, removeProduct } = data
        let userIdFromToken = req.userId

        if (!isValidObjectId(userId)) {

            return res.status(400).send({ status: false, message: "Provide Valid Cart Id" });
        }
        if (userId != userIdFromToken) { return res.status(403).send({ status: false, message: `you are not authorise ` }) }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please provide details to remove product from cart " });
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide valid cart Id" });
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Provide Valid Cart Id" });
        }
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide product Id " });
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid product Id" })
        }
        if (!(/^0|1$/.test(removeProduct))) {
            return res.status(400).send({ status: false, message: "removeProduct should be either 0 or 1" })
        }

        // checking if cart is present or not
        let cart = await cartModel.findOne({_id: cartId});
        if (!cart) {
            return res.status(400).send({ status: false, message: `No cart found with this ${userId} userId` });
        }

        //checking if cart is emoty or not
        if (cart.items.length == 0) {
            return res.status(400).send({ status: false, message: "Cart is empty" });
        }
        
        let findProduct = await productModel.findById({ _id:productId })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "No product found with this product Id" })
        }

        let productArr = cart.items.filter(x =>
            x.productId.toString() == productId
        )

        if (productArr.length == 0) {
            return res.status(400).send({ status: false, message: "Product is not present in cart" })
        }

        let index = cart.items.indexOf(productArr[0]);

        if (removeProduct == 0) {

            cart.totalPrice = cart.totalPrice - findProduct.price * cart.items[index].quantity
            cart.items.splice(index, 1)
            cart.totalItems = cart.items.length
            cart.save()
        }

        if (removeProduct == 1) {

            cart.items[index].quantity -= 1;
            cart.totalPrice = cart.totalPrice - findProduct.price
            if (cart.items[index].quantity == 0) {

                cart.items.splice(index, 1)
            }
            cart.totalItems = cart.items.length
            cart.save()
        }
        return res.status(200).send({ status: true, message: "Data updated successfuly", data: cart })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}




const getCartData = async function (req, res) {
    try {
        const userId = req.params.userId
        const userIdFromToken = req.userId

        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Invalid userId in path params." }) }

        const userFind = await userModel.findById({ _id: userId })
        if (!userFind) { return res.status(400).send({ status: false, message: `User does not exists by this userId ` }) }

        if (userFind._id.toString() != userIdFromToken) { return res.status(403).send({ status: false, message: `authentication fail ` }) }

        const cartFind = await cartModel.findOne({ userId: userId })

        if (!cartFind) { return res.status(400).send({ status: false, message: `Cart does not exists by this userId ` }) }

        return res.status(200).send({ status: true, message: "Successfully get the cart data.", data: cartFind })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId

        const userIdFromToken = req.userId

        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Invalid userId in params." }) }

        const userFind = await userModel.findOne({ _id: userId })
        if (!userFind) { return res.status(400).send({ status: false, message: `User does not exists by this userId ` }) }

        if (userFind._id.toString()!= userIdFromToken) { return res.status(403).send({ status: false, message: `authentication fail` }) }

        const cartFind = await cartModel.findOne({ userId: userId })
        if (!cartFind) { return res.status(400).send({ status: false, message: `Cart does not exists by this userId ` }) }

        const deletedData = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })

        return res.status(200).send({ status: true, message: "Cart successfully deleted", data: deletedData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createCart = createCart;
module.exports.updateCart = updateCart;
module.exports.getCartData = getCartData;
module.exports.deleteCart = deleteCart;

