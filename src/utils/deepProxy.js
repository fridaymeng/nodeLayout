function deepProxy (obj, callback) {
  return new Proxy(obj, {
    get: function(target, property) {
      return target[property];
    },
    set: function(target, property, value, receiver) {
      target[property] = value
      if (value.source) {
        callback(target);
      };
      return true;
    }
  });
}
export default deepProxy;