const db=require('../config/database');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { error } = require('../middleware/errorHandler');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');
const { matchedData } = require('express-validator');
const commentsService=require('../services/commentsService');
const postsComment= async(req,res,next)=>{
    try {
        const dataPost={
            post_id:parseInt(req.params.post_id),
            author_comment_id:req.user.id,
            post_comment:req.body.post_comment
        }
        const result=await commentsService.create(dataPost);

        res.status(HTTP_STATUS.CREATED).json({
            success:true,
            message:"Comment created successfully",
            data:result
        })
    } catch (error) {
        next(error);
    }
};

const getPostcomments=async (req,res,next) => {
    try {
        const data=matchedData(req)
        const dataPost= await commentsService.buildPostData(data,req.params.post_id);

        const result=await commentsService.getAll(dataPost)
        
        res.status(HTTP_STATUS.OK).json({
            result
        });

    } catch (error) {
        next(error);
    }    
}

module.exports={
    postsComment,
    getPostcomments
}