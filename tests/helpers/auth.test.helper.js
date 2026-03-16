const jwt=require('jsonwebtoken');
const db=require('../../src/config/database');

const generateToken=(payload)=>{
    const {id,email,role}=payload;
    return jwt.sign(
        {id:id,email:email,role:role},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN||'15m'}
    );
}

const getDataById=async (id)=>{
    const data=await db.query(
        `SELECT id,title,content,published, author_id FROM posts WHERE id=$1`,
        [id]
    )
    return data.rows[0];
}


module.exports={
    generateToken,
    getDataById
}