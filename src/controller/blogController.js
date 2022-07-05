const { default: mongoose } = require('mongoose');
const jwt = require("jsonwebtoken");

const authorModel = require('../model/AuthorModel');
const blogModel = require('../model/blogModel');

// ----------------------API to create blog----------------------------------------//
const createBlog = async function (req, res) {

    try {
        let data = req.body;
        data.tags = [...new Set(data.tags)]   //remove the dublicate tags
        data.subcategory = [...new Set(data.subcategory)]  //remove the dublicate subcategory

        const newBlog = await blogModel.create(data)
        return res.status(201).send({ status: true, msg: "New blog created successfully", data: newBlog })

    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//------------------API to get the blog according to the user filter--------------------------//
const getblog = async function (req, res) {

    try {
        let data = req.query
        let filter = { isDeleted: false, isPublished: true, ...data }

        let blogs = await blogModel.find(filter)

        if (blogs && blogs.length === 0) {
            return res.status(404).send({ status: false, msg: "no such document exist" })
        }
        else {
            return res.status(200).send({ status: true, msg: "Blog details accessed successfully", data: blogs, })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//--------------------API to update the blog whom user want to update-------------------------------------//
const updateblog = async function (req, res) {
    try {
        let blogId = req.params.blogId;
        let data = req.body;


        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Body is required" });
        }
        // data should not be empty

        let blogData = await blogModel.findOne({ _id: blogId, isDeleted: false });

        if (!blogData) res.status(404).send({ status: false, msg: "blogs-Id related data unavailable" })

        if (data.title) blogData.title = data.title;
        if (data.body) blogData.body = data.body;
        if (data.category) blogData.category = data.category;        // updating the title body and category
        if (data.tags) {
            if (typeof data.tags == "object") {
                blogData.tags.push(...data.tags);
            }
           
        } // adding the tags

        if (data.subcategory) {
            if (typeof data.subcategory == "object") {
                blogData.subcategory.push(...data.subcategory);
            }
        }// adding the subcategory

        blogData.publishedAt = Date();          // updating the date
        blogData.isPublished = true;
        blogData.save();                        // saving every updation

        let datasave = await blogModel.findOneAndUpdate({ _id: blogId }, { blogData }, { new: true })
        return res.status(200).send({ status: true, data: datasave });

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};


//--------------------------API to delete the blog with its blog id-----------------------------------//
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const deleteById = async function (req, res) {

    try {

        let blogId = req.params.blogId


        if (!blogId) {
            res.status(400).send({ status: false, msg: "please enter blogid in param" })
            return;
        }
        if (!isValidObjectId(blogId)) {
            return res.status(400).send("please enter valid blog id")
        }
        let blog = await blogModel.findOne({ $and: [{ _id: blogId }, { isDeleted: false }] })

        if (!blog) {
            return res.status(404).send({ status: false, msg: "No such blog exist or the blog is deleted" })
        }

        let afterDeletion = await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        return res.status(200).send({ status: true, msg: "Blog deleted succesfully", data: afterDeletion })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//-------------------------------API to delete the blog according to  query -----------------------------------//


let deleteBlogByquery = async function (req, res) {

    try {
        let qwery = req.query

        let data = Object.keys(qwery)
        if (!data.length) return res.status(400).send({ status: false, msg: "Data can not be empty" });
        
        let query = { isDeleted: false, ...qwery } // every time check id deleted false
        let blogs = await blogModel.find(query)
        // console.log(blogs)
        if (blogs.length == 0) {
            return res.status(400).send({ msg: "data not available  or  deleted" })
        }

        if (!blogs) return res.status(404).send({ status: false, msg: "Data already deleted" })

        let token = req.headers["x-api-key"]
        if (!token) return res.status(401).send({ status: false, msg: "token is not available" })

        let decodedToken = jwt.verify(token, "author-blog")

        if (!decodedToken) return res.status(403).send({ status: false, msg: "invalid token" })

        let authorisedId = decodedToken.authorId

        let auth = blogs.map(blog => {
            if (blog.authorId.toString() === authorisedId)
                return blog._id
        })
        //here we are finding out author id which is related to query params and whose value is equal to our decodedToken. if we will find the value we will get authorid else undefined
    
        if (auth === undefined) return res.status(404).send({ msg: "you are not allowed to delete this blog" })
        
        // console.log(req.token)//it will give us author id which is in decoded token and it will give us those author id only which is authorised to update or delete    
        let deletBlog = await blogModel.updateMany({ _id: auth },
            { $set: { isDeleted: true, isDeletedAt: new Date() } },
            { new: true })

        return res.status(200).send({ status: true, data: deletBlog })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.getblog = getblog
module.exports.createBlog = createBlog
module.exports.updateblog = updateblog
module.exports.deleteById = deleteById
module.exports.deleteBlogByquery = deleteBlogByquery