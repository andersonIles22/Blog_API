const jwt=require('jsonwebtoken');
const { error } = require('./errorHandler');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');

const authMiddleware= (req,res,next)=>{
    const getAuth=req.headers.authorization;
    if(!getAuth || !getAuth.startsWith('Bearer')){
        return error(HTTP_STATUS.AUTHORIZATION_REQUIRED,MESSAGES_OPERATION.CREDENCIAL_INVALID,next)
    }

    const onlyToken=getAuth.split(' ')[1];
    try {
        const decoded=jwt.verify(onlyToken,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    } catch (err) {
        return error(HTTP_STATUS.AUTHORIZATION_REQUIRED,MESSAGES_OPERATION.CREDENCIAL_INVALID,next);
    }
};

module.exports={authMiddleware}