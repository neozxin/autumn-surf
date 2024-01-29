export const xObjectUtil = (() => {
  return {
    propSetDetectionProxy(
      targetObject,
      testFunc = (proxiedObject) => proxiedObject,
      handler = (target, prop, value) =>
        console.log(
          "监测到 prop 设置:",
          target,
          `prop ${prop}`,
          "value as",
          value,
        ),
    ) {
      const proxiedObject = new Proxy(targetObject, {
        set: (target, prop, value) => {
          handler(target, prop, value);
          target[prop] = value;
          return true;
        },
      });
      testFunc(proxiedObject);
      return proxiedObject;
    },
  };
})();

// xObjectUtil.propSetDetectionProxy(window, (window) => {
//   // paste test code here
//   window.adobe = 5;
//   window._satellite = 6;
// });
