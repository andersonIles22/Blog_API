const {error}=require('../middleware/errorHandler');
const db=require('../config/database');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages')

const register=async (req,res,next)=>{
    try {
        //CHECK IF EMAIL ALREADY EXISTS
        const {email, password, name}=req.body;
        const queryRegister=await db.query('SELECT id FROM users WHERE email=$1',[email]);
        
        if(queryRegister.rows.length>0){
            return error(HTTP_STATUS.BAD_REQUEST,MESSAGES_OPERATION.EMAIL_ALREADY_EXIST,next)
        }
        //HASH PASSWORD
        const salt =await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt)

        // CREATE USER
        const result =await db.query('INSERT INTO users (email,password,name) VALUES($1,$2,$3) RETURNING *',[email,hashedPassword,name]);
        const userCreated= result.rows[0];

        const token=jwt.sign(
            {id:userCreated.id, email:userCreated.email},
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRES_IN||'12H'}
        );
        //RESPONSE
        res.status(HTTP_STATUS.CREATED).json({
            seccess:true,
            data:{
                userCreated:{
                    id:userCreated.id,
                    email:userCreated.email,
                    name:userCreated.name,
                    created_at:userCreated.created_at
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
}

const login= async (req,res,next)=>{
    try {
        const {email,password}=req.body;
        //Comprobamos de que usuario exista
        const queryGetData= await db.query(
            `SELECT id,email, password FROM users WHERE email=$1`,
            [email]
        );
        const user=queryGetData.rows[0];
        if (!user) return error(HTTP_STATUS.NOT_FOUND,MESSAGES_OPERATION.USER_NOT_FOUND,next);

        // Comprobamos email valido
        if(email!==user.email) return error(HTTP_STATUS.BAD_REQUEST,MESSAGES_OPERATION.EMAIL_INVALID,next);
        // Comprobamos password valido
        const checkPass= await bcrypt.compare(password, user.password);
        if(!checkPass) return error(HTTP_STATUS.BAD_REQUEST, MESSAGES_OPERATION.PASSWORD_INVALID,next);

        //Generación de Access token

        const accesstoken=jwt.sign(
            {id:user.id,gmail:user.email},
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRES_IN||'15m'}
        )

        res.status(HTTP_STATUS.OK).json({
            success:true,
            message:MESSAGES_OPERATION.LOGIN_SUCCESSFULLY,
            token:accesstoken
        })

    } catch (error) {
        next(error)
    }
}

module.exports={
    register,
    login
}