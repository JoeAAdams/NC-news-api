const app = require("./app")

app.use((err,req,res,next) => {
    if(err.status && err.msg){
        res.status(err.status).send(err)
    }
})