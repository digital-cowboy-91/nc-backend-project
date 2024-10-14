const express = require("express");
const getHealthCheck = require("./api/controllers/getHealthCheck");

const app = express();

app.get("/api/healthCheck", getHealthCheck);

module.exports = app;
