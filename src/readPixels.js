var ndarray = require("ndarray");

function readPixels (gl, width, height) {
  var pixels = new Uint8Array(width * height * 3);
  gl.readPixels(0, 0, width, height, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  return ndarray(pixels, [ height, width ]);
}

module.exports = readPixels;
