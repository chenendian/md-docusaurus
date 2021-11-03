---
sidebar_position: 1
---

# Promise

## PromiseA+ 规范

### 术语

1.  promise 有 then 方法的对象或者函数
2.  thenable 是一个有 then 方法的对象或则是函数
3.  value 是 promise 状态成功时候的值，resolve(value) value 的值可以是 string,number,boolean undefined thenable,promise
4.  reason 是 promise 状态失败时候的值， rejcet(reason)
5.  exception 使用 throw 抛出的异常

### 规范

#### Promise States

有三种状态

1. pending

   1.1 初始状态，可改变。
   1.2 在 resolve 和 reject 之前都处于这种状态
   1.3 通过 resolve -> fulfilled
   1.4 通过 reject -> rejected

2. fulfilled
   2.1 最终态，不可变
   2.2 一个 promise 被 resolve 之后变成这个状态
   2.3 必须拥有一个 value

3. rejected
   2.1 最终态，不可变
   2.2 一个 promise 被 reject 之后变成这个状态
   2.3 必须拥有一个 reason

总结：

pending -> resolve(value) -> fulfilled
pending -> reject(reason) -> rejected

#### then

promise 应该提供一个 then 方法，用来访问最终的结果，无论 value 还是 reason

```js
promise.then(onFulfilled, onRejected);
```

1. 参数规范
   1. onFulfilled 必须是函数类型，如果不是函数类型，应该被忽略
   2. onRejected 必须是函数类型，如果不是函数类型，应该被忽略
2. onFulfiiled 特性
   1. 在 promise 变成 fulfilld 时，应该调用 onFulfilled,参数是 value.（onFulfiiled 的执行时机）
   2. 在 promise 变成 fulfiiled 之前，不应该调用 onFulfilled.
   3. 只能被调用一次（怎么实现只调用一次）
3. onRejected 特性
   1. 在 promise 变成 rejected 时，应该调用 onRejected,参数是 reason.（onRejected 的执行时机）
   2. 在 promise 变成 rejected 之前，不应该调用 onRejected.
   3. 只能被调用一次（怎么实现只调用一次）
4. onFulfilled 和 onRejected 应该是微任务阶段执行
   1. 实现 promise 的时候，如何去生成微任务？
5. then 方法可以被调用多次
   1. promise 状态变成 fulfilled 后，所有的 onFulfilled 回调都需要按照注册顺序执行，也可以理解为按照 .then 的顺序执行
   2. promise 状态变成 rejected 后，所有的 onRejected 回调都需要按照注册顺序执行，也可以理解为按照 .then 的顺序执行
6. 返回值
   1. then 应该返回一个 promise
   ```js
   const promise2 = new Promise().then(onFulfilled, onRejected);
   ```
   2. onFulfilled 或 onRejected 的执行结果为 x, 调用 resolvePromise
   3. onFulfilled 或 onRejected 的执行过程中抛出了异常 e,promise2 需要被 reject
   4. 如果 promise2 的 then 方法里面的 onFulfilled 不是一个函数，promise2 以 promise1 的 value 触发 fulfilled
   5. 如果 promise2 的 then 方法里面的 onRejected 不是一个函数，promise2 以 promise1 的 value 触发 rejected
7. resolvePromise

   ```js
   /**
    * promise2 就是当前第一个promise的返回值，
    * x 是promise1的执行结果
    * resolve,reject 变更状态的方法
    */

   resolvePromise(promise2, x, resolve, reject);
   ```

   1. 如果 promise2 和 x 相等，reject TypeError
   2. 如果 x 是 promise
      1. 如果 x 是 pending,promise 必须要再 pengding 状态，知道 x 的状态变更
      2. 如果 x 是 fulfilled value -> fulfilled
      3. 如果 x 是 rejected reason -> rejected
   3. 如果 x 是一个 Object / Function
      1. 去获取 const then = x.then，reject reason
      2. then 是一个函数， then.call(x, resolvePromiseFn, rejectPromiseFn)

## 一步步实现一个 Promise

1. const Promise = new Promise(); 代表 Promise 应该是一个构造函数或则 class.
2. 定义三种状态.
3. 初始化状态
4. resolve 和 reject 方法
   1. 这两个方法更改 status, 从 pending 变成 fulfilled / rejected
   2. resolve reject 的入参分别是 value / reason
5. 对于实例化 promise 时的入参处理
   1. 入参是一个函数，接收 resolve,reject 两个参数
   2. 初始化 promise 的时候，就要同步执行这个函数，并且有任何的报错都要通过 reject 抛出去
6. 实现 then 方法
   1. then 就收两个参数 onFulfilled onRejected
   2. 参数必须是一个函数，如果不是函数, 就把 value reason 抛出去
   3. 根据当前 promise 的状态，调用不同的函数
   4. 因为要支持链式调用，所以我们要拿到所有的回调，新建两个数组，分别存储成功和失败的回调，回调 then 的时候，如果状态还是 pending 就存入数组，当状态发生变化的时候再执行回调
   5. 执行回调的方法可以使用 getter setter 方法，监听 status 的状态，在发生变化的时候做对应的操作
7. then 的返回值
   1. 如果 onFulfilled 或则 onRejected 抛出了异常 e，那么新的 promise 必须要 reject e
   2.

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MPromise {
  constructor(fn) {
    this._status = PENDING;
    this.value = null;
    this.reason = null;
    this.FULFILLED_CALLBACK_LIST = [];
    this.REJECTED_CALLBACK_LSIT = [];

    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }
  get status() {
    return this._status;
  }
  set status(newStatus) {
    this._status = newStatus;
    switch (newStatus) {
      case FULFILLED: {
        this.FULFILLED_CALLBACK_LIST.forEach((cb) => {
          cb(this.value);
        });
        break;
      }
      case REJECTED: {
        this.REJECTED_CALLBACK_LSIT.forEach((cb) => {
          cb(this.reason);
        });
        break;
      }
    }
  }

  resolve(value) {
    if (this.status === PENDING) {
      this.value = value;
      this.status = FULFILLED;
    }
  }
  reject(reason) {
    if (this.status === PENDING) {
      this.reason = reason;
      this.status = REJECTED;
    }
  }
  then(onFulfilled, onRejected) {
    const fulfilledFn = this.isFunction(onFulfilled)
      ? onFulfilled
      : (value) => value;
    const rejectedFn = this.isFunction(onRejected)
      ? onRejected
      : (reason) => reason;
    switch (this.status) {
      case FULFILLED: {
        fulfilledFn(this.value);
        break;
      }
      case REJECTED: {
        rejectedFn(this.reason);
        break;
      }
      case PENDING: {
        this.FULFILLED_CALLBACK_LIST.push(fulfilledFn);
        this.REJECTED_CALLBACK_LSIT.push(rejectedFn);
      }
    }
  }
  isFunction(fn) {
    return typeof fn === "function" ? true : false;
  }
}
```
