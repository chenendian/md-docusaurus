(function (global) {
  const defaultOptions = {
    paths: "",
  };
  const DEFINE_DEPENCIES = new Map();

  let requireJS = (global.requireJS = {});

  // from CDN
  __import = (url) => {
    return new Promise((res, rej) => {
      System.import(url).then(res, rej);
    });
  };

  // normal script
  __load = (url) => {
    return new Promise((res, rej) => {
      const head = document.getElementsByTagName("head")[0];
      const node = document.createElement("script");
      node.type = "text/javascript";
      node.src = url;
      node.async = true;
      node.onload = res;
      node.onerror = rej;
      head.appendChild(node);
    });
  };

  // dep -> a -> a.js -> 'http:xxxx/xx/xx/a.js';
  const __getUrl = (dep) => {
    const p = location.pathname;
    return p.slice(0, p.lastIndexOf("/")) + "/" + dep + ".js";
  };

  /**
   * 引入外部依赖 js 地址
   * @param {*} options
   * @returns
   */
  requireJS.config = (options) => {
    return Object.assign(defaultOptions, options);
  };

  /**
   * 定义模块,触发的时机其实是 require 的时候，所以这个方法主要是收集定义的模块
   */
  global.define = (name, depencies, factory) => {
    DEFINE_DEPENCIES.set(name, { name, depencies, factory });
  };

  /**
   * 使用模块  触发加载依赖的方法
   */
  global.require = (deps, factory) => {
    return Promise.all(
      deps.map((define) => {
        if (defaultOptions.paths[define]) {
          return __import(defaultOptions.paths[define]);
        }
        return __load(__getUrl(define)).then(() => {
          const { depencies, factory } = DEFINE_DEPENCIES.get(define);
          if (depencies.length === 0) return factory(null);
          return global.require(depencies, factory);
        });
      })
    ).then((res) => {
      // res 返回的是promise.all 里面数组的结果
      return factory(...res);
    });
  };
})(window);
