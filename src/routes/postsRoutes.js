const express=require('express');
const postControllers=require('../controllers/postsController');
const { authMiddleware } = require('../middleware/auth');


const router=express.Router();


router.post('/',postControllers.createPost);

router.get('/',authMiddleware,postControllers.getAllPost)


module.exports={
    router
}