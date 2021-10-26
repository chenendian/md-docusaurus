---
sidebar_position: 1
---

# Study Vue

## vue 的核心类库

1. Obersever 初始化数据的 getter 和 setter 方法， 进行数据的 _依赖收集_ 和 _派发更新_
2. Dep 每个响应式对象都会有一个 dep 实例， 每个实例都有 dep.subs = watcher[],进行依赖收集，dep.notice 进行派发更新
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
    this.$el = null;
    this.$options = options;
    this.$data = options.data;
    this.$methods = options.methods;
    this.initRootElement(options);
    this._proxyData(this.$data);
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
  // 初始化data数据
  _proxyData(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key];
        },
        set(newVal) {
          if (newVal === data[key]) {
            return;
          } else {
            data[key] = newVal;
          }
        },
      });
    });
  }
  // 初始化methods
  _proxyMethods(methods) {
    Object.keys(methods).forEach((key) => {
      if (this[key]) {
        throw new Error("methods 里面的方法不能与 data 里有相同的 key ");
      }
      this[key] = methods[key];
    });
  }
}
```

3. 创建 Oberserver 类，通过重写 getter,setter 实现依赖收集, 和触发更新

```js
/**
 * 1. 根据根节点的 data 对象， 遍历该对象下面所有的属性，
 * 2. 重写get set 方法，在get的时候收集依赖， set的时候派发更新
 */
import Dep from "./dep.js";
export default class Observer {
  constructor(data) {
    this.traverse(data);
  }

  /**
   * 递归遍历所有的属性
   * @param {}} data
   */
  traverse(data) {
    if (!data || typeof data !== "object") {
      return;
    }
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }

  /**
   * 给传入的数据设置setter/getter
   */
  defineReactive(obj, key, val) {
    let that = this;
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        dep.addSub(Dep.target); // 收集依赖
        console.log(4444, "get", val);
        return val;
      },
      set(newVal) {
        console.log(222, newVal);
        val = newVal;
        Object.keys(val).forEach((key) => {
          that.traverse(val);
        });
        dep.notify(); // 触发更新
      },
    });
  }
}
```

4. 创建 Sub ，用来存储所有的 watcher, 并 派发更新

```js
/**
 * 发布订阅的模式
 * 存储所有的观察者，watcher
 * 每个watcher 都有 update 方法
 * notify 通知所有的watcher调用update方法
 */
export default class Dep {
  constructor() {
    this.subs = [];
  }

  /** 添加watcher */
  addSub(watcher) {
    if (watcher && watcher.update) {
      this.subs.push(watcher);
    }
  }

  /** 派发通知 */
  notify() {
    this.subs.forEach((watcher) => {
      watcher.update();
    });
  }
}
```

5. 实现 Watcher , 每个 watcher 都会有更新的方法，每个 watcher 实例都是在编译的时候实例化操作，实例化的时候 constructor 中会调用一下获取一下 响应式对象 --> 触发了 Oberserver 类里面重写的 getter 方法并将实例化的 watcher 实例 push 到 dep 实例中，方便统一更新数据。

```js
/**
 * 1. constructor 方法，根据传入进来的key值，调用一次 this.oldVal 以此来触发 observer 里面重写的 getter 方法， 方便 observer 的 getter 方法将此 watcher 放在 dep.subs 数组里面。
 * 2. 实现update方法，判断如果新的值是没有变化的，那么不进行任何操作，如果发生了变更，就执行传递过来的方法。
 */
