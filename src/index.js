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
  this.validations = [];
}

GlslTransitionValidator.createCanvas = function () {
  if (typeof window !== "undefined") return window.document.createElement("canvas");
  throw new Error('You must implement GlslTransitionThumbnail.createCanvas.');
};

GlslTransitionValidator.prototype = {
  forGlsl: function (glsl) {
    return this.addValidation(new GlslValidation(this, glsl));
  },
  addValidation: function (v) {
    this.validations.push(v);
    return v;
  },
  destroy: function () {
    if (this.identityTransition) this.identityTransition.destroy();
    // TODO destroy all sub-transitions
    for (var i=0; i<this.validations.length; ++i) {
      var v = this.validations[i];
      if (v.destroy) {
        v.destroy();
      }
    }
    this.validations = null;
  }
};

GlslTransitionValidator.validateUniform = ValidateUniform;

module.exports = GlslTransitionValidator;

