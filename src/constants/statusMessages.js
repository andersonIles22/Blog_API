
const MESSAGES_OPERATION= Object.freeze({
    SUCCESFUL_OPERATION:"Successful Operation",
    TITTLE_REQUIRED:"Title is required",
    SERVER_ERROR:"Internal Server Error",
    EMAIL_ALREADY_EXIST:"Email already registered",
    LOGIN_SUCCESSFULLY:"Successful Login",
    EMAIL_INVALID:"Email Invalid",
    PASSWORD_INVALID:"Password invalid",
    USER_NOT_FOUND:"User not found",
    TOKEN_INVALID:"Token Invalid",
    TOKEN_REQUIRED:"Token Required",
    TOKEN_EXPIRED:'Token has expired',
    URL_NO_FOUND:(url)=>`Path: ${url}, no Found`,
    NOT_AUTHENTICATED:"No Authenticated",
    DENIED_ACCESS:"Access Denied. Insufficient Permissions"
});
module.exports={
    MESSAGES_OPERATION
}