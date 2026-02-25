const {body,param,query,validationResult}=require('express-validator');
const {VALIDATION_VALUES}=require('../constants/values_validations');
const {MESSAGES_VALIDATION}=require('../constants/messagesValidation');
const {HTTP_STATUS}=require('../constants/httpStatusCode');
const db = require('../config/database');

const validateRegister=[
    body('email')
        .trim()
        .isEmail().withMessage(MESSAGES_VALIDATION.EMAIL_INVALID)
        .isLength({max:VALIDATION_VALUES.MAX_LENGTH_EMAIL})
        .normalizeEmail(),
    body('password')
        .isLength({min:VALIDATION_VALUES.MIN_LENGTH_PASSWORD}).withMessage(MESSAGES_VALIDATION.PASSWORD_TOO_SHORT),
    body('name')
        .trim()
        .notEmpty().withMessage(MESSAGES_VALIDATION.NAME_REQUIRED)
        .isLength({max:VALIDATION_VALUES.MAX_LENGTH_NAME}).withMessage(MESSAGES_VALIDATION.NAME_TOO_LONG),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                errors:errors.array().map(err=>({
                    field:err.path,
                    message:err.msg
                }))
            })
        }
        next();
    }
];

const validateLogin=[
    body('email')
        .trim()
        .isEmail().withMessage(MESSAGES_VALIDATION.EMAIL_INVALID)
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty()
            .withMessage(MESSAGES_VALIDATION.PASSWORD_EMPTY),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                errors:errors.array().map(err=>({
                    field:err.path,
                    message:err.msg
                }))
            })
        }
        next();
    }
]

const validateChangePassword = [
  body('currentPass')
    .notEmpty().withMessage(MESSAGES_VALIDATION.PASSWORD_EMPTY),
  body('newPass')
    .isLength({ min:VALIDATION_VALUES.MIN_LENGTH_PASSWORD }).withMessage(MESSAGES_VALIDATION.NEW_PASSWORD_TOO_SHORT)
    .custom((value, { req }) => {
      if (value === req.body.currentPass) {
        throw new Error(MESSAGES_VALIDATION.NEW_PASSWORD_IS_EQUAL_TO_CURRENT_PASSWORD);
      }
      return true;
    }),
    body('confirmPass')
        .custom((value,{req})=>{
            if (value!==req.body.newPass){
                throw new Error(MESSAGES_VALIDATION.NEW_PASS_NO_EQUAL_CONFIRM_PASS)
            }
            return true;
        }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        errors:errors.array().map(err=>({
            field:err.path,
            message:err.msg
        }))
      });
    }
    next();
  }
];

const validatePost=[
    body('title')
        .trim()
        .notEmpty()
            .withMessage(MESSAGES_VALIDATION.TITLE_POST_IS_EMPTY)
        .isLength({min:VALIDATION_VALUES.MIN_LENGTH_TITLE_POST,max:VALIDATION_VALUES.MAX_LENGTH_TITLE_POST})
            .withMessage(MESSAGES_VALIDATION.TITLE_POSTS_MIN_AND_MAX_CHARACTERS),
    body('content')
        .trim()
        .notEmpty()
            .withMessage(MESSAGES_VALIDATION.COMMENT_IS_EMPTY)
        .isLength({min:VALIDATION_VALUES.MIN_LENGTH_CONTENT_POST})
            .withMessage(MESSAGES_VALIDATION.CONTENT_POSTS_MIN_CHARACTERS),
    body('category_ids')
        .optional()
        .isArray()
            .withMessage(MESSAGES_VALIDATION.CATEGORY_POST_MUST_BE_AN_ARRAY)
        .bail()
        .custom((vector) => {
            // Validamos que el numero de categorías no exeda cierta longitud.
        if (vector.length > VALIDATION_VALUES.MAX_LENGTH_CATEGORY_IDS) {
            throw new Error(`There can not be more than ${VALIDATION_VALUES.MAX_LENGTH_CATEGORY_IDS} categories`);
        }

        // Validadmos que los elementos del array no esten repetidos
        const uniqueIds=[...new Set(vector)];
        if(uniqueIds.length!==vector.length){
            throw new Error(`Duplicate category IDs are not allowed in the same post`);
        }


        return true; 
        }),
    body('category_ids.*')
        .isInt({min:VALIDATION_VALUES.MIN_VALUE_CATEGORY_IDs})
            .withMessage(MESSAGES_VALIDATION.CATEGORY_VALUES_MUST_BE_INTEGERS_POSITIVE),
    body('category_ids')
        .custom(async(vector)=>{

        if(!vector || vector.length===0) return true;
        
        const queryDb=`
        SELECT id FROM categories
        WHERE id = ANY($1)
        `;

        const getCategoriesQuery= await db.query(queryDb,[vector]);
        // Obtenemos un array de las categorias
        const arrCategories=getCategoriesQuery.rows.map((value)=> value.id);
        // Lanzamos error si las categorias introducidas no existen en la base de datos
        const result=vector.filter((value)=> !arrCategories.includes(value));

        if(result.length>0){
            throw new Error(`These category ids: ${result.join(', ')} do not exist`);
        }
        
        return true;
    }),

    body('published')
        .isBoolean({strict:true})
            .withMessage(MESSAGES_VALIDATION.PUBLISHED_VALUE_MUST_BE_BOOLEAN), 
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                errors:errors.array().map(err=>({
                    field:err.path,
                    message:err.msg
                    }))
            })
        }
        next();
    }
]
const validateUpdate=[
    param('post_id')
        .isInt({min:VALIDATION_VALUES.MIN_VALUE_ID}).withMessage(MESSAGES_VALIDATION.MUST_BE_A_INTEGER)
        .trim(),
    body('title')
        .trim()
        .optional()
        .notEmpty()
            .withMessage(MESSAGES_VALIDATION.TITLE_POST_IS_EMPTY)
        .isLength({min:VALIDATION_VALUES.MIN_LENGTH_TITLE_POST,max:VALIDATION_VALUES.MAX_LENGTH_TITLE_POST})
            .withMessage(MESSAGES_VALIDATION.TITLE_POSTS_MIN_AND_MAX_CHARACTERS),
    body('content')
        .trim()
        .optional()
        .notEmpty()
            .withMessage(MESSAGES_VALIDATION.CONTENT_POST_IS_EMPTY)
        .isLength({min:VALIDATION_VALUES.MIN_LENGTH_CONTENT_POST})
            .withMessage(MESSAGES_VALIDATION.CONTENT_POSTS_MIN_CHARACTERS),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                errors:errors.array().map(err=>({
                    field:err.path,
                    message:err.msg
                 }))
            })
        }
        next();
    }
];

