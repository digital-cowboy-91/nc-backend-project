exports.getLimit = (limit) => {
  let num = parseInt(limit);

  if (!num || num < 0) num = 5;
  if (num > 10) num = 10;

  return num;
};

exports.getOffset = (limit = 0, page) => {
  let num = parseInt(page);

  if (!num || num < 0) num = 1;

  return limit * num - limit;
};

exports.getPagination = (total = 0, limit = 1, offset = 0) => {
  const total_count = total;
  const current_page = Math.ceil((offset + limit) / limit);
  const total_pages = Math.ceil(total / limit);
  const next_page = current_page < total_pages ? current_page + 1 : null;
  const prev_page = current_page === 1 ? null : current_page - 1;

  return {
    total_count,
    current_page,
    total_pages,
    next_page,
    prev_page,
  };
};
