const {MESSAGES_OPERATION}=require('../constants/statusMessages')
const {HTTP_STATUS}=require('../constants/httpStatusCode')
/**
 * Error Middleware, Centralized Error Handler.
 * @param {error} err -  Capture Error Object.
 * @param {Object} req - request of Express.
 * @param {Object} res  - response of Express.
 * @param {Function} next  Relay Function
 */
const errorHandler=(err, req, res, next)=>{
  // si queremos mostrar la linea de codigo donde empieza a fallar
  console.error('Error:', err.stack);
  const statusCode = err.status || HTTP_STATUS.INTERNAL_ERROR;
  const message = err.message || MESSAGES_OPERATION.SERVER_ERROR;
  res.status(statusCode).json({
    success: false,
    error: message,
    data:null
  });
}
/**
 * Error Creator, We create an error with statusCode and a message, then we past it to next error middleware.
 * @param {number} statusCode - Status Code HTTP (Ex:404)
 * @param {String} message  - Descriptive Error Message
 * @param {Function} next  Function next of Express to Delegate the error.
 */
const error=(statusCode,message, next)=>{
    const error=new Error(message);
    error.status=statusCode;
    next(error);
};

/**
 * Error Custom, We create an error with statusCode and message, then we response un error to middleware.
 * @param {number} statusCode Status Code HTTP (Ex: 404)
 * @param {String} message - Description Error Message
 * @returns Object Error
 */
const customError=(statusCode,message)=>{
return res.status(statusCode).json({
  succes:false,
  error:message
})
}

module.exports = { errorHandler, error,customError };