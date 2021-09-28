---
sidebar_position: 1
---

# Study Vue

## vue 的核心类库

1. Obersever 初始化数据的 getter 和 setter 方法， 进行数据的 _依赖收集_ 和 _派发更新_
2. Dep 每个响应式对象都会有一个 dep 实例，每个实例都有 dep.subs = watcher[],进行依赖收集，dep.notice 进行派发更新
3. Watch 包含 user watcher, computer watcher 和 render watcher。每个 watcher 实例都有一个 update 方法

## 手写一个简单的 vue

1. 新建一个类 Vue 包含 el、data、methods 属性，并判断传入的数据是否正确。

```js
export default class Vue {
  constructor(options = {}) {
    this.$el = null;
    this.$options = options;
    this.$data = options.data;
    this.$methods = options.methods;
    this.initRootElement(options);
  }
  /**
   * 初始化根元素
   * @param {*} options
   */
  initRootElement(options) {
    const el = options.el;
    if (typeof el === "string") {
      this.$el = document.querySelector(el);
    }
    if (el instanceof HTMLElement) {
      this.$el = el;
    }
    if (!this.$el) {
      throw new Error(
        "传入的对象必须是一个htmlElement 对象，或则是一个css selector"
      );
    }
  }
}
```

2. 遍历 data 里面的所有属性，将 data 里的所有属性挂载到 vue 实例上

```js
export default class Vue {
  constructor(options = {}) {
    this.$el = null
    this.$options = options
    this.$data = options.data
    this.$methods = options.methods
    this.initRootElement(options)
    this._proxyData(this.$data)
  }
  /**
  * 初始化根元素
  * @param {*} options
  */
  initRootElement(options) {
    const el = options.el
    if (typeof el === "string") {
      this.$el = document.querySelector(el)
    }
    if (el instanceof HTMLElement) {
      this.$el = el
    }
    if (!this.$el) {
      throw new Error('传入的对象必须是一个htmlElement 对象，或则是一个css selector')
    }
  }
  // 初始化data数据
  _proxyData(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newVal) {
          if (newVal === data[key]) {
            return
          } else {
            data[key] = newVal
          }
        }
      })
    })
  }
  // 初始化methods
  _proxyMethods(methods) {
    Object.keys(methods).forEach((key) => {
      if(this[key]) {
        throw new Error('methods 里面的方法不能与 data 里有相同的 key ')
      }
      this[key] = methods[key]
    })
  }
}

```

3. 创建Oberserver类，通过重写getter,setter 实现依赖收集, 和触发更新

4. 
