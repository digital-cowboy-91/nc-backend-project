const readUsers = require("../models/readUsers.model");

function getUsers(req, res, next) {
  return readUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => next(err));
}

module.exports = getUsers;
