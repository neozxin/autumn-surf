// Usage: combineFns((x) => x + 2, (x) => x * 2, (x) => x * x)(3)  ::  100
function combineFns(...fns) {
  const combinedFn = (arg) => fns.reduce((res, fn) => fn(res), arg);
  return combinedFn;
}

// Usage: curryFn((a, b, c, d) => (a + b * c + d))(1)(3)(2)(4)  ::  11
function curryFn(fn) {
  const allArgs = [];
  const curriedFn = (...args) => {
    allArgs.push(...args);
    return allArgs.length < fn.length ? curriedFn : fn(...allArgs);
  };
  return curriedFn;
}

// Usage: combinePromises((x) => x * 2, (x) => new Promise((r) => setTimeout(() => r(x + 3), 3000)), (x) => x + 1)(3)  ::  10
function combinePromises(...pms) {
  const combinedPromise = (arg) =>
    pms.reduce((res, pm) => Promise.resolve(res).then(pm), arg);
  return combinedPromise;
}
