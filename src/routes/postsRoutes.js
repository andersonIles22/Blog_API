const express=require('express');
const postControllers=require('../controllers/postsController');
const { authMiddleware,isOwnerOrRole } = require('../middleware/auth');
const { validateIdPost,validatePost,validateUpdate,validateQueryGetPosts} = require('../middleware/validationInputs');
const commentRoutes=require('../routes/commentRoutes')

const router=express.Router();


router.post('/',authMiddleware,validatePost,postControllers.createPosts);

router.get('/',validateQueryGetPosts,postControllers.getAllPost)

router.patch('/:post_id',validateIdPost,authMiddleware,isOwnerOrRole('posts',['admin']),validateUpdate,postControllers.updatePost)

router.delete('/:post_id',validateIdPost,authMiddleware,isOwnerOrRole('posts',['admin']),postControllers.deletePost)

router.get('/:post_id',validateIdPost,postControllers.getPostById)

router.use('/:post_id/comments',commentRoutes);


module.exports=router