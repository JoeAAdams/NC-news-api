const express = require('express');
const { getTopics } = require('./Controllers/topics _controllers');
const { getEndpoints } = require('./Controllers/util_controllers');
const { getArticlesById, getArticles, patchArticleVotes } = require('./Controllers/articles_controllers');
const { postArticleComment, getArticleComments } = require('./Controllers/comment_controllers');
const app = express();

app.use(express.json())

//GET
app.get('/api', getEndpoints)

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticlesById)

app.get('/api/articles/:article_id/comments', getArticleComments)

//POST
app.post('/api/articles/:article_id/comments',postArticleComment)

//PATCH
app.patch('/api/articles/:article_id', patchArticleVotes)

app.use((err,req,res,next)=>{
    if (err.msg && err.status){
        res.status(err.status).send(err)
    }
    next(err)
})

app.use((err,req,res,next) => {
if(err.code === '22P02' || '23502') res.status(400).send({status:400, msg: "Bad Request"})
})
module.exports = app;