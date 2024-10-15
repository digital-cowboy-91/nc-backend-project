const format = require("pg-format");
const db = require("../../db/connection.js");

function updateArticleVote(id, incVotes) {
  if (typeof incVotes !== "number") {
    return Promise.reject({
      code: 400,
      msg: "Element 'inc_votes' has invalid type",
    });
  } else if (!Number.isInteger(incVotes)) {
    return Promise.reject({
      code: 400,
      msg: "Invalid 'inc_votes', expected whole number",
    });
  }

  const sql = format(
    `
    UPDATE articles
        SET votes = votes + %s
        WHERE article_id = %L
        RETURNING *;
  `,
    incVotes,
    id
  );

  return db.query(sql).then((data) => data.rows[0]);
}

module.exports = updateArticleVote;
