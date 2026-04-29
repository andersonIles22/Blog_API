const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages');
const AppError = require('../utils/appError');
const userRepository=require('../repositories/userRepository');
const authRepository=require('../repositories/authRepository');

const userRegister=async (dataUser) => {
    const {email,password,name}=dataUser;

    const getUserById=await userRepository.checkByEmail(email);
    
    if(getUserById){
        throw new AppError(MESSAGES_OPERATION.EMAIL_ALREADY_EXIST,HTTP_STATUS.CONFLICT);
    }
    //HASH PASSWORD
    const salt =await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt)

    // CREATE USER
    const userData={
        email:email,
        name:name,
        hashedPassword:hashedPassword
    }
    const userCreated =await authRepository.register(userData)

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

    const user=await authRepository.login(email);
    
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