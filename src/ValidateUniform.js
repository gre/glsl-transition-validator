var arityForType = require("./arityForType");

function uniformTypeCheck (type, value) {
  if (type === "sampler2D") {
    return value === null || typeof value === "string";
  }
  var arity = arityForType(type);
  var isArray = Array.isArray(value); // FIXME We should accept native array too..
  if (arity !== (!isArray ? 1 : value.length)) {
    return false; // Invalid arity
  }
  // TODO More checks (bool / number)
  return true;
}

module.exports = function validateUniform (type, value) {
  return uniformTypeCheck(type, value);
};
