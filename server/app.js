const express = require('express');
const { getTopics } = require('./Controllers/topics _controllers');
const { getEndpoints } = require('./Controllers/util_controllers');
const { getArticlesById, getArticles, patchArticleVotes } = require('./Controllers/articles_controllers');
const { postArticleComment, getArticleComments, deleteComment } = require('./Controllers/comment_controllers');
const { getUsers } = require('./Controllers/user_controllers');
const apiRouter = require('./routes/api');
const app = express();
const router = express.Router()

app.use(express.json())

app.use('/api', apiRouter)


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