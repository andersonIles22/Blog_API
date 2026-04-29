const { HTTP_STATUS } = require('../constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('../constants/statusMessages');
const AppError = require('../utils/appError');
const postsRepository=require('../repositories/postsRepository');
const commentsRepository=require('../repositories/commentsRepository');

const create=async (dataPost) => {
    const {post_id}=dataPost;

    // Validamos la existencia del post 
    // y evitar error en la creación de comentario
    const existPosts=await postsRepository.exists(post_id)
    if(!existPosts) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND)

    const queryResult=await commentsRepository.create(dataPost);
    return queryResult;
}

const getAll=async (dataPost) => {
    const {post_id,page,limit,offset}=dataPost;

    // Validamos la existencia del post para evitar 
    // ambiguedad  con la interpretación del cliente
    const existPosts=await postsRepository.exists(post_id)
    if(!existPosts) throw new AppError(MESSAGES_OPERATION.POST_NOT_FOUND,HTTP_STATUS.NOT_FOUND)
    
    const comments= await commentsRepository.getAll(dataPost);

    // Obtenemos el numero total de comentarios para calcular la paginación
    const totalCount= await commentsRepository.countComments(post_id);
    
    const numberOfPages=Math.ceil(totalCount/limit)||1;
    if(page>numberOfPages) throw new AppError(MESSAGES_OPERATION.NUMBER_PAGE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);

    return {
        success:true,
        message:'Get Data Successfully',
        pagination:{
            totalComments:totalCount,
            totalPages:numberOfPages,
            currentPage:page,
            pageSize:limit
        },
        data:comments
    }
}


//#region No Logic 
    //En este caso es un transformador de datos, 
    // para la paginación de datos
const buildPostData=async (data, post_id) => {
    const page=data.page;
    const limit=data.limit;
    return{
        post_id:parseInt(post_id),
        page,
        limit,
        offset: (page-1)*limit
    };
};


module.exports={
    create,
    getAll,
    buildPostData
}