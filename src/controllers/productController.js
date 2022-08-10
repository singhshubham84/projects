const productModel = require('../models/productModel')
const { uploadFile, isValid, isValidObjectId, isValidRequestBody } = require('../validator/validator')
const currencySymbol = require("currency-symbol-map")

const createProduct = async function (req, res) {

    try {
        let files = req.files;
        let productDetails = req.body;

        if (!isValidRequestBody(productDetails)) {
            return res.status(400).send({ status: false, message: "Please provide valid product details" })
        }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage,
            style, availableSizes, installments } = productDetails

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required" })
        }

        const checkTitle = await productModel.findOne({ title })
        if (checkTitle) {
            return res.status(400).send({ status: false, message: `title is alraedy in use. Please use another` })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Description is required" })
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "Price is required" })
        }

        if (isNaN(Number(price))) {
            return res.status(400).send({ status: false, message: "Price Is a Valid Number" })
        }
        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId is required" })
        }

        if (currencyId != "INR") {
            return res.status(400).send({ status: false, message: "currencyId should be INR" })
        }

        productDetails.currencyFormat = currencySymbol(currencyId)

        if (!isValid(style)) {
            return res.status(400).send({ status: false, message: "style is required" })
        }


        if (!isValid(installments)) {
            return res.status(400).send({ status: false, message: "installments required" })
        }


        if (installments) {
            if (!Number.isInteger(Number(installments))) {
                return res.status(400).send({ status: false, message: "installments can't be a decimal number or string" })
            }
        }

        if (isFreeShipping) {
            if (!isValid(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "isFreeShipping required" })
            }
            if (!((isFreeShipping == "true") || (isFreeShipping == "false"))) {
                return res.status(400).send({ status: false, message: "isFreeShipping must be a boolean value" })
            }
        }

        if (!files.length) {
            return res.status(400).send({ status: false, message: "Please provide product image" })
        }

        let productPhoto = await uploadFile(files[0])
        productDetails.productImage = productPhoto

        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Available Size is required" })
        }

        if (availableSizes) {
            let sizes = availableSizes.split(",").map(x => x.trim())
            sizes.forEach((size) => {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) {
                    return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
                productDetails['availableSizes'] = sizes
            })

        }

        const saveProductDetails = await productModel.create(productDetails)

        return res.status(201).send({ status: true, message: "Product added successfully.", data: saveProductDetails })


    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }

}

