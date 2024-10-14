function unhandledError(err, req, res, next) {
  console.error("UNHANDLED ERROR", { err });

  res.status(500).send({ msg: "Something went wrong!" });
}

module.exports = unhandledError;
