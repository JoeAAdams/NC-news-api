const db = require("../../db/connection")

exports.fetchArticles = ({topic, sort_by="created_at",order="desc",limit = 10, p=1}) => {
    const validSorts = ["title","topic","author","body","created_at","votes","article_img_url","comment_count"]
    const validOrders = ["asc","desc"]
    const args =[]

    if (!validSorts.includes(sort_by) || !validOrders.includes(order) || /\D/.test(limit) || /\D/.test(p)) {
        return Promise.reject({status: 400, msg: "Bad Request"})
    }
    
    let query = `
    SELECT articles.author, articles.title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id) AS comment_count FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id`
    
    if(topic) {
        query += ` WHERE topic = $1`
        args.push(topic)
    }
    
    query += `    
    GROUP BY articles.article_id
    ORDER BY articles.${sort_by} ${order}
    LIMIT ${limit} OFFSET ${(p -1) * limit}`;

    return db.query(query,args).then(({rows}) => rows)
}

    

exports.fetchArticlesById = (id) => {
    return db.query(`
    SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count FROM articles
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

exports.createArticle = (post) => {
    const params = [post.author,post.title,post.body,post.topic]
    let values = `$1,$2,$3,$4`
    let query =`INSERT INTO articles (author,title,body,topic`
    if(post.article_img_url) { //adds new paramter and value if article_img_url is provided
        params.push(post.article_img_url)
        query += `, article_img_url`
        values += `,$5`
    }
    query += `)
    VALUES (${values})
    RETURNING article_id`
    return db.query(query,params)
    .then(({rows}) => this.fetchArticlesById(rows[0].article_id).then((data) => data[0]))
}

exports.removeArticle = (id) => {
    return db.query(`
    DELETE FROM articles WHERE article_id = $1`,[id])
}