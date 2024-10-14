function unhandledError(err, _req, res) {
  console.error(err);

  res.status(500).send({ msg: "Something went wrong!" });
}

module.exports = unhandledError;
