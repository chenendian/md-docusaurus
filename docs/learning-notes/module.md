---
sidebar_position: 2
---

# Module 模块化

## 模块化历史

....

## requireJS(AMD)、seaJS(CMD)、commenJS(node.js)、esModule(webpack)

### requireJS(AMD)

#### AMD 简介

AMD 是 James Burke 觉得 commonJs 很好， 但是因为 commonJS 主要使用的场景是在 node.js 里面，并且 commonJS 是同步的，所以为了能够有一个方法解决前端模块化开发的问题，并且前端主要使用的场景是异步加载的。所以提出了 AMD 规范。

#### AMD Usage

```js
define(id?, depencies?, factory);

define('foo', ['utils', 'bar'], function(utils, bar) {
  utils.add(1, 2);
  return {
    name: 'foo'
  }
})
```

#### 实现一个符合 AMD 的 rj.js

> 只是核心能力作为实现，具体：https://requirejs.org/docs/api.html

1. 可以直接配置依赖路径

```js
rj.config({
  paths: {
    jquery: "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js",
  },
});

rj(["jquery"], function (jquery) {
  // ....
});
```

2. 加载模块

```js
// RequestJs('')
rj(["moduleA"], function (moduleA) {});
```

3. 定义模块

```js
rj("moduleA", [], function () {
  return "hello zhuawa!";
});
```

4. 行为

```js
// RequireJS
define("a", function () {
  console.log("a load");
  return {
    run: function () {
      console.log("a run");
    },
  };
});

define("b", function () {
  console.log("b load");
  return {
    run: function () {
      console.log("b run");
    },
  };
});

require(["a", "b"], function (a, b) {
  console.log("main run"); // 🔥
  a.run();
  b.run();
});

// a load
// b load
// main run
// a run
// b run
```

#### 总结：

从上面的代码中可以看到，当我们使用 require 的时候，会先执行依赖的模块，然后再执行 require 方法体内的东西，这也就是我们所说的依赖后置。并且因为 AMD 是为了在浏览器中使用的，所以 define 的方法是都是异步。

### seaJS(CMD)

#### CMD 简介

代表作玉伯大佬的 seaJS

#### Usage

```js
// sea.js
define("a", function (require, exports, module) {
  console.log("a load");
  exports.run = function () {
    console.log("a run");
  };
});

define("b", function (require, exports, module) {
  console.log("b load");
  exports.run = function () {
    console.log("b run");
  };
});

define("main", function (require, exports, module) {
  console.log("main load");
  var a = require("a");
  a.run();
  var b = require("b");
  b.run();
});

seajs.use('main')

// main run
// a load
// a run
// b load
// b run
```
#### 总结：

从上面的代码中可以看到，sea.js 的实现是在使用的时候才引用其它模块，更符合人对代码运行的期待


### Common.js 

####  CMJ 简介

commonJS 是同步的

文件是一个模块，私有。内置两个变量 module require (exports = module.exports)

一个引入一个导出，就构成了通信的基本结构

#### 需要注意的两个问题

1. 缓存，require 会缓存一下，所以

```js
// a.js
var name = 'morrain'
var age = 18
exports.name = name
exports.getAge = function(){
    return age
}
// b.js
var a = require('a.js')
console.log(a.name) // 'morrain'
a.name = 'rename'
var b = require('a.js')
console.log(b.name) // 'rename'
```

2. 引用拷贝还是值拷贝的问题(CMJ 是值拷贝)

```js
// a.js
var name = 'morrain'
var age = 18
exports.name = name
exports.age = age
exports.setAge = function(a){
    age = a
}
// b.js
var a = require('a.js')
console.log(a.age) // 18
a.setAge(19)
console.log(a.age) // 18
```

3. CommonJS 是运行时加载 / ESM 静态分析---编译时加载（多阶段，异步）
