const express=require('express');
const { validateIdPost,validateCommentPos,validateQueryGetPosts } = require('../middleware/validationInputs');
const { authMiddleware } = require('../middleware/auth');
const commentControllers=require('../controllers/commentController');


const router=express.Router({mergeParams:true});

router.post('/',authMiddleware,validateIdPost,validateQueryGetPosts,commentControllers.postsComment);

router.get('/',validateIdPost,validateQueryGetPosts,commentControllers.getPostcomments)

module.exports=router;