const endpoints = require("../../endpoints.json");

function getApi(_req, res) {
  res.status(200).send({ endpoints });
}

module.exports = getApi;
