const {error}=require('../middleware/errorHandler');
const db=require('../config/database');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages')



const createPost=async(req,res,next)=>{
    try {
   const {title,content,published}=req.body;
   console.log(req)
    const author_id=req.user.id;

    const queryPost=await db.query(
        `INSERT INTO  posts (title, content, author_id, published) VALUES($1,$2,$3,$3) RETURNING *`,
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

const getAllPost=async(req,res,next)=>{
    try {
        const queryGetPost=await db.query(
            `SELECT 
                p.*,
                u.name,
                u.email
            FROM posts p JOIN users u
            ON p.author_id=u.id
            WHERE p.published=true,
            ORDER BY p.created_at DESC
            `
        );
        res.status(HTTP_STATUS.OK).json({
            success:true,
            message:"Get data successfully",
            count:queryGetPost.rows.length,
            data:queryGetPost.rows[0]
        });
    } catch (error) {
        next(error);
    }
}

module.exports={
    createPost,
    getAllPost
}