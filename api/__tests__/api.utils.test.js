const { getLimit, getOffset, getPagination } = require("../api.utils.js");

describe("getLimit", () => {
  test("returns [5] by default", () => {
    expect(getLimit()).toBe(5);
  });

  test("returns [input] when input is whole number between 1 - 10", () => {
    for (let i = 1; i <= 10; i++) {
      expect(getLimit(i)).toBe(i);
    }
  });

  test("returns [10] when input is 10+", () => {
    expect(getLimit(15)).toBe(10);
  });

  test("returns [5] for invalid input", () => {
    expect(getLimit(null)).toBe(5);
    expect(getLimit("hello")).toBe(5);
    expect(getLimit(true)).toBe(5);
    expect(getLimit({ a: 1 })).toBe(5);
  });
});

describe("getOffset", () => {
  test("returns [0] by default", () => {
    expect(getOffset()).toBe(0);
  });

  test("multiplies [limit] with [page - 1]", () => {
    expect(getOffset(3, 2)).toBe(3);
    expect(getOffset(5, 3)).toBe(10);
    expect(getOffset(7, 4)).toBe(21);
  });

  test("returns [0] for invalid limit and/or page", () => {
    expect(getOffset(5, null)).toBe(0);
    expect(getOffset(null, 5)).toBe(0);
  });
});

describe("getPagination", () => {
  test("returns objects with default values", () => {
    const actual = getPagination();
    const output = {
      total_count: 0,
      current_page: 1,
      total_pages: 0,
      next_page: null,
      prev_page: null,
    };

    expect(actual).toEqual(output);
  });

  test("[total_count] is value of [total] argument", () => {
    [3, 5, 7].forEach((num) => {
      const { total_count } = getPagination(num);

      expect(total_count).toBe(num);
    });
  });

  test("[total_pages] is quotient of [total] and [limit] arguments", () => {
    [
      [5, 1, 5],
      [10, 3, 4],
      [15, 5, 3],
    ].forEach(([total, limit, expected]) => {
      const { total_pages } = getPagination(total, limit);

      expect(total_pages).toBe(expected);
    });
  });

  test("[current_page] is quotient of [offset + limit] and [limit] arguments", () => {
    [
      [0, 1],
      [2, 2],
      [4, 3],
      [8, 5],
    ].forEach(([offset, expected]) => {
      const { current_page } = getPagination(10, 2, offset);

      expect(current_page).toBe(expected);
    });
  });

  test("[next_page] is one more then [current_page] or [null] if [current_page === total_pages]", () => {
    [
      [0, 2],
      [2, 3],
      [4, 4],
      [8, null],
    ].forEach(([offset, expected]) => {
      const { next_page } = getPagination(10, 2, offset);

      expect(next_page).toBe(expected);
    });
  });

  test("[prev_page] is one less then [current_page] or [null] if [current_page === 1]", () => {
    [
      [0, null],
      [2, 1],
      [4, 2],
      [8, 4],
    ].forEach(([offset, expected]) => {
      const { prev_page } = getPagination(10, 2, offset);

      expect(prev_page).toBe(expected);
    });
  });
});
