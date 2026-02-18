const {Pool}=require('pg');

const pool=new Pool({
    connectionString:'postgresql://render_db_blog_api_user:rYYRRnlm9BRRsm1cl3wEdLXOFa9Ge7iR@dpg-d67jdrkr85hc73bp8110-a.oregon-postgres.render.com/render_db_blog_api',
    ssl:{
        rejectUnaunthorized:false
    }
})

const getQuery=async()=>{
try {
    const simpleQuery= await pool.query(
    `SELECT name FROM categories
    `);

    const result=simpleQuery.rows.map((value)=> value.name);
    console.log(result);
} catch (error) {
    console.error('algo salio mas wey',error.message);
}
finally{
    await pool.end();
    console.log('Sesión Terminada');
}

}
getQuery()