const express = require("express");

const apiRoot = require("./api/root.router");
const articles = require("./api/articles/articles.router");
const comments = require("./api/comments/comments.router");
const topics = require("./api/topics/topics.router");
const users = require("./api/users/users.router");

const unhandledError = require("./api/middlewares/unhandledError");
const handlePGErrors = require("./api/middlewares/handlePgErrors");
const handleCustomErrors = require("./api/middlewares/handleCustomErrors");

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
