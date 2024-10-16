exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

exports.customSort = (arr, property, order, convertTo) => {
  let res = true;

  arr?.reduce((prev, item, index) => {
    let current = item[property];

    if (convertTo === "time") {
      current = new Date(current).getTime();
    }

    if (!index) return current;

    if (order === "DESC") {
      prev >= current || (res = false);
    } else {
      prev <= current || (res = false);
    }

    return current;
  }, undefined);

  return res;
};
