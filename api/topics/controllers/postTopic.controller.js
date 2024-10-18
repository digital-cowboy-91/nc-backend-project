const createTopic = require("../models/createTopic.model");

function postTopic(req, res, next) {
  const { body } = req;

  return createTopic(body)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => next(err));
}

module.exports = postTopic;
