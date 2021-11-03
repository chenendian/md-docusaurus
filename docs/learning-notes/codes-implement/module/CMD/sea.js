// define("main", function (require, exports, module) {
//   console.log("main load");
//   var a = require("a");
//   a.run();
//   var b = require("b");
//   b.run();
// });

// seajs.use('main')

(function (global) {
  seajs = global.seajs = {};
  const EXPORTS = (global.EXPORTS = {});
  const MODULES = (global.MODULES = {});

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

  /** 通过方法获取依赖 */
  function getDepsByFn(fn) {
    let fnString = fn.toString();
    let matches = [];
    // require('a ')
    //1. (?:require\() -> require(  -> (?:) 非捕获性分组
    //2. (?:['"]) -> require('
    //3. ([^'"]+) -> a -> 避免回溯 -> 回溯 状态机
    let reg = /(?:require\()(?:['"])([^'"]+)(?:\))/g;
    let val = null;
    while ((val = reg.exec(fnString)) !== null) {
      reg.lastIndex;
      matches.push(val);
    }
    return matches;
  }

  /** 通过模块名 获取模块所在的url */
  function getUrl(name) {
    let url = location.pathname;
    return url.slice(0, url.lastIndexOf("/")) + "/" + name + ".js";
  }

  /** 储存依赖 */
  global.define = (name, factory) => {
    // 获取这个模块的url
    const url = getUrl(name);
    // 获取依赖 deps
    const deps = getDepsByFn(factory);
    if (!MODULES[name]) {
      MODULES[name] = { url, name, deps, factory };
    }
  };

  // 导出的方法
  __exports = (name) => EXPORTS[name] || (EXPORTS[name] = {});

  const __module = this;

  // require 方法
  __require = (name) => {
    // 调用 require 里面的方法
    return __load(getUrl(name)).then((res) => {
      let module = MODULES[name];
      if (module.deps && module.deps.length > 0) {
        return seajs.use(module.deps, module.factory);
      } else {
        module.factory(__require, __exports(name), __module);
        return __exports(name);
      }
    });  
  };

  /** 使用模块 */
  seajs.use = (mods, cb) => {
    let modules = Array.isArray(mods) ? mods : [mods];
    return Promise.all(
      modules.map((module) => {
        return __load(getUrl(module)).then(() => {
          let data = MODULES[module];
          console.log(MODULES, module, data);
          return data.factory(__require, __exports(module), __module);
        });
      })
    ).then((res) => {
      console.log(11111, res);
      cb && cb(...res);
    });
  };
})(window);
