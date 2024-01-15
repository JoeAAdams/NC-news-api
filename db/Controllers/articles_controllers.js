const { fetchArticlesById } = require("../Models/article_models")


exports.getArticlesById = (req,res,next) => {
    const { article_id } = req.params
    fetchArticlesById(article_id).then((article) => {
        console.log(article)
        res.status(200).send({ article })
    })
    .catch((err) => next(err))
}