const express=require('express');
const postControllers=require('../controllers/postsController');
const { authMiddleware } = require('../middleware/auth');
const { validateIdPost } = require('../middleware/validationInputs');


const router=express.Router();


router.post('/all',authMiddleware,postControllers.createPost);

router.get('/all',postControllers.getAllPost)
router.get('/:id',validateIdPost,postControllers.getPostById)


module.exports=router