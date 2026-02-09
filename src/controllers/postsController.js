const {error}=require('../middleware/errorHandler');
const db=require('../config/database');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages');
const {VALIDATION_VALUES}=require('../constants/values_validations');
const { matchedData } = require('express-validator');



const createPost=async(req,res,next)=>{
    try {
   const {title,content,published}=req.body;
    const author_id=req.user.id;

    const queryPost=await db.query(
        `INSERT INTO  posts (title, content, author_id, published) VALUES($1,$2,$3,$4) RETURNING *`,
        [title,content,author_id,published||false]
    )
    res.status(HTTP_STATUS.CREATED).json({
        success:true,
        message:"Post published successfully",
        data:queryPost.rows[0]
    })
    } catch (error) {
        next(error)
    }
}

const getPostById=async (req,res,next) => {
    try {
        const id=parseInt(req.params.post_id);
        const queryGetById= await db.query(
            `SELECT * FROM posts WHERE id=$1`,
            [id]
        )
        const post=queryGetById.rows[0];

        if(!post) return error(HTTP_STATUS.NOT_FOUND,MESSAGES_OPERATION.POST_NOT_FOUND,next);
        res.status(HTTP_STATUS.OK).json({
            post:post
        })
    } catch (error) {
        next(error);
    }
}
const getAllPost=async(req,res,next)=>{
    try {
        const {page,limit}=matchedData(req);
        const offset=(page-1)*limit;
        
        const queryGetAllPost= await db.query(
            `SELECT COUNT(*) FROM posts`
        )
        const numberOfPosts=queryGetAllPost.rows[0].count;
        const numberOfPages=Math.ceil(numberOfPosts/limit);
        if(page>numberOfPages) return error(HTTP_STATUS.BAD_REQUEST,MESSAGES_OPERATION.NUMBER_PAGE_NOT_FOUND,next);


        const queryGetPostLimited=await db.query(
            `SELECT 
                p.*,
                u.name,
                u.email
            FROM posts p JOIN users u
            ON p.author_id=u.id
            WHERE p.published=true
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
            `,
            [limit,offset]
        );


        res.status(HTTP_STATUS.OK).json({
            success:true,
            message:"Get data successfully",
            pagination:{
                totalPosts:numberOfPosts,
                totalPages:numberOfPages,
                currentPage:page,
                pageSize:limit
            },
            data:queryGetPostLimited.rows
        });
    } catch (error) {
        next(error);
    }
}

const updatePost=async (req,res,next) => {
    try {
        const {id}=req.user;
        const {post_id}=req.params;
        const {title,content}=req.body;

        const queryUpdatePost= await db.query(
            `UPDATE posts
            SET title=COALESCE($1,title), content=COALESCE($2,content)
            WHERE id=$3 AND author_id=$4
            RETURNING *`
            [title,content,post_id,id]
        )

        if(queryUpdatePost.rowCount===0) return error(HTTP_STATUS.FORBIDDEN,MESSAGES_OPERATION.NOT_IS_AUTHOR,next);

        res.status(HTTP_STATUS.OK,MESSAGES_OPERATION.SUCCESFUL_OPERATION)
    } catch (error) {
        next(error)
    }
}

module.exports={
    createPost,
    getPostById,
    getAllPost,
    updatePost
}