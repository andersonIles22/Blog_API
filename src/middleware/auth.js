const jwt=require('jsonwebtoken');
const { error } = require('./errorHandler');
const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');
const db=require('../config/database');
const postsRepository=require('../repositories/postsRepository')

// Configuración centralizada de recursos
const RESOURCE_CONFIG = {
    posts: {
        ownerField: 'author_id',
        paramName: 'post_id'
    },
    comments: {
        ownerField: 'user_id',
        paramName: 'comment_id'
    }
};

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
 * Middleware para verificar si el usuario es el propietario del recurso o tiene rol permitido

 * @param {string} resourceType - Tipo de recurso ('posts', 'comments')
 * @param  {string[]} allowedRoles - Los roles para acceder sin ser propietarios
 * @returns {Function} Middleware de Express
 */
const isOwnerOrRole=(resourceType, allowedRoles = [])=>{
    const config = RESOURCE_CONFIG[resourceType];
    if (!config) {
        throw new Error(`Invalid resource type: ${resourceType}. Valid types: ${Object.keys(RESOURCE_CONFIG).join(', ')}`);
    }

    return async (req,res,next)=>{
        try{
        const {id,role}=req.user;
        const resourceId=req.params[config.paramName];

        if(allowedRoles.includes(role)) return next();
        const data={
            field:config.ownerField,
            resourceType:resourceType,
            resourceId:resourceId
        }

        // Usar el servicio segun el recurso establecido (posts, comments)
        const repositories={
            posts:postsRepository
        }

        const currentRepository=repositories[resourceType];
        // Conocer si existe el recurso por id
        const resource=await currentRepository.getById(resourceId)
        
        // Comprobación de que el usario es el propietario del recurso.
        const getOwnerIdOfResource= await postsRepository.isOwner(data)

        if(getOwnerIdOfResource!==id) return error(HTTP_STATUS.FORBIDDEN,MESSAGES_OPERATION.DENIED_ACCESS,next);
        req.resource=resource;
        next()
    }
    catch(error){
        next(error);
    }
}
};

module.exports={
    authMiddleware,
    isOwnerOrRole
 }