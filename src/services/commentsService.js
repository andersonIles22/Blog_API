const db=require('../config/database');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');
const AppError = require('../utils/appError');
const postsService=require('../services/postsService');

const create=async (dataPost) => {
    const {post_id,author_comment_id,post_comment}=dataPost;
    try {
        // Validamos la existencia del post 
        // y evitar error en la creación de comentario
        const existPosts=await postsService.checkExists(post_id)
        if(!existPosts) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND)

        const commentOnPostQuery=await db.query(
        `INSERT INTO comments (post_id,author_id,content) VALUES($1,$2,$3)
        RETURNING *`,
        [post_id,author_comment_id,post_comment]
    );
    return {
        ...commentOnPostQuery.rows[0]
    }
    } catch (error) {
        throw error
    }
}

const countComments=async (postId) => {
    const post_id=postId;
    const getCountCommentsQuery= await db.query(
        `SELECT count(*) FROM users u JOIN comments com
        ON u.id=com.author_id
        WHERE com.post_id=$1`,
        [post_id]
    )
    return parseInt(getCountCommentsQuery.rows[0].count);
}
const getAll=async (dataPost) => {
    const {post_id,page,limit,offset}=dataPost;

    try {
        // Validamos la existencia del post para evitar 
        // ambiguedad  con la interpretación del cliente
        const existPosts=await postsService.checkExists(post_id)
        if(!existPosts) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND)
        
        const queryGetSomeCommentsOnPost=await db.query(
            `SELECT 
                u.id,
                u.name,
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
        const comments=queryGetSomeCommentsOnPost.rows;

        // Obtenemos el numero total de comentarios para calcular la paginación
        const count= await countComments(post_id);
        const numberOfPages=Math.ceil(count/limit);
        if(page>numberOfPages) throw new AppError(MESSAGES_OPERATION.NUMBER_PAGE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);

        return {
            success:true,
            message:'Get Data Successfully',
            pagination:{
                totalComments:count,
                totalPages:numberOfPages,
                currentPage:page,
                pageSize:limit
            },
            data:comments
        }
    } catch (error) {
        throw error
    }
}



// No es lógica de negocio
    //En este caso es un transformador de datos, 
    // para la paginación de datos
const buildPostData=async (data, post_id) => {
    const page=data.page;
    const limit=data.limit;
    return{
        post_id:parseInt(post_id),
        page,
        limit,
        offset: (page-1)*limit
    };
};
module.exports={
    create,
    getAll,
    buildPostData
}