const db=require('../config/database');

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

module.exports={
    createPost
};