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
    TITLE_POSTS_MIN_AND_MAX_CHARACTERS:"The Title should be between 5 to 200 characters",
    CONTENT_POSTS_MIN_CHARACTERS:"The content should be a least 20 characters",
    COMMENT_IS_EMPTY:"Comment is required",
    TITLE_POST_IS_EMPTY:"Title is required",
    CONTENT_POST_IS_EMPTY:"Content is required",
    CATEGORY_POST_IS_EMPTY:"Category_ids are required",
    CATEGORY_POST_MUST_BE_AN_ARRAY:"Category_ids must be an Array",
    CATEGORY_POST_MUST_BE_ARRAY_AND_MIN_ONE_ELEMENT:"It must be an array, with at least one category",
    CATEGORY_VALUES_MUST_BE_INTEGERS_POSITIVE:"Category_ids values must be positive integers greater than 1",
    CATEGORY_LENGTH_BETWEEN:"Category_ids length must be between 1 and 50",
    CATEGORY_VALUES_MUST_BE_EXISTS:"Category_ids is required",
    PUBLISHED_VALUE_MUST_BE_BOOLEAN:"Published values must be a boolean",
    COMMENT_LIMIT_CHARACTERS:"Comment should be between 3 to 500 characters",
    QUERY_LIMIT_MUST_BE:"Query Value should be between 1 to 100",
    QUERY_PUBLISHED_MUST_BE_BOOLEAN:"Published value should be boolean",
    QUERY_TECHNOLOGY_MUST_BE_A_STRING:"Technology value should be a string"
});
module.exports={
    MESSAGES_VALIDATION
}