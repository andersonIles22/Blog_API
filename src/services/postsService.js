const db=require('../config/database');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');
const AppError=require('../utils/appError')
const postRepository=require('../repositories/postsRepository')

const createPost=async (postData) => {
    const client=await db.connect();
    try {
     //Iniciar Transacción
        await client.query('BEGIN');

        const postCreationQueryResult= await postRepository.create(postData,client);
        const postId=postCreationQueryResult.id;
        const categoriesInsertQueryResult=await  postRepository.addCatgoriesToPost(postId,postData,client);
        
        await client.query('COMMIT');
        return {
            ...postCreationQueryResult,
            category_ids:categoriesInsertQueryResult
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
    const getPostsQueryResult=await postRepository.getById(resource_id)
    if (!getPostsQueryResult) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND)
    return {...getPostsQueryResult};
}

const findAllPosts=async (params) => {
    const {page,limit,author_id,published,category}=params;

    const conditionArr=[];
    const valuesArr=[];
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
    const totalCount= await countPosts(whereConditions,valuesArr)

    const numberOfPages=Math.ceil(totalCount/limit)||1;

    if(page>numberOfPages) throw new AppError(MESSAGES_OPERATION.NUMBER_PAGE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);


    // LIMIT y OFFSET al final para evitar problemas con el conteo de posts aplicando o no los filtros
    let limitePage="";
    const offset=(page-1)*limit;
    if(limit && page){
        valuesArr.push(limit,offset)
        let number=valuesArr.length
        limitePage=`LIMIT $${number-1} OFFSET $${number}`
    }

    // Consulta con todos los parametros establecidos en la query de la ruta
    const getPostQueryResult=await postRepository.getAll(whereConditions,limitePage,valuesArr)

    return {
        success:true,
        message:'Get Data Successfully',
        pagination:{
            totalPosts:totalCount,
            totalPages:numberOfPages,
            currentPage:page,
            pageSize:limit
        },
        data:getPostQueryResult
    }
}

const update= async(post)=>{
    const {post_id,title,content}=post;
    const queryUpdatePost= await db.query(
        `UPDATE posts
        SET title=COALESCE($1,title), content=COALESCE($2,content)
        WHERE id=$3
        RETURNING *`,
        [title,content,post_id]
    );
    if (!queryUpdatePost.rows[0]) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND);   
}

const deleteResource=async (postId) => {
    //Verificamos si el post existe 
    const postDeleteQuery= await db.query(
    `DELETE FROM posts WHERE id=$1 RETURNING *`,
    [postId]
    );
    if (!postDeleteQuery.rows[0]) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND);

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
    const exists=await db.query(`
        SELECT EXISTS(
            SELECT 1 FROM posts WHERE id=$1
        )
        `,
        [postId]
    )
    return exists.rows[0].exists
}


const countPosts= async (conditions,arr) => {
    let getCountAllPostQuery= `
    SELECT COUNT(DISTINCT p.id)
    FROM posts p
    LEFT JOIN post_categories p_c ON p.id=p_c.post_id
    LEFT JOIN categories cat ON p_c.category_id=cat.id 
    ${conditions}`;

    const result= await db.query(
        getCountAllPostQuery, arr
    );
    return parseInt(result.rows[0].count);
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