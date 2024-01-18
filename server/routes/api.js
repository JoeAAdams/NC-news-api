const articleRouter = require('./articles');
const apiRouter = require('express').Router();
const { getEndpoints } = require('../Controllers/util_controllers');
const topicsRouter = require('./topics');
const commentsRouter = require('./comments');
const usersRouter = require('./users');

apiRouter.get('/', getEndpoints)

apiRouter.use('/articles', articleRouter)

apiRouter.use('/topics', topicsRouter)

apiRouter.use('/comments', commentsRouter)

apiRouter.use('/users', usersRouter)
module.exports = apiRouter;