const getAllProducts = async function (req, res) {
    try {
        const inputs = req.query;

        let filterData = {}
        filterData.isDeleted = false

        if (inputs.size) {

            if (!isValid(inputs.size)) {
                return res.status(400).send({ status: false, msg: "Please Provide a Valid Size!" })
            }
            let sizes = inputs.size.split(",").map(x => x.trim())

            filterData.availableSizes = { $in: sizes }
        }

        if (inputs.name) {

            if (!isValid(inputs.name)) {
                return res.status(400).send({ status: false, msg: "Please Provide a Name Of the Product!" })
            }
            filterData.title = { $regex: inputs.name, $options: "i" }
        }

        if (inputs.priceGreaterThan && inputs.priceLessThan) {

            if (!isValid(inputs.priceGreaterThan)) {
                return res.status(400).send({ status: false, msg: "Please Provide a Highest Price Of the Product!" })
            }

            if (!isValid(inputs.priceLessThan)) {
                return res.status(400).send({ status: false, msg: "Please Provide a Lowest Price Of the Product!" })
            }

            filterData.price = { $gte: inputs.priceGreaterThan, $lte: inputs.priceLessThan }
        } else {
            if (inputs.priceGreaterThan) {

                if (isNaN(Number(inputs.priceGreaterThan))) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (inputs.priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan shouldn't be 0 or-ve number` })
                }

                filterData.price = { $gte: inputs.priceGreaterThan }

            } else {
                if (inputs.priceLessThan) {

                    if (isNaN(Number(inputs.priceLessThan))) {
                        return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                    }
                    if (inputs.priceLessThan <= 0) {
                        return res.status(400).send({ status: false, message: `priceLessThan can't be 0 or -ve` })
                    }

                    filterData.price = { $lte: inputs.priceLessThan }
                }
            }
        }

        if (inputs.priceSort) {

            if (!isValid(inputs.priceSort)) {
                return res.status(400).send({ status: false, msg: "Please Sort 1 for Ascending -1 for Descending order!" })
            }

            if (!((inputs.priceSort == 1) || (inputs.priceSort == -1))) {
                return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
            }

            const products = await productModel.find(filterData).sort({ price: inputs.priceSort })

            if (!products.length) {
                return res.status(404).send({ productStatus: false, message: 'No Product found' })
            }

            return res.status(200).send({ status: true, message: 'Product list', data2: products })
        }


        const products = await productModel.find(filterData)

        if (!products.length) {
            return res.status(404).send({ productStatus: false, message: 'No Product found' })
        }

        return res.status(200).send({ status: true, message: 'Product list', data: products })


    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}


const updateProduct = async function (req, res) {

    try {
        const updatedData = req.body

        const productId = req.params.productId
        let files = req.files;


        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid ProductId" })
        }

        const productData = await productModel.findById(productId)
        // console.log(productData)

        if (!productData) {
            return res.status(404).send({ status: false, message: "product not found" })
        }



        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = updatedData

        if (title) {

            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: `Title is required` })
            }

            const checkTitle = await productModel.findOne({ title: title });

            if (checkTitle) {
                return res.status(400).send({ status: false, message: ` Title is already used` })
            }

            productData.title = title

        }

        if (description) {

            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: `Description is required` })
            }

            productData.description = description

        }

        if (price) {

            if (!isValid(price)) {
                return res.status(400).send({ status: false, message: `price is required` })
            }

            if (isNaN(Number(price))) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }

            productData.price = price
        }

        if (currencyId) {

            if (!isValid(currencyId)) {
                return res.status(400).send({ status: false, message: `currencyId is required` })
            }

            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
            }

            productData.currencyId = currencyId;

        }

        if (currencyFormat) {

            if (!isValid(currencyFormat)) {
                return res.status(400).send({ status: false, message: `currency format is required` })
            }

            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "Please provide currencyFormat in format ₹ only" })
            }
            productData.currencyFormat = currencySymbol('INR')
        }

        if (isFreeShipping) {

            if (!isValid(isFreeShipping)) {
                return res.status(400).send({ status: false, message: `isFreeshiping is required` })
            }

            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
            }

            productData.isFreeShipping = isFreeShipping

        }

        if (files && files.length) {

            let updatedproductImage = await aws_s3.uploadFile(files[0]);
            updatedData.productImage = updatedproductImage

        }

        if (style) {

            if (!isValid(style)) {
                return res.status(400).send({ status: false, message: `style is required` })
            }

            productData.style = style
        }

        if (availableSizes) {

            if (!isValid(availableSizes)) {
                return res.status(400).send({ status: false, message: `size is required` })
            }

            let sizes = availableSizes.split(",").map(x => x.trim())

            sizes.forEach((size) => {
                let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                if (!arr.includes(size)) { return res.status(400).send({ status: false, message: `availableSizes is required and can only have these values ${arr}` }) }

                productData.availableSizes = sizes

            })
        }


        if (installments) {

            if (!isValid(installments)) {
                return res.status(400).send({ status: false, message: `installment is required` })
            }
            if (!Number.isInteger(Number(installments))) {
                return res.status(400).send({ status: false, message: `installments should be a valid number` })
            }

            productData.installments = installments
        }

        productData.save()

        return res.status(200).send({ status: true, message: 'Product details updated successfully.', data: productData });

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


const getProductById = async function (req, res) {
    try {

        let productId = req.params.productId

        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Invalid productId in path param" }) }

        let findProduct = await productModel.findById({ _id: productId })

        if (!findProduct) { return res.status(404).send({ status: false, message: "No product exists with is Product id" }) }

        if (findProduct.isDeleted) { return res.status(404).send({ status: false, message: "product is already deleted" }) }

        return res.status(200).send({ status: true, data: findProduct });

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}


const deleteProduct = async function (req, res) {
    try {

        let productId = req.params.productId

        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Invalid productId in path param" }) }

        const product = await productModel.findById({ _id: productId })

        if (!product) {
            return res.status(400).send({ status: false, message: `Product not Found` })
        }
        if (product.isDeleted == true) {
            return res.status(404).send({ status: false, message: `Product already deleted.` })
        }
        if (product.isDeleted == false) {
            await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

            return res.status(200).send({ status: true, message: `Product deleted successfully.` })
        }
        

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


module.exports.createProduct = createProduct
module.exports.getAllProducts = getAllProducts
module.exports.updateProduct = updateProduct
module.exports.getProductById = getProductById
module.exports.deleteProduct = deleteProduct

