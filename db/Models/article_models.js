const db = require("../connection")

exports.fetchArticles = (topic) => {
    const args =[]
    let query = `
    SELECT articles.author, articles.title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id) AS comment_count FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id`
    
    if(topic) {
        query += ` WHERE topic = $1`
        args.push(topic)
    }
    query += `    
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC
    `
    return db.query(query,args).then(({rows}) => rows)
}

    

exports.fetchArticlesById = (id) => {
    return db.query(`
    SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id 
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
    ORDER BY articles.article_id ASC
    `,[id]).then(({rows}) => {
        if(rows.length === 0) return Promise.reject({status: 404, msg: "Not Found"})
        return rows
    })
}

exports.updateArticleVotes = (id,newVote) => {
    return db.query(`
    UPDATE articles
    SET  votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,[newVote,id])
    .then(({rows}) => rows)
}