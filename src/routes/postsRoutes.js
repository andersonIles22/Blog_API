const express=require('express');
const postControllers=require('../controllers/postsController');
const { authMiddleware } = require('../middleware/auth');


const router=express.Router();

router.use(authMiddleware)
router.post('/',postControllers.createPost);

router.get('/',postControllers.getAllPost)


module.exports=router