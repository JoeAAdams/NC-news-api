const { fetchUsers } = require("../Models/user_models")


exports.getUsers = (req,res,next) => {
    fetchUsers().then((users) => {
        res.status(200).send({users})
    })
}