
module.exports = function arityForType (t) {
  if (t.indexOf("vec2") !== -1) return 2;
  if (t.indexOf("vec3") !== -1) return 3;
  if (t.indexOf("vec4") !== -1) return 4;
  if (t === "mat2") return 4;
  if (t === "mat3") return 9;
  if (t === "mat4") return 16;
  return 1;
};


