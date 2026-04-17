const { query } = require('express-validator');
const db=require('../config/database');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');
const AppError=require('../utils/appError')


const createPost=async (postData) => {
    const client=await db.connect();
    try {
        const {title, content, published, category_ids,author_id}=postData;
     //Iniciar Transacción

        await client.query('BEGIN');
        const insertPostQuery=`
        INSERT INTO  posts (title, content, author_id, published)
        VALUES ($1,$2,$3,$4) 
        RETURNING *`;

        // Consulta Principal
        const postResult=await client.query(
            insertPostQuery,
            [title,content,author_id,published||false]
        )

        const postId= postResult.rows[0].id;

        if(category_ids && category_ids.length>0){

            const placeholders=category_ids.map((values,i)=>{
                return `($${i*2+1},$${i*2+2})`;
            }).join(',');

            const valuesInsert=category_ids.flatMap((category_id)=>[postId,category_id]);
            // Sub consulta
            const insertCategoryIdsQuery=`
            INSERT INTO post_categories (post_id,category_id)
            VALUES ${placeholders} RETURNING *`;

            await client.query(insertCategoryIdsQuery,valuesInsert); 
        }
        await client.query('COMMIT');

        return {
            ...postResult.rows[0],
            category_ids:category_ids
        };
    } catch (error) {
        await client.query(`ROLLBACK`);
        throw error;       
    }
    
    finally{
        client.release();
    } 


};

const findById=async (resource_id) => {
    const getPostQuery=await db.query(
        `SELECT * FROM posts WHERE id=$1`,
        [resource_id]
    );
    if (!getPostQuery.rows[0]) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND)
    return {...getPostQuery.rows[0]};
}

const findAllPosts=async (params) => {
    const conditionArr=[];
    const valuesArr=[];
    const baseQuery=
    `SELECT 
        p.id,
        p.title,
        p.content,
        json_build_object(
            'id',u.id,
            'name',u.name
        ) as author,
        COALESCE(
            JSON_AGG(
                json_build_object(
                'id',p_c.category_id,
                'name',cat.name
                )
            ) FILTER (where p_c.category_id IS not NULL)
        ,'[]')  as category_ids
    FROM users u
    JOIN posts p ON u.id=p.author_id
    LEFT JOIN post_categories p_c ON p.id=p_c.post_id
    LEFT JOIN categories cat ON p_c.category_id=cat.id
    `;

    const {page,limit,author_id,published,category}=params;
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
    if(category){
        valuesArr.push(category)
        let number=valuesArr.length
        conditionArr.push(`LOWER(cat.name)=$${number}`)
    }

    let whereConditions=conditionArr.join(` AND `)
    if(conditionArr.length>0){
        whereConditions=` WHERE ${whereConditions}`
    }
    // Se establece una consulta a la db para obtener el numero total 
    // de publicaciones en base a las condiciones establecidas antes de agregar los parametros LIMIT y OFFSET
    let QueryAllPost= `
        SELECT COUNT(DISTINCT p.id)
        FROM posts p
        LEFT JOIN post_categories p_c ON p.id=p_c.post_id
        LEFT JOIN categories cat ON p_c.category_id=cat.id 
        ${whereConditions}`

    const queryGetAllPost= await db.query(
        QueryAllPost, valuesArr
    )
    const numberOfPosts=parseInt(queryGetAllPost.rows[0].count);
    const numberOfPages=Math.ceil(numberOfPosts/limit);

    if(page>numberOfPages) throw new AppError(MESSAGES_OPERATION.NUMBER_PAGE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);


    // LIMIT y OFFSET al final para evitar problemas con el conteo de posts aplicando o no los filtros
    let limitePage="";
    const offset=(page-1)*limit;
    if(limit && page){
        valuesArr.push(limit,offset)
        let number=valuesArr.length
        limitePage=`LIMIT $${number-1} OFFSET $${number}`
    }

    let resultQuery=`
        ${baseQuery} 
        ${whereConditions} 
        GROUP BY p.id, u.id
        ORDER BY p.created_at DESC 
        ${limitePage}`;

    // Consulta con todos los parametros establecidos en la query de la ruta
    const queryGetPostLimited=await db.query(
        resultQuery,valuesArr
    );

    return {
        success:true,
        message:'Get Data Successfully',
        pagination:{
            totalPosts:numberOfPosts,
            totalPages:numberOfPages,
            currentPage:page,
            pageSize:limit
        },
        data:queryGetPostLimited.rows
    }
}

const update= async(post)=>{
    const {post_id,title,content}=post;
    try {
        const queryUpdatePost= await db.query(
            `UPDATE posts
            SET title=COALESCE($1,title), content=COALESCE($2,content)
            WHERE id=$3
            RETURNING *`,
            [title,content,post_id]
        );
        if (!queryUpdatePost.rows[0]) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND);   
    } catch (error) {
        throw error
    }
}

const deleteResource=async (postId) => {
        //Verificamos si el post existe 
    try {
        const postDeleteQuery= await db.query(
        `DELETE FROM posts WHERE id=$1 RETURNING *`,
        [postId]
        );
        if (!postDeleteQuery.rows[0]) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND);
    } catch (error) {
        throw error
    }

}
const checkOwnerShip=async (data) => {
    const {field,resourceType,resourceId}=data;
    const getOwnerIdQuery=`
    SELECT ${field} FROM ${resourceType}
    WHERE id=$1
    `;

    const getOwnerIdOfResource= await db.query(
        getOwnerIdQuery,
        [resourceId]
    );

    return getOwnerIdOfResource.rows[0][field];
}

const checkExists=async (postId) => {
    try {
        const exists=await db.query(`
            SELECT EXISTS(
                SELECT 1 FROM posts WHERE id=$1
            )
            `,
            [postId]
        )
        return exists.rows[0].exists
    } catch (error) {
        throw error
    }
}

module.exports={
    createPost,
    findById,
    findAllPosts,
    update,
    deleteResource,
    checkOwnerShip,
    checkExists
};