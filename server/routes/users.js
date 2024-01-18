const { getUsers } = require('../Controllers/user_controllers');

const usersRouter = require('express').Router();

usersRouter
    .get('/',getUsers)

module.exports = usersRouter