const db = require("../connection")
const endpointsData = require ("../../endpoints.json")

exports.fetchEndpoints = () => {
    return endpointsData
}