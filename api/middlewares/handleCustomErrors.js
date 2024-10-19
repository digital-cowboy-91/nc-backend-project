function handleCustomErrors(err, req, res, next) {
  const { code, msg } = err;

  if (code && msg) {
    res.status(code).send({ msg });
  } else {
    next(err);
  }
}

module.exports = handleCustomErrors;
