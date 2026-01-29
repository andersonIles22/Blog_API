const express=require('express');
const { validateIdPost,validateCommentPost } = require('../middleware/validationInputs');
const { authMiddleware } = require('../middleware/auth');
const commentControllers=require('../controllers/commentController');


const router=express.Router();

router.post('/',authMiddleware,validateIdPost,validateCommentPost,commentControllers.postsComment);

router.get('/',validateIdPost,commentControllers.getPostcomments)

module.exports=router;