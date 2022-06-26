const express = require('express');
const router = express.Router();
const AuthorController = require("../controller/AuthorController")
const BlogController = require('../controller/blogController')
const mid = require('../middleware/auth')


router.post('/authors', AuthorController.createAuthor)    //post api to create author 

router.post('/blogs', mid.authentication, BlogController.createBlog)  // post api to create blog

router.get('/blogs',mid.authentication, BlogController.getblog)   // get api to get the blogs

router.put('/blogs/:blogId', mid.authentication, mid.authorization, BlogController.updateblog)    // put api to update blogs

router.delete('/blogs/:blogId', mid.authentication, BlogController.deleteById)   // delete api to delete blog by id

router.delete('/blogs', mid.authentication, mid.authorization, BlogController.deleteBlogByquery)  // delete api to delete blog by query

router.post('/login', AuthorController.loginAuthor)   // post api to login author





module.exports = router;