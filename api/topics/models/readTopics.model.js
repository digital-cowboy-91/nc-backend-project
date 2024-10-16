const db = require("../../../db/connection.js");

function readTopics() {
  return db.query(`SELECT * FROM topics`).then((data) => data.rows);
}

module.exports = readTopics;
