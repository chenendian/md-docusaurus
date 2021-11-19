---
sidebar_position: 4
---

# TypeScript

## 面试题及实战

1. type 和 interface 的异同

   重点： interface 重点描述数据类型, type 描述类型

1.1 都可以描述一个对象或则函数

```ts
interface User {
  name :string
  age: number
}
interface SetUser {
  (name: string, age: number): void;
}

type User  = {
  name :string
  age: number
}
type SetUser =
  (name: string, age: number): void;
```

1.2 都可以使用 extends, 两两组合，四种情况都可以相互 extends

```ts
interface extends interface
interface extends type
```

1.3 有些事情只有 type 可以做

```ts
interface Dog {
  wangwang();
}
interface Cat {
  miaomiao();
}
type Pet = Dog | Cat;
type PetList = [Dog, Cat];
```

2.  如何基于一个已有类型，扩展出一个大部分内容相似，但有部分区别的类型？

```ts
interface Test {
  name: string;
  sex: number;
  height: number;
}

type Sex = Pick<Test, "sex">;
type P = Partial<Test>;
```

3. 什么叫泛型，泛型的具体使用

   泛型是指在定义函数，interface class 的时候，不去预先指定具体的类型，而是使用的时候再去指定类型的一种特性

   可以把泛型理解为类型的参数

```ts
interface Test<T = any> {
  userId: T;
}

type TestA = Test<string>;
type TestB = Test<number>;

const a: TestA = {
  userId: "11111", // 只能是string类型
};
const b: TestB = {
  userId: 1111, // 只能是 number 类型
};
```

4. 装饰器（并不是 ts 里面的东西） 写一个计算时间装饰器的