const validateIdPost=[
    param('post_id')
        .isInt({min:VALIDATION_VALUES.MIN_VALUE_ID}).withMessage(MESSAGES_VALIDATION.MUST_BE_A_INTEGER)
        .trim(),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                errors:errors.array().map(err=>({
                    field:err.path,
                    message:err.msg
                 }))
            })
        }
        next();
    }
]

const validateCommentPost=[
    body('post_comment')
        .trim()
        .notEmpty()
            .withMessage(MESSAGES_VALIDATION.COMMENT_IS_EMPTY)
        .isLength({min:VALIDATION_VALUES.MIN_LENGTH_COMMENT,max:VALIDATION_VALUES.MAX_LENGTH_COMMENT})
            .withMessage(MESSAGES_VALIDATION.COMMENT_LIMIT_CHARACTERS),
    (req,res,next)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty())return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            errors:errors.array().map(err=>({
                field:err.path,
                message:err.msg
            }))
        });
        next();
    }
]


const validateQueryGetPosts=[
    query('page')
        .default(VALIDATION_VALUES.DEFAULT_VALUE_QUERY_PAGE)
        .toInt()
        .isInt({min:VALIDATION_VALUES.MIN_VALUE_QUERY_PAGE})
            .withMessage(MESSAGES_VALIDATION.MUST_BE_A_INTEGER),
    query('limit')
        .default(VALIDATION_VALUES.DEFAULT_VALUE_QUERY_LIMIT)
        .toInt()
        .isInt({min:VALIDATION_VALUES.MIN_VALUE_QUERY_LIMIT,max:VALIDATION_VALUES.MAX_VALUE_QUERY_LIMIT})
            .withMessage(MESSAGES_VALIDATION.QUERY_LIMIT_MUST_BE),
    query('author_id')
        .optional()
        .isInt({min:VALIDATION_VALUES.MIN_VALUE_QUERY_PAGE})
            .withMessage(MESSAGES_VALIDATION.MUST_BE_A_INTEGER),
    query('published')
        .optional()
        .isIn(['true','false'])
            .withMessage(MESSAGES_VALIDATION.QUERY_PUBLISHED_MUST_BE_BOOLEAN),
    query('category')
        .optional()
        .trim()
        .isString()
            .withMessage(MESSAGES_VALIDATION.QUERY_TECHNOLOGY_MUST_BE_A_STRING)
        .custom(async(value)=>{
            const queryTechDb=`
            SELECT name FROM categories
            WHERE name=$1
            `
            const getTechsQuery=await db.query(
                queryTechDb,
                [value]
            )

            if(getTechsQuery.rows.length===0){
                throw new Error(`The ${value} category is not found`);
            }
            return true;
        }),
    (req,res,next)=>{
         const errors=validationResult(req);
        if(!errors.isEmpty())return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            errors:errors.array().map(err=>({
                field:err.path,
                message:err.msg
            }))
        });
        next();
    }
]
module.exports={
    validateRegister,
    validateLogin,
    validateChangePassword,
    validatePost,
    validateIdPost,
    validateCommentPost,
    validateUpdate,
    validateQueryGetPosts
};