const express=require('express');
const postControllers=require('../controllers/postsController');
const { authMiddleware } = require('../middleware/auth');
const { validateIdPost } = require('../middleware/validationInputs');
const commentRoutes=require('../controllers/commentController')

const router=express.Router();


router.post('/',authMiddleware,postControllers.createPost);

router.get('/',postControllers.getAllPost)

router.get('/:post_id',validateIdPost,postControllers.getPostById)

router.use('/:post_id/comments',commentRoutes);


module.exports=router