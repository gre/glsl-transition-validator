
var GlslTransitionCore = require("glsl-transition-core");
var readPixels = require("./readPixels");

var GLSL_IDENTITY_FROM = "#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\nvoid main() {vec2 p = gl_FragCoord.xy / resolution.xy;gl_FragColor = texture2D(from, p);}";

/**
 * Returns pixels of an images piped through the GLSL pipeline (so we can be ~ pixel perfect).
 */

function readPixelsIdentity (validator, image) {
  if (!validator.identityTransition) { 
    validator.identityTransition = validator.Transition(GLSL_IDENTITY_FROM);
  }
  var transition = validator.identityTransition;
  transition.load();
  transition.bind();
  transition.setUniform("from", image);
  transition.syncViewport();
  transition.setProgress(0);
  transition.draw();
  return readPixels(transition.getGL(), validator.width, validator.height);
};

module.exports = readPixelsIdentity;
