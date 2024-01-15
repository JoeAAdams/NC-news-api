const express = require('express');
const { getTopics } = require('./Controllers/topics _controllers');
const { getEndpoints } = require('./Controllers/util_controllers');
const app = express();


app.get('/api', getEndpoints)

app.get('/api/topics', getTopics);

app.use((err,req,res,next)=>{
    if (err.message && err.status){
        res.status(err.status).send({msg: err.message})
    }
    next(err)
})

module.exports = app;