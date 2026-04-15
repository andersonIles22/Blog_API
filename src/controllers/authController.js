const {error}=require('../middleware/errorHandler');
const db=require('../config/database');
const authServices=require('../services/authService');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const {MESSAGES_OPERATION}=require('../constants/statusMessages')

const register=async (req,res,next)=>{
    try {
        const body=req.body;
        const dataUser={
            email:body.email,
            password:body.password,
            name:body.name
        }

        const result=await authServices.userRegister(dataUser);

        res.status(HTTP_STATUS.CREATED).json({
            success:true,
            message:'User Registered Successfully',
            data:result
        });
    } catch (error) {
        next(error);
    }
}

const login= async (req,res,next)=>{
    try {
        const body=req.body;
        const userData={
            email:body.email,
            password:body.password
        }
        
        const result= await authServices.userLogin(userData);
        res.status(HTTP_STATUS.OK).json({
            success:true,
            message:MESSAGES_OPERATION.LOGIN_SUCCESSFULLY,
            token:result
        })

    } catch (error) {
        next(error)
    }
}

module.exports={
    register,
    login
}