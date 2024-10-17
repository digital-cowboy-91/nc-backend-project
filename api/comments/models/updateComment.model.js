const db = require("../../../db/connection.js");
const format = require("pg-format");

function updateComment(id, body) {
  const { inc_votes } = body;

  if (!Number.isInteger(inc_votes)) {
    return Promise.reject({ code: 400, msg: "Invalid type of inc_votes" });
  }
  const sql = format(
    `
    UPDATE comments
        SET votes = votes + %s
        WHERE comment_id = %L
        RETURNING *
    `,
    inc_votes,
    id
  );

  return db.query(sql).then((data) => {
    if (!data.rowCount) {
      return Promise.reject({ code: 404, msg: "Comment not found" });
    }

    return data.rows[0];
  });
}

module.exports = updateComment;
