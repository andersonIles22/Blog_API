const {error}=require('../middleware/errorHandler');
const db=require('../config/database');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages');
const { matchedData } = require('express-validator');
const postsService=require('../services/postsService')


//#region INSERT

const createPosts=async (req,res,next) => {
    const postData={
        title:req.body.title,
        content:req.body.content,
        published:req.body.published,
        category_ids:req.body.category_ids,
        author_id:req.user.id
    }

    try {
        const result= await postsService.createPost(postData);
        res.status(HTTP_STATUS.CREATED).json({
            success:true,
            message:"Post published successfully",
            data:result
    })
    } catch (error) {
        next(error)
    }
}

//#region  GET ById
const getPostById=async (req,res,next) => {
    const id=parseInt(req.params.post_id);

    try {
        const result=await postsService.findById(id);
    
        res.status(HTTP_STATUS.OK).json({
            post:result
        })
    } catch (error) {
        next(error);
    }
}
//#region GET ALL

const getAllPost=async(req,res,next)=>{
    const validData=matchedData(req)
    const params={
        page:validData.page,
        limit:validData.limit,
        author_id:validData.author_id,
        published:validData.published,
        category:validData.category
    }
    try {
        const result= await postsService.findAllPosts(params)
        res.status(HTTP_STATUS.OK).json({
            success:result.success,
            message:result.message,
            pagination:result.pagination,
            data:result.data
        });
    } catch (error) {
        next(error);
    }
}
//#region UPDATE
const updatePost=async (req,res,next) => {
    try {
        const dataPost={
            post_id:req.params.post_id,
            title:req.body.title,
            content:req.body.content
        }
        const result=await postsService.update(dataPost)

        res.status(HTTP_STATUS.OK).json({
            success:true,
            message:MESSAGES_OPERATION.SUCCESFUL_OPERATION,
        });

    } catch (error) {
        next(error)
    }
}
//#endregion

//#region DELETE
const deletePost=async(req,res,next)=>{
    try {
        const postId=req.params.post_id;
        //Comprobar que existe el post
        await postsService.findById(postId)
        // Service de elimación de post
        await postsService.deleteResource(postId)
        res.status(HTTP_STATUS.OK).json(
        {
            success:true,
            message:MESSAGES_OPERATION.SUCCESFUL_OPERATION
        }
        );

    } catch (error) {
        next(error)
    }
}

module.exports={
    createPosts,
    getPostById,
    getAllPost,
    updatePost,
    deletePost
}