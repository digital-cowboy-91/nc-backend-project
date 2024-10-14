function handlePGErrors(err, req, res, next) {
  const { code } = err;

  switch (code) {
    case "22P02":
      res.status(400).send({ msg: "Received invalid type" });
      break;
    default:
      next(err);
      break;
  }
}

module.exports = handlePGErrors;
