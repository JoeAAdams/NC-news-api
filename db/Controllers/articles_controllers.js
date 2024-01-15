const { fetchArticlesById, fetchArticles, fetchArticleComments } = require("../Models/article_models")

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

exports.getArticleComments = (req,res,next) => {
    const { article_id } = req.params
    fetchArticleComments(article_id).then((comments) => {
        res.status(200).send({ comments })
    })
    .catch((err) => next(err))
}