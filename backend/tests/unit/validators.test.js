const { isValidChar10, toNumber } = require("../../src/utils/validators");

test("isValidChar10", () => {
  expect(isValidChar10("1234567890")).toBe(true);
  expect(isValidChar10("123")).toBe(false);
});

test("toNumber", () => {
  expect(toNumber("10.5")).toBe(10.5);
  expect(toNumber(10)).toBe(10);
  expect(toNumber("abc")).toBe(null);
});