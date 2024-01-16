const { fetchArticleComments, createArticleComment, removeComment } = require("../Models/comment_models")
const { checkUserExists, checkArticleExists } = require("../Models/util_models")

exports.getArticleComments = (req,res,next) => {
    const { article_id } = req.params
    fetchArticleComments(article_id).then((comments) => {
        res.status(200).send({ comments })
    })
    .catch((err) => next(err))
}

exports.postArticleComment = (req,res,next) => {
    const { article_id } = req.params
    const userComment = req.body
    const userExistsQuery = checkUserExists(userComment.username)
    const articleExistsQuery = checkArticleExists(article_id)
    const createArticleQuery = createArticleComment(article_id,userComment)
    Promise.all([createArticleQuery, userExistsQuery,articleExistsQuery])
    .then((response) => {
        const comment = response[0]
        res.status(201).send({ comment })
    })
    .catch((err) => next(err))
}

exports.deleteComment = (req,res,next) => {
    const { comment_id } = req.params
    removeComment(comment_id).then(() => {
        res.status(204).send()
    })
}