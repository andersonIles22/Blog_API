const MESSAGES_VALIDATION=({
    EMAIIL_TOO_LONG:"Email must be 255 chareacters or less",
    EMAIL_INVALID:"Valid email required",
    PASSWORD_TOO_SHORT:"Password must be at least 6 characters",
    PASSWORD_EMPTY:"Password required",
    NAME_REQUIRED:"Name is required",
    NAME_TOO_LONG:"Name too long",
    CURRENT_PASSWORD_INCORRECT:"Current Password is incorrect ",
    NEW_PASSWORD_TOO_SHORT:"New Password must be at least 6 characters",
    NEW_PASS_NO_EQUAL_CONFIRM_PASS:"The Confirm Password does not match the New Password",
    NEW_PASSWORD_IS_EQUAL_TO_CURRENT_PASSWORD:"New password must be different from current password",
    MUST_BE_A_INTEGER:"Id should be a Integer Positive",
    COMMENT_IS_EMPTY:"Comment is required",
    COMMENT_TOO_SHORT:"Comment must be at least 4 characters"
});
module.exports={
    MESSAGES_VALIDATION
}