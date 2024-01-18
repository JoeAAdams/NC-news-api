const { fetchUsers, fetchUsersByUsername } = require("../Models/user_models")


exports.getUsers = (req,res,next) => {
    fetchUsers().then((users) => {
        res.status(200).send({users})
    })
}

exports.getUserByUsername = (req,res,next) => {

    const { username } = req.params
    fetchUsersByUsername(username).then((user) => {
        res.status(200).send({user})
    })
    .catch((err) => next(err))
}