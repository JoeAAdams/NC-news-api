const db = require("../../db/connection")

exports.fetchTopics = () => {
    const query = `
    SELECT * FROM topics`
    return db.query(query).then(({rows}) => rows)
}

exports.createTopic = (topic) => {
    if(!topic.slug || !topic.description) return Promise.reject({status: 400, msg: 'Bad Request'})

    return db.query(`
    INSERT INTO topics (slug,description)
    VALUES ($1,$2)
    RETURNING *`,[topic.slug,topic.description])
    .then(({rows}) => rows[0])
}