const db = require("../../db/connection.js");

function readUsers() {
  const sql = `
    SELECT * FROM users;
    `;
  return db.query(sql).then((data) => data.rows);
}

module.exports = readUsers;
