const { fetchEndpoints } = require("../Models/util_models")

exports.getEndpoints = (req, res, next) => {

    const endpoints = fetchEndpoints()
  
    res.status(200).send({endpoints})

}