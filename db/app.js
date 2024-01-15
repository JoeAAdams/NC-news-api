const express = require('express');
const { getTopics } = require('./Controllers/topics _controllers');
const { getEndpoints } = require('./Controllers/util_controllers');
const { getArticlesById, getArticles } = require('./Controllers/articles_controllers');
const app = express();


app.get('/api', getEndpoints)

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticlesById)

app.use((err,req,res,next)=>{
    if (err.message && err.status){
        res.status(err.status).send({msg: err.message})
    }
    next(err)
})

module.exports = app;