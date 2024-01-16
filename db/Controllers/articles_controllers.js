const { fetchArticlesById, fetchArticles,  updateArticleVotes } = require("../Models/article_models")
const { checkArticleExists } = require("../Models/util_models")

exports.getArticles = (req,res,next) => {
    fetchArticles().then((articles) => {
        res.status(200).send({articles})
    })
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