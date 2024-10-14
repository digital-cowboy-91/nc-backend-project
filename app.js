const express = require("express");

const unhandledError = require("./api/middlewares/unhandledError");

const getHealthCheck = require("./api/controllers/getHealthCheck");
const getTopics = require("./api/controllers/getTopics.controller");
const getApi = require("./api/controllers/getApi.controller");
const getArticleById = require("./api/controllers/getArticleById.controller");
const handlePGErrors = require("./api/middlewares/handlePgErrors");
const handleCustomErrors = require("./api/middlewares/handleCustomErrors");
const getArticles = require("./api/controllers/getArticles.controller");

const app = express();

app.get("/api/healthCheck", getHealthCheck);

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.use(handlePGErrors);
app.use(handleCustomErrors);
app.use(unhandledError);

module.exports = app;
