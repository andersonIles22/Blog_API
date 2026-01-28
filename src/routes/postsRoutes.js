const express=require('express');
const postControllers=require('../controllers/postsController');
const { authMiddleware } = require('../middleware/auth');


const router=express.Router();


router.post('/posts',postControllers.createPost);

router.get('/posts',authMiddleware,postControllers.getAllPost)


module.exports={
    router
}