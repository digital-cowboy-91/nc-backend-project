const express = require("express");

const apiRoot = require("./api/router");
const articles = require("./api/articles/router");
const comments = require("./api/comments/router");
const topics = require("./api/topics/router");
const users = require("./api/users/router");

const unhandledError = require("./api/_middlewares/unhandledError");
const handlePGErrors = require("./api/_middlewares/handlePgErrors");
const handleCustomErrors = require("./api/_middlewares/handleCustomErrors");

const app = express();

app.use(express.json());

app.use(apiRoot);
app.use(articles);
app.use(comments);
app.use(topics);
app.use(users);

app.use(handlePGErrors);
app.use(handleCustomErrors);
app.use(unhandledError);

module.exports = app;
