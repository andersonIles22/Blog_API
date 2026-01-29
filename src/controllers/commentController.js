const db=require('pg');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { error } = require('../middleware/errorHandler');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');


const postsComment= async(req,res,next)=>{
    try {
        const post_id=parseInt(req.params.post_id);
        const {post_comment}=req.body;

        const queryGetPost= await db.query(
            `SELECT * FROM posts WHERE post_id=$1`,
            [post_id]
        );
        const post=queryGetPost.rows[0];

        const queryCommentOnPost=await db.query(
            `INSERT INTO comments (post_id,author_id,content VALUES($1,$2,$3))`,
            [post_id,post.author_id,post_comment]
        );

        res.status(HTTP_STATUS.CREATED).json({
            success:true,
            message:"Comentario creado"
        })
    } catch (error) {
        next(error);
    }
};

const getPostcomments=async (req,res,next) => {
    try {
        const post_id=parseInt(req.params.post_id);
        //Se establece si el post existe antes de obtener los comentarios del post
        const queryGetPost= await db.query(
            `SELECT * FROM posts WHERE id=$1`,
            [post_id]
        );
        if(!queryGetPost.rows[0]) return error(HTTP_STATUS.NOT_FOUND,MESSAGES_OPERATION.POST_NOT_FOUND,next);


        const queryGetCommentsOnPost=await db.query(
            `SELECT 
                u.id,
                u.name,
                com.id,
                com.content
            FROM users u JOIN comments com
            ON u.id=com.author_id
            WHERE com.post_id=$1
            ORDER BY com.created_at
            `,
            [post_id]
        );
        const comments=queryGetCommentsOnPost.rows;

        res.status(HTTP_STATUS.OK).json({
            success:true,
            countComments:comments.length,
            data:{
                comments
            }

        });

    } catch (error) {
        next(error);
    }    
}

module.exports={
    postsComment,
    getPostcomments
}