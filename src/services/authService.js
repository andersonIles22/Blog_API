const db=require('../config/database');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages');
const AppError = require('../utils/appError');


const userRegister=async (dataUser) => {
    const {email,password,name}=dataUser;

    const getUserById=await db.query('SELECT id FROM users WHERE email=$1',[email]);
    
    if(getUserById.rows.length>0){
        throw new AppError(MESSAGES_OPERATION.EMAIL_ALREADY_EXIST,HTTP_STATUS.CONFLICT);
    }
    //HASH PASSWORD
    const salt =await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt)

    // CREATE USER
    const registerUserQuery =await db.query('INSERT INTO users (email,password,name) VALUES($1,$2,$3) RETURNING *',[email,hashedPassword,name]);
    const userCreated= registerUserQuery.rows[0];

    const token=jwt.sign(
        {id:userCreated.id, email:userCreated.email},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN||'12H'}
    );
    return {
        userCreated:{
            id:userCreated.id,
            email:userCreated.email,
            name:userCreated.name,
            created_at:userCreated.created_at
        },
        token
    }
}

const userLogin=async (userData) => {
    const {email, password}=userData;

    const getUserByIdQuery= await db.query(
            `SELECT id,email, password,role FROM users WHERE email=$1`,
            [email]
        );

    const user=getUserByIdQuery.rows[0];
    
    if(!user) throw new AppError(MESSAGES_OPERATION.CREDENTIALS_INVALID,HTTP_STATUS.AUTHORIZATION_REQUIRED);

    const checkPass= await bcrypt.compare(password, user.password);
    if(!checkPass) throw new AppError(MESSAGES_OPERATION.CREDENTIALS_INVALID,HTTP_STATUS.AUTHORIZATION_REQUIRED)

    const accesstoken=jwt.sign(
        {id:user.id,gmail:user.email,role:user.role},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN||'15m'}
    )
    
    return accesstoken

}
module.exports={
    userRegister,
    userLogin
}