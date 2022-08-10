const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController=require('../controllers/cartControllers')
const orderController=require('../controllers/orderControllers')
const auth = require('../middleware/auth')
/*_____________________-----===> API FOR USER <====-----______________________________*/ 

router.post("/register", userController.createUser)
router.post("/login",userController.userLogin)
router.get('/user/:userId/profile',auth.userAuthentication, userController.getUserDetails)
router.put('/user/:userId/profile',auth.userAuthentication, userController.updateUserDetails)

/**______________________----==> PRODUCT API <===---____________________________________ */

router.post("/products", productController.createProduct)
router.get('/products',productController.getAllProducts)
router.put('/products/:productId',productController.updateProduct)
router.get('/products/:productId',productController.getProductById)
router.delete('/products/:productId',productController.deleteProduct)

/**________________________----===> CART API <====----________________________________________ */
router.post('/users/:userId/cart',auth.userAuthentication, cartController.createCart)
router.put('/users/:userId/cart',auth.userAuthentication,cartController.updateCart)
router.get('/users/:userId/cart', auth.userAuthentication, cartController.getCartData)
router.delete('/users/:userId/cart', auth.userAuthentication, cartController.deleteCart)

/**____________________------====> ORDER API <=====-----__________________________________ */

router.post('/users/:userId/orders', auth.userAuthentication, orderController.createOrder)
router.put('/users/:userId/orders', auth.userAuthentication,orderController.updateOrder)




module.exports = router;