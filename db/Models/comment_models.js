const db = require("../connection")

exports.fetchArticleComments = (id) => {
    return db.query(`SELECT * FROM comments WHERE article_id=$1 ORDER BY created_at DESC`,[id]).then(({rows}) => {
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