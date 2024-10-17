const readUserByUsername = require("../models/readUserByUsername.model");

function getUserByUsername(req, res, next) {
  const { username } = req.params;

  return readUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => next(err));
}

module.exports = getUserByUsername;
