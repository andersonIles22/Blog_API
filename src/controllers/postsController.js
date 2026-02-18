const {error}=require('../middleware/errorHandler');
const db=require('../config/database');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages');
const { matchedData } = require('express-validator');



const createPost=async(req,res,next)=>{
    const client=await db.connect();
    try {
    const {title,content,published,category_ids}=req.body;
    const author_id=req.user.id;
 
    //Iniciar Transacción

    await client.query('BEGIN');
    const insertPostQuery=`
    INSERT INTO  posts (title, content, author_id, published)
     VALUES($1,$2,$3,$4) 
    RETURNING id`;

    // Consulta Principal
    const postResult=await client.query(
        insertPostQuery,
        [title,content,author_id,published||false]
    )

    const postId= postResult.rows[0].id;

    console.log(postId);
    res.status(HTTP_STATUS.CREATED).json({
        success:true,
        message:"Post published successfully",
        data:postResult.rows[0]
    })
    } catch (error) {
        await client.query(`ROLLBACK`);
        next(error)
    }
    finally{
        client.release();
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
        const conditionArr=[];
        const valuesArr=[];
        const baseQuery=
        `SELECT 
            p.*,
            u.name,
            u.email
        FROM users u JOIN posts p
        ON u.id=p.author_id`;

        const {page,limit,author_id,published}=matchedData(req);
        // Validamos que los parametros existan y asi establecer las condicionales en caso de indicar en la ruta
        if(author_id){
            valuesArr.push(author_id)
            let number=valuesArr.length
            conditionArr.push(`p.author_id=$${number}`)
        }
        if(published){
            valuesArr.push(published)
            let number=valuesArr.length
            conditionArr.push(`p.published=$${number}`)
        }

        let whereConditions=conditionArr.join(` AND `)
        if(conditionArr.length>0){
            whereConditions=` WHERE ${whereConditions}`
        }
        // Se establece una consulta a la db para obtener el numero total 
        // de publicaciones en base a las condiciones establecidas antes de agregar los parametros LIMIT y OFFSET
        let finalQueryAllPost= `SELECT COUNT(*) FROM posts p ${whereConditions}`
        const queryGetAllPost= await db.query(
            finalQueryAllPost, valuesArr
        )
        const numberOfPosts=queryGetAllPost.rows[0].count;
        const numberOfPages=Math.ceil(numberOfPosts/limit);
        if(numberOfPosts>0 && page>numberOfPages) return error(HTTP_STATUS.BAD_REQUEST,MESSAGES_OPERATION.NUMBER_PAGE_NOT_FOUND,next);


        // LIMIT y OFFSET al final para evitar problemas con el conteo de posts aplicando o no los filtros
        let limitePage="";
        const offset=(page-1)*limit;
        if(limit && page){
            valuesArr.push(limit,offset)
            let number=valuesArr.length
            limitePage=`LIMIT $${number-1} OFFSET $${number}`
        }

        let resultQuery=`${baseQuery} ${whereConditions} ORDER BY p.created_at DESC ${limitePage}`;

        // Consulta con todos los parametros establecidos en la query de la ruta
        const queryGetPostLimited=await db.query(
            resultQuery,valuesArr
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
        const {post_id}=req.params;
        const {title,content}=req.body;

        //Verificamos si el post existe 
        const queryGetPosts= await db.query(
            `SELECT * FROM posts WHERE id=$1`,[post_id]
        );
        const countPosts=queryGetPosts.rows.length;
        if(!countPosts>0) return error(HTTP_STATUS.NOT_FOUND,MESSAGES_OPERATION.POST_NOT_FOUND,next);

        const queryUpdatePost= await db.query(
            `UPDATE posts
            SET title=COALESCE($1,title), content=COALESCE($2,content)
            WHERE id=$3`,
            [title,content,post_id]
        );

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

const deletePost=async(req,res,next)=>{
    try {
        const {post_id}=req.params;

        //Verificamos si el post existe 
        const queryGetPosts= await db.query(
            `SELECT * FROM posts WHERE id=$1`,[post_id]
        );
        const countPosts=queryGetPosts.rows.length;
        if(!countPosts>0) return error(HTTP_STATUS.NOT_FOUND,MESSAGES_OPERATION.POST_NOT_FOUND,next);

        const queryUpdatePost= await db.query(
            `DELETE FROM posts WHERE id=$1`,[post_id]
        );

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
    createPost,
    getPostById,
    getAllPost,
    updatePost,
    deletePost
}