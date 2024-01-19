const { getTopics, postTopic } = require('../Controllers/topics _controllers');

const topicsRouter = require('express').Router();

topicsRouter
    .get('/', getTopics)
    .post('/', postTopic)

module.exports = topicsRouter