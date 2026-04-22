const db=require('../config/database');

const create=async (fields,client) => {
    const {title, content, published,author_id}=fields;

    const insertPostQuery=`
        INSERT INTO  posts (title, content, author_id, published)
        VALUES ($1,$2,$3,$4) 
        RETURNING *`;

    const postResult=await client.query(
        insertPostQuery,
        [title,content,author_id,published||false]
    );
    return postResult.rows[0];
};

const addCatgoriesToPost=async (postId,postData,client) => {
    const {category_ids}=postData;

    if(category_ids && category_ids.length>0){
        const placeholders=category_ids.map((values,i)=>{
                return `($${i*2+1},$${i*2+2})`;
            }).join(',');

        const valuesInsert=category_ids.flatMap((category_id)=>[postId,category_id]);
        // Sub consulta
        const insertCategoryIdsQuery=`
        INSERT INTO post_categories (post_id,category_id)
        VALUES ${placeholders} RETURNING *`;

        const postsCategoriesResult=await client.query(insertCategoryIdsQuery,valuesInsert);
        return postsCategoriesResult.rows.map(x=>x.category_id);
    }
           
}

const getById=async (resource_id) => {
    const getPostQuery=await db.query(
        `SELECT * FROM posts WHERE id=$1`,
        [resource_id]
    );
    return getPostQuery.rows[0]

}

const getAll=async (whereConditions,limitePage,valuesArr) => {

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
    let resultQuery=`
        ${baseQuery} 
        ${whereConditions} 
        GROUP BY p.id, u.id
        ORDER BY p.created_at DESC 
        ${limitePage}
    `;
    const getAllResult= await db.query(resultQuery,valuesArr);
    return getAllResult.rows;
}

module.exports={
    create,
    addCatgoriesToPost,
    getById,
    getAll
}