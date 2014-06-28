var ndarray = require("ndarray");

function readPixels (gl, width, height) {
  var pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return ndarray(pixels, [ height, width, 4 ]);
}

module.exports = readPixels;
