const express = require("express");

const unhandledError = require("./api/middlewares/unhandledError");

const getHealthCheck = require("./api/controllers/getHealthCheck");
const getTopics = require("./api/controllers/getTopics.controller");
const getApi = require("./api/controllers/getApi.controller");

const app = express();

app.get("/api/healthCheck", getHealthCheck);

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.use(unhandledError);

module.exports = app;
