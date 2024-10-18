const { getLimit, getOffset, getPagination } = require("../api-utils.js");

describe("getLimit", () => {
  test("5: by default", () => {
    expect(getLimit()).toBe(5);
  });

  test("input: when input is whole number between 1 - 10", () => {
    for (let i = 1; i <= 10; i++) {
      expect(getLimit(i)).toBe(i);
    }
  });

  test("10: when input is 10+", () => {
    expect(getLimit(15)).toBe(10);
  });

  test("5: when input is any other value", () => {
    expect(getLimit(null)).toBe(5);
    expect(getLimit("hello")).toBe(5);
    expect(getLimit(true)).toBe(5);
    expect(getLimit(0.6)).toBe(5);
    expect(getLimit({ a: 1 })).toBe(5);
  });
});

describe("getOffset", () => {
  test("0: by default", () => {
    expect(getOffset()).toBe(0);
  });

  test("5: limit=5, page=2", () => {
    expect(getOffset(5, 2)).toBe(5);
  });

  test("45: limit=5, page=10", () => {
    expect(getOffset(5, 10)).toBe(45);
  });

  test("0: page is any other value", () => {
    expect(getOffset(5, null)).toBe(0);
    expect(getOffset(5, "hello")).toBe(0);
    expect(getOffset(5, true)).toBe(0);
    expect(getOffset(5, 0.6)).toBe(0);
    expect(getOffset(5, { a: 1 })).toBe(0);
  });
});

describe("getPagination", () => {
  test("total_count=0: by default", () => {
    const { total_count } = getPagination();

    expect(total_count).toBe(0);
  });

  test("total_count=5: count=5", () => {
    const { total_count } = getPagination(5);

    expect(total_count).toBe(5);
  });

  test("current_page=1: by default", () => {
    const { current_page } = getPagination();

    expect(current_page).toBe(1);
  });

  test("current_page=3: total=15, limit=3, offset=6", () => {
    const { current_page } = getPagination(15, 3, 6);

    expect(current_page).toBe(3);
  });

  test("total_pages=0: by default", () => {
    const { total_pages } = getPagination();

    expect(total_pages).toBe(0);
  });

  test("total_pages=5: total=15, limit=3", () => {
    const { total_pages } = getPagination(15, 3);

    expect(total_pages).toBe(5);
  });

  test("prev_page=null: by default", () => {
    const { prev_page } = getPagination();

    expect(prev_page).toBe(null);
  });

  test("prev_page=2: total=15, limit=3, offset=6", () => {
    const { prev_page } = getPagination(15, 3, 6);

    expect(prev_page).toBe(2);
  });

  test("next_page=null: by default", () => {
    const { next_page } = getPagination();

    expect(next_page).toBe(null);
  });

  test("next_page=4: total=15, limit=3, offset=6", () => {
    const { next_page } = getPagination(15, 3, 6);

    expect(next_page).toBe(4);
  });

  test("next_page=null: when reached last page", () => {
    const { next_page } = getPagination(15, 3, 12);

    expect(next_page).toBe(null);
  });
});
