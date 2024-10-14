function getHealthCheck(req, res, next) {
  res.status(200).send({ msg: "Alive!" });
}

module.exports = getHealthCheck;
