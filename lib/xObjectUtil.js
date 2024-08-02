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
    async import(npmModuleKey, moduleType = "module") {
      const remoteDirPath = `https://unpkg.com/${npmModuleKey}/`;
      const packageJson = await (
        await fetch(`${remoteDirPath}package.json`)
      ).json();
      return await import(`${remoteDirPath}${packageJson[moduleType]}`);
    },
  };
})();

// xObjectUtil.propSetDetectionProxy(window, (window) => {
//   // paste test code here
//   window.adobe = 5;
//   window._satellite = 6;
// });
