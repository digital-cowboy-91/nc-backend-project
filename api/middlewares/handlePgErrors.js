function handlePGErrors(err, req, res, next) {
  const { code } = err;

  switch (code) {
    case "22P02":
      res.status(400).send({ msg: "Received invalid type" });
      break;
    case "23502":
      res
        .status(400)
        .send({ msg: "Received null or undefined required element" });
      break;
    case "23503":
      res.status(400).send({ msg: "Received invalid reference value" });
      break;
    default:
      next(err);
      break;
  }
}

module.exports = handlePGErrors;
