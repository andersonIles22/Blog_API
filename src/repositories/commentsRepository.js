const db=require('../config/database');

const create=async (commentData) => {
    const {post_id,author_comment_id,post_comment}=commentData;
    const insertCommentsQuery=await db.query(
        `INSERT INTO comments (post_id,author_id,content) VALUES($1,$2,$3)
        RETURNING *`,
        [post_id,author_comment_id,post_comment]
        );
    
        return insertCommentsQuery.rows[0];
}

const getAll=async (dataPost) => {
    const {post_id,limit,offset}=dataPost;

    const getCommentsQuery=await db.query(
        `SELECT 
            u.id,
            u.name as author,
            com.id,
            com.content
        FROM users u JOIN comments com
        ON u.id=com.author_id
        WHERE com.post_id=$1
        ORDER BY com.created_at
        LIMIT $2 OFFSET $3
        `,
        [post_id,limit,offset]
    );
    return getCommentsQuery.rows;
}


const countComments=async (postId) => {
    const post_id=postId;
    const getCountCommentsQuery= await db.query(
        `SELECT COUNT(*) 
        FROM comments com JOIN posts p 
        ON com.post_id=p.id 
        WHERE p.id=$1`,
        [post_id]
    )
    return parseInt(getCountCommentsQuery.rows[0].count);
}
module.exports={
    create,
    getAll,
    countComments
}