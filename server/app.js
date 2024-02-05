const express = require("express");
const apiRouter = require("./routes/api");
const app = express();
const cors = require("cors");

app.use(cors())

app.use(express.json());

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
    if (err.msg && err.status) {
        res.status(err.status).send(err);
    }
    next(err);
});

app.use((err, req, res, next) => {
    if (err.code === "22P02" || "23502")
        res.status(400).send({ status: 400, msg: "Bad Request" });
});
module.exports = app;
