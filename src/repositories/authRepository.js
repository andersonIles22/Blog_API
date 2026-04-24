const db=require('../config/database')

const checkAuthor=async (author_id) => {
    const getAuthorPostQuery= await db.query(
        `
        SELECT EXISTS(
            SELECT 1 FROM users WHERE id=$1
        )
        `,
        [author_id]
    )
    return getAuthorPostQuery.rows[0].exists
}

module.exports={
    checkAuthor
}