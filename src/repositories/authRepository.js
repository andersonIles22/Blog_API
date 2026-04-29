const db=require('../config/database')

const register=async (userData) => {
    const {email, hashedPassword,name}=userData;
    const insertUserQuery= await db.query(
        `INSERT INTO users (email,password,name) 
        VALUES($1,$2,$3) RETURNING *`,
        [email,hashedPassword,name]
    );
    return insertUserQuery.rows[0];
}

const login=async (email) => {
    const getUserByEmailQuery=await db.query(
        `SELECT id,email, password,role FROM users WHERE email=$1`,
        [email]
    );
    return getUserByEmailQuery.rows[0];
}
module.exports={
    register,
    login
}