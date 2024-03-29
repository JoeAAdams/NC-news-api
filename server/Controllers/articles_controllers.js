const { fetchArticlesById, fetchArticles,  updateArticleVotes, createArticle } = require("../Models/article_models")
const { checkArticleExists, checkTopicExists } = require("../Models/util_models")

exports.getArticles = (req,res,next) => {
    const queries = { topic, sort_by, order } = req.query
    let topicExistsQuery = true //Makes Promise.all pass when no topic 
    if (topic) {
        topicExistsQuery = checkTopicExists(topic)
    }
    const articleQuery = fetchArticles(queries)
    Promise.all([articleQuery,topicExistsQuery])
    .then((response) => {
        const articles = response[0]
        res.status(200).send({articles})
    })
    .catch((err) => next(err))
}

exports.getArticlesById = (req,res,next) => {
    const { article_id } = req.params
    fetchArticlesById(article_id).then((article) => {
        res.status(200).send({ article })
    })
    .catch((err) => next(err))
}

exports.patchArticleVotes = (req,res,next) => {
    const { article_id } = req.params
    const { inc_votes } = req.body
    const articleExistsQuery = checkArticleExists(article_id) 
    const articleVotesQuery = updateArticleVotes(article_id,inc_votes)
    Promise.all([articleVotesQuery,articleExistsQuery])
    .then((response) => {
        article = response[0]
        res.status(200).send({ article })
    })
    .catch((err) => next(err))
}

exports.postArticle = (req,res,next) => {
    const post = req.body
    createArticle(post).then((article) => {
        res.status(201).send({article})
    })
    .catch((err) => next(err))
}