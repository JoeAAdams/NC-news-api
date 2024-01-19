const db = require("../../db/connection")

exports.fetchArticleComments = (id,{limit=10,p=1}) => {
    if(/\D/.test(limit) || /\D/.test(p)) return Promise.reject({status: 400, msg: "Bad Request"})
    return db.query(`
    SELECT * FROM comments 
    WHERE article_id=$1 
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${(p -1) * 5}`,[id]).then(({rows}) => {
        return rows
    })
}

exports.createArticleComment = (id,comment) => {
    return db.query(`
    INSERT INTO comments (author,body,article_id)
    VALUES ($1,$2,$3)
    RETURNING body`,[comment.username,comment.body,id])
    .then(({rows}) => rows[0].body)
}

exports.removeComment = (id) => {
    return db.query(`
    DELETE FROM comments WHERE comment_id = $1`,[id])
}

exports.updateCommentVotes = (id,newVote) => {
    return db.query(`
    UPDATE comments
    SET  votes = votes + $1
    WHERE comment_id = $2
    RETURNING *`,[newVote,id])
    .then(({rows}) => {
        if( rows.length === 0) return Promise.reject({status:404, msg: "Not Found"})
        return rows
    })
}