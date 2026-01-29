const {body,param,validationResult}=require('express-validator');
const {VALIDATION_VALUES}=require('../constants/values_validations');
const {MESSAGES_VALIDATION}=require('../constants/messagesValidation');
const {HTTP_STATUS}=require('../constants/httpStatusCode');

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
        .notEmpty().withMessage(MESSAGES_VALIDATION.PASSWORD_EMPTY),
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

const validateIdPost=[
    param('id')
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
    }
]
module.exports={
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateIdPost
};