/**
 * A GLSL Transition Validator
 *
 * some part has been inspired from https://github.com/BKcore/Shdr/blob/master/sources/shdr/Validator.js
 * MIT License - Copyright (c) 2013 Thibaut Despoulain (BKcore)
 */

var GlslTransitionCore = require("glsl-transition-core");
var GlslValidation = require("./GlslValidation");
var ValidateUniform = require("./ValidateUniform");

var domCreateCanvas = function () {
  return window.document.createElement("canvas");
};

function GlslTransitionValidator (fromImage, toImage, width, height, tolerance) {
  if (arguments.length < 2) throw new Error("you must provide at least fromImage and toImage to the Validator.");
  if (typeof window !== "undefined" && typeof createCanvas !== "function") throw new Error("You must provide 'createCanvas' as a way to create a Canvas element.");
  this.fromImage = fromImage;
  this.toImage = toImage;
  this.tolerance = typeof tolerance === "undefined" ? 0.02 : tolerance;
  this.createCanvas = GlslTransitionValidator.createCanvas;
  this.width = width || 32;
  this.height = height || 16;
  this.canvas = this.createCanvas();
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.Transition = GlslTransitionCore(this.canvas);
}

GlslTransitionValidator.createCanvas = function () {
  if (typeof window !== "undefined") return window.document.createElement("canvas");
  throw new Error('You must implement GlslTransitionThumbnail.createCanvas.');
};

GlslTransitionValidator.prototype = {
  forGlsl: function (glsl) {
    return new GlslValidation(this, glsl);
  },
  destroy: function () {
    if (validator.identityTransition) validator.identityTransition.destroy();
    // TODO destroy all sub-transitions
  }
};

GlslTransitionValidator.validateUniform = ValidateUniform;

module.exports = GlslTransitionValidator;

