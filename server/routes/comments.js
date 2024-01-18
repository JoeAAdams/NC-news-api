const { deleteComment, patchCommentVotes } = require('../Controllers/comment_controllers');

const commentsRouter = require('express').Router();

commentsRouter
    .patch('/:comment_id', patchCommentVotes)
    .delete('/:comment_id', deleteComment)

module.exports = commentsRouter