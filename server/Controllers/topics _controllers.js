const { fetchTopics, createTopic } = require("../Models/topics_models")

exports.getTopics = (req, res, next) => {
    fetchTopics().then((topics) => {
        res.status(200).send({topics})
    })
}

exports.postTopic = (req, res, next) => {

    createTopic(req.body).then((topic) => {
        res.status(201).send({topic})
    })
    .catch((err) => next(err))
}