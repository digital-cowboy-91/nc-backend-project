const format = require("pg-format");
const db = require("../../db/connection.js");

function destroyComment(id) {
  const sql = format(`DELETE FROM comments WHERE comment_id = %L`, id);

  return db.query(sql).then((data) => {
    if (!data.rowCount) {
      return Promise.reject({ code: 404, msg: "Comment not found" });
    }
  });
}

module.exports = destroyComment;
