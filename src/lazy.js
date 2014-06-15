
module.exports = function lazy (f, ctx) {
  var result;
  return function () {
    if (arguments.length !== 0) throw new Error("a lazy function cannot have arguments otherwise it is not invariant.");
    if (result === undefined) {
      result = f.call(ctx);
    }
    return result;
  };
}
