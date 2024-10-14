const format = require("pg-format");
const db = require("../../db/connection.js");

function readArticleById(id) {
  const sql = format(`SELECT * FROM articles WHERE article_id = %L`, id);

  return db.query(sql).then((data) => {
    if (data.rowCount === 0) {
      return Promise.reject({ code: 404, msg: "Article does not exist" });
    }

    return data.rows[0];
  });
}

module.exports = readArticleById;
