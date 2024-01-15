const db = require("../connection")

exports.fetchTopics = () => {
    const query = `
    SELECT * FROM topics`
    return db.query(query).then(({rows}) => rows)
}