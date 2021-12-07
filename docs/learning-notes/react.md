---
sidebar_position: 10
---

# React 


## React 基础

1. 需要注意 jsx 里面不能 template 不能使用if else 尽量使用三元判断符。
2. 使用 setData 的使用要注意 class 组件和 function 组件的传值，会造成class　和　function　一起渲染，要防止不必要的渲染，可以使用这个npm 查看重新渲染　https://github.com/welldone-software/why-did-you-render#readme　　。
   

### React高级组件（HOC）

1. 本质上是利用一个函数，接受一个组件参数，并返回一个新的组件，一个组件经过一个函数以后变成一个新的业务逻辑的组件
  * 高级组件是接受一个组件作为参数并返回一个新组件的函数
  * 高阶组件是一个函数，并不是一个组件

