const { getTopics } = require('../Controllers/topics _controllers');

const topicsRouter = require('express').Router();

topicsRouter
    .get('/', getTopics)

module.exports = topicsRouter