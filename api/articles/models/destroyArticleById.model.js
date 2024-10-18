const format = require("pg-format");
const db = require("../../../db/connection.js");

function destroyArticleById(id) {
  const sql = format(`DELETE FROM comments WHERE article_id = %L`, id);
  console.log(sql);

  return db.query(sql).then((data) => {
    if (!data.rowCount) {
      return Promise.reject({ code: 404, msg: "Article not found" });
    }
  });
}

module.exports = destroyArticleById;
