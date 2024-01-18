const { getUsers, getUserByUsername } = require('../Controllers/user_controllers');

const usersRouter = require('express').Router();

usersRouter
    .get('/',getUsers)

usersRouter
    .get('/:username', getUserByUsername)

module.exports = usersRouter