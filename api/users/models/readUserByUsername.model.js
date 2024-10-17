const format = require("pg-format");
const db = require("../../../db/connection.js");

function readUserByUsername(username) {
  const sql = format(`SELECT * FROM users WHERE username = %L`, username);

  return db.query(sql).then((data) => {
    if (!data.rowCount) {
      return Promise.reject({ code: 404, msg: "User not found" });
    }

    return data.rows[0];
  });
}

module.exports = readUserByUsername;
