const express = require('express')
const articleRouter = express.Router()
const { getArticlesById, getArticles, patchArticleVotes, postArticle } = require('../Controllers/articles_controllers');
const { postArticleComment, getArticleComments } = require('../Controllers/comment_controllers');

articleRouter
    .get('/', getArticles)
    .post('/', postArticle)

articleRouter
    .get('/:article_id', getArticlesById)
    .patch('/:article_id', patchArticleVotes)

articleRouter
    .get('/:article_id/comments', getArticleComments)
    .post('/:article_id/comments',postArticleComment)

module.exports = articleRouter
