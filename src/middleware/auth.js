const jwt=require('jsonwebtoken');
const { error } = require('./errorHandler');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');
const db=require('../config/database');

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

/**
 * Permite comprobar si es el propietario o de rol admin
 * @param {string} tableName - Nombre de la tabla que se va a buscar el id del propietario en la base de datos
 * @param {string} fieldAuthor - Nombre del campo que contiene el id a buscar
 * @param  {string[]} allowedRoles - Los roles permitidos
 * @returns 
 */
const isOwnerOrRole=(tableName,fieldAuthor,[...allowedRoles])=>{
    return async (req,res,next)=>{
        const {id,role}=req.user;
        const resourceId=req.params.post_id;
        console.log(role)
        console.log (allowedRoles)

        if(allowedRoles.includes(role)) return next();
        
        const query=`
            SELECT ${fieldAuthor} FROM ${tableName}
            WHERE id=$1
        `;
        const queryGetResource= await db.query(
            query,
            [resourceId]
        );
        const idObtained=queryGetResource.rows[0][fieldAuthor];

        if(idObtained===id) return next();

        return error(HTTP_STATUS.FORBIDDEN,MESSAGES_OPERATION.DENIED_ACCESS,next);
    };
};

module.exports={
    authMiddleware,
    isOwnerOrRole
 }