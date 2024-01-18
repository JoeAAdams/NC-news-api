const { deleteComment } = require('../Controllers/comment_controllers');

const commentsRouter = require('express').Router();

commentsRouter
    .delete('/:comment_id', deleteComment)

module.exports = commentsRouter