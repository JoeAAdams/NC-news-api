const db = require("../connection")

exports.fetchArticles = () => {
    return db.query(`
    SELECT articles.author, articles.title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id) AS comment_count FROM articles
    JOIN comments ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC
    `).then(({rows}) => rows)
}

exports.fetchArticlesById = (id) => {
    return db.query(`SELECT * FROM articles WHERE article_id=$1`,[id]).then(({rows}) => {
        if(rows.length === 0) return Promise.reject({status: 404, msg: "Not Found"})
        return rows
    })
}
