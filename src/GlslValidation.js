/**
 * GlslValidation handle validation of one GLSL Transition instance.
 */

var lazy = require("./lazy");
var validateUniform = require("./ValidateUniform");
var readPixels = require("./readPixels");
var readPixelsIdentity = require("./readPixelsIdentity");
var ndarrayDistance = require("ndarray-distance");

var ignoredUniforms = ["progress", "resolution", "from", "to"];

// Lazy functions to put in a GlslValidation
// Those are invariable values (function are computed once on demand)
var LazyPrototype = {

  /// Predicate functions
  compiles: function () {
    return this.compile().compiles;
  },

  fromImagePixels: function () {
    return readPixelsIdentity(this.validator, this.validator.fromImage);
  },
  toImagePixels: function () {
    return readPixelsIdentity(this.validator, this.validator.toImage);
  },

  /// Validation functions

  compile: function () {
    var source = this.glsl;
    this._uniforms = null;
    this._transition = null;
    var details, error, i, lineStr, line, lines, log, message, status, _i, _len;
    if (!source) {
      return { compiles: false };
    }
    try {
      var context = this.validator.Transition.getGL();
      var shader = context.createShader(context.FRAGMENT_SHADER);
      context.shaderSource(shader, source);
      context.compileShader(shader);
      status = context.getShaderParameter(shader, context.COMPILE_STATUS);
      if (!status) {
        log = context.getShaderInfoLog(shader);
      }
      context.deleteShader(shader);
    } catch (e) {
      return { compiles: false, line: 0, message: e.getMessage };
    }
    if (status === true) {
      try {
        this._transition = this.validator.Transition(source);
      }
      catch (e) {
        // Parse a glsl-parser error
        var msg = ''+(e.message || e);
        var r = msg.split(' at line ');
        if (r.length === 2) {
          var line = parseInt(r[1], 10); // FIXME the line seems to not take comment/#preprocessor into account
          return { compiles: false, line: line, message: r[0] };
        }
        else return { compiles: false, line: 0, message: msg };
      }
      this._uniforms = this._transition.getUniforms();
      return { compiles: true };
    } else {
      lines = log.split('\n');
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        i = lines[_i];
        if (i.substr(0, 5) === 'ERROR') {
          error = i;
        }
      }
      if (!error) {
        return { compiles: false, line: 0, message: 'Unknown error.' };
      }
      details = error.split(':');
      if (details.length < 4) {
        return { compiles: false, line: 0, message: error };
      }
      lineStr = details[2];
      line = parseInt(lineStr, 10);
      if (isNaN(line)) line = 0;
      message = details.splice(3).join(':');
      return { compiles: false, line: line, message: message };
    }
  },

  // Others
  transition: function () {
    this.compile();
    return this._transition;
  },

  uniforms: function () {
    this.compile();
    return this._uniforms;
  }
};

function GlslTransitionValidation (validator, glsl, uniforms) {
  this.validator = validator;
  this.glsl = glsl;
  for (var key in LazyPrototype) {
    this[key] = lazy(LazyPrototype[key], this);
  }
}
GlslTransitionValidation.prototype = {
  
  satisfyUniforms: function (userUniforms) {
    return this.validateUniforms(userUniforms).length === 0;
  },

  isValidFrom: function (userUniforms) {
    var expected = this.fromImagePixels();
    var result = this.pixelsFor(0, userUniforms);
    return this.samePixels(expected, result);
  },

  isValidTo: function (userUniforms) {
    var expected = this.toImagePixels();
    var result = this.pixelsFor(1, userUniforms);
    return this.samePixels(expected, result);
  },

  samePixels: function (a, b, tolerance) {
    var dist = ndarrayDistance(a, b);
    return dist <= (tolerance||0);
  },

  validateUniforms: function (userUniforms) {
    var uniformTypes = this.uniforms();
    var reasons = [];
    for (var key in userUniforms) {
      if (ignoredUniforms.indexOf(key) !== -1) {
        reasons.push({
          message: key+" uniform is not a user uniform.",
          reasonId: "UniformForbidden",
          uniformId: key
        });
      }
      else if (!(key in uniformTypes)) {
        reasons.push({
          message: key+" uniform doesn't exists.",
          reasonId: "UniformUnknown",
          uniformId: key
        });
      }
    }
    for (var key in uniformTypes) {
      if (ignoredUniforms.indexOf(key) === -1) {
        if (!(key in userUniforms)) {
          reasons.push({
            message: key+" uniform should be provided.",
            reasonId: "UniformNotProvided",
            uniformId: key
          });
        }
        else if (!validateUniform(uniformTypes[key], userUniforms[key])) {
          reasons.push({
            message: key+" uniform provided value doesn't suit the uniform type = "+uniformTypes[key],
            reasonId: "UniformTypeCheckFailed",
            uniformId: key
          });
        }
      }
    }
    return reasons;
  },

  destroy: function () {
    if (this._transition) this._transition.destroy();
    for (var key in this) {
      this[key] = null;
    }
  },

  pixelsFor: function (progress, uniforms) {
    var t = this.transition();
    var v = this.validator;
    t.load();
    t.bind();
    t.syncViewport();
    t.setUniform("from", v.fromImage);
    t.setUniform("to", v.toImage);
    if (uniforms) {
      for (var key in uniforms) {
        t.setUniform(key, uniforms[key]);
      }
    }
    t.setProgress(progress);
    t.draw();
    return readPixels(t.getGL(), v.width, v.height);
  }

};


module.exports = GlslTransitionValidation;