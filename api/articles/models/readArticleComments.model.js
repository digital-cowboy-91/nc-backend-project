const format = require("pg-format");
const db = require("../../../db/connection.js");
const { getLimit, getOffset, getPagination } = require("../../api.utils.js");

function readArticleComments(article_id, query) {
  const limit = getLimit(query.limit);
  const offset = getOffset(limit, query.page);

  const LIMIT = format(`LIMIT %s OFFSET %s`, limit, offset);

  const SELECT = format(
    `SELECT * FROM comments WHERE article_id = %s ORDER BY created_at DESC`,
    article_id
  );

  const sqlMain = [SELECT, LIMIT].filter((s) => s).join(" ");
  const sqlCount = format(
    `SELECT COUNT(*)::INT FROM comments WHERE article_id = %L`,
    article_id
  );

  const promises = [db.query(sqlCount), db.query(sqlMain)];

  return Promise.all(promises).then(([count, main]) => {
    const pagination = getPagination(count.rows[0].count, limit, offset);

    return {
      pagination,
      comments: main.rows,
    };
  });
}

module.exports = readArticleComments;
