const {error}=require('../middleware/errorHandler');
const db=require('../config/database');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages')



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
        console.log(id)
        console.log(req.params)
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
        const queryGetPost=await db.query(
            `SELECT 
                p.*,
                u.name,
                u.email
            FROM posts p JOIN users u
            ON p.author_id=u.id
            WHERE p.published=true
            ORDER BY p.created_at DESC
            `
        );
        res.status(HTTP_STATUS.OK).json({
            success:true,
            message:"Get data successfully",
            count:queryGetPost.rows.length,
            data:queryGetPost.rows
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