function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidChar10(value) {
  // code é CHAR(10) no banco. Exigimos exatamente 10 chars.
  return typeof value === "string" && value.length === 10;
}

function toNumber(value) {
  // aceita number ou string numérica
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function assert(condition, message, statusCode = 400) {
  if (!condition) throw Object.assign(new Error(message), { statusCode });
}

module.exports = {
  isNonEmptyString,
  isValidChar10,
  toNumber,
  assert,
};