import Dep from "./dep.js";
export default class Watcher {
  /**
   *
   * @param {*} vm vue 的示例
   * @param {*} key data 的属性名， 更改前的值
   * @param {*} cb 更改后更新视图的回掉函数
   */
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    Dep.target = this;
    // 这里会触发get操作
    this.oldVal = vm[key];
    Dep.target = null;
  }

  /** 当数据变化的时候更新视图 */
  update() {
    let newVal = this.vm[this.key];
    console.log(55555, newVal);
    if (newVal === this.oldVal) {
      return;
    }
    console.log(55555, newVal);
    this.cb(newVal);
  }
}
```

6. 找到初始化挂载的元素，遍历该元素根节点，并根据不同节点，将所有响应式数据需要展示的收集起来，放在 watcher 里面，当 watch 更新的时候，将所有收集起来的 watch 更新

```js
/**
 * 1. 编译模板，根据根节点，遍历节点的所有元素，直到没有子节点为止，
 * 2. 判断是否为文本节点,如果是文本节点是否是响应式数据（根据是否含有{}特殊字符来判断），如果是响应式数据，则将响应式数据放在watch里面，方便一旦劫持到响应式数据发生了变更，便将此文本节点的内容换成已经更改后的内容
 * 3. 判断是否是元素节点，如果是元素节点，遍历当前节点的所有 attrs 属性，（判断的标准是 是否含有 v-html v-text v-modal 等自定义指令），如果含有自定义指令， 并且是响应式相关的，那么将数据放在watch里面，如果是和响应式数据无关的，那么按照指令的内容做相应的操作，比如将v-on:click
 * 4. 根据不同的指令做不同的操作。
 */
import Watcher from "./watcher.js";
export default class Compiler {
  constructor(vm) {
    this.vm = vm;
    this.el = vm.$el;
    this.methods = vm.$methods;
    this.compile(this.el);
  }

  /** 编译摸板 */
  compile(el) {
    let childNodes = el.childNodes;
    console.log(childNodes);
    Array.from(childNodes).forEach((node) => {
      // 文本节点
      if (this.isTextNode) {
        this.compileText(node);
      }
      // 元素节点
      if (this.isElementNode) {
        this.compileElement(node);
      }

      // 子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }

  /** 编译文本 */
  compileText(node) {
    // {{msg}}
    let value = node.textContent;
    let reg = /\{\{(.*)\}\}/;
    if (reg.test(value)) {
      let key = RegExp.$1.trim();
      let val = this.vm[key];
      node.textContent = value.replace(reg, val);

      // 添加监听
      new Watcher(this.vm, key, (newVal) => {
        node.textContent = newVal;
      });
    }
  }

  /** 编译元素节点 */
  compileElement(node) {
    let attrs = node.attributes;
    if (attrs && attrs.length > 0) {
      Array.from(attrs).forEach((attr) => {
        let attrName = attr.name;
        let key = attr.nodeValue;
        let val = this.vm[key];
        if (this.isDirective(attrName)) {
          this.update(node, key, val, attrName);
        }
      });
    }
  }

  /** 所有更新的方法 */
  update(node, key, val, attrName) {
    // attr v-html v-text v-modal v-on:click
    const attrNameType =
      attrName.indexOf(":") > -1 ? attrName.substr(5) : attrName.substr(2);
    console.log(attrNameType);
    this[`${attrNameType}Update`](node, key, val, attrNameType);
  }

  /** htmlUpdate 更新 html 指令的方法 */
  htmlUpdate(node, key, val) {
    node.innerHTML = val;
    // 添加监听
    new Watcher(this.vm, key, (newVal) => {
      node.innerHTML = newVal;
    });
  }

  /** textUpdate 更新 text 指令的方法 */
  textUpdate(node, key, val) {
    node.textContent = val;
    // 添加监听
    new Watcher(this.vm, key, (newVal) => {
      node.textContent = newVal;
    });
  }

  /** 双向绑定数据 */
  modalUpdate(node, key, val) {
    node.value = val;
    node.addEventListener("input", () => {
      this.vm[key] = node.value;
    });
    new Watcher(this.vm, key, (newVal) => {
      console.log(33333, newVal);
      node.value = newVal;
    });
  }

  /** 添加点击事件 */
  clickUpdate(node, key, val, attrNameType) {
    node.addEventListener(`${attrNameType}`, (...argument) => {
      this.methods[key](...argument);
    });
  }

  /** 识别不同的自定义指令 */
  isDirective(attrName) {
    // attr v-html v-text v-modal v-on:click
    return attrName.startsWith("v-");
  }

  /** 文本节点 */
  isTextNode(node) {
    return node.nodeType === 3;
  }
  /** 元素节点 */
  isElementNode(node) {
    return node.nodeType === 1;
  }
}
```
