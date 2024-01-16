const db = require("../connection")
const endpointsData = require ("../../endpoints.json")

exports.fetchEndpoints = () => {
    return endpointsData
}

exports.checkUserExists= (user) => {
    return db.query("SELECT * FROM users WHERE username = $1",[user]).then(({rows}) => {
        if( rows.length === 0) {
            return Promise.reject({status:404, msg: "User Not Found"})
        }
            
        return rows
    })
}
exports.checkArticleExists = (id) => {
    return db.query("SELECT * FROM articles WHERE article_id = $1",[id]).then(({rows}) => {
        if( rows.length === 0) {
            return Promise.reject({status:404, msg: "Article Not Found"})
        }
            
        return rows
    })
}

exports.checkTopicExists = (topic) => {
    return db.query("SELECT * FROM topics WHERE slug = $1",[topic]).then(({rows}) => {
        if( rows.length === 0) {
            return Promise.reject({status:404, msg: "Topic Not Found"})
        }           
        return rows
    })
}