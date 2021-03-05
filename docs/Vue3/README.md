# Vue3介绍

# 1. Vue3 初步介绍

## 1.1 介绍

开发历经2年，99位贡献者，2600次提交，628次pull request。

vue2 的大部分特性都完整的保留到了 vue3 中，可以像使用 vue2 一样原封不动的使用 vue3，这是它遵守的渐进式的准则。



## 1.2 优化点

vue3 的代码被重新编写成分成实现不同功能的 module

代码打包大小减少了 41%

初次渲染快了 55%，更新快了 133%

内存的使用减少了 54%（得益于重写了虚拟 dom 的实现和 TreeShaking 的优化）



## 1.3 新特性

vue2 中遇到的问题：复杂组件的代码变得越来越难以维护，缺少一种比较干净的，在多个组件之间提取和复用逻辑的机制，现在的重用机制都有一些弊端。

基于以上问题，vue3 中隆重推出了 `Composition API` ，这是学习 vue3 要着重学习的特性，Composition 意为组合，实际上是一系列 API 的合集。

Composition API 中主要包括：

- ref 和 reactive
- computed 和 watch
- 新的生命周期函数
- 自定义函数 - Hooks 函数（重要）

其他新增特性：

- Teleport 内置组件 - 瞬移组件的位置
- Suspense - 异步加载组件的新福音
- 全局 API 的修改和优化
- 更多的试验性特性（例如在 script 中直接添加 setup() 即可使用 Composition API）
- 更好的 TypeScript 支持（全部源代码都是 TypeScript 编写，提供非常完备的类型定义）



# 2. 为什么要有 Vue3

Composition API 的出现是为了解决现有的问题。

## 2.1 复杂组件的代码变得难以维护

在 vue2 中，随着功能的增长，复杂组件的代码变得越来越难以维护，缺少一种比较干净的，在多个组件之间提取和复用逻辑的机制，现在的重用机制都有一些弊端，比如 mixin 等。mixin 虽可以提取公共部分代码，但缺点是会有命名冲突，不清楚暴露出来的变量的作用，重用到其他 component 时会出现很多问题。

这是因为 vue2 通过 `选项方式` 来组织代码，但通常情况下，通过 `逻辑方式` 来组织代码会更有意义。



例如，在 vue2 中，下列代码的与 filter 相关的逻辑都被分散到三个地方去了，与 pagination 有关的逻辑也被分散到三个地方去了。

```vue
<script>
export default {
  data() {
    return {
      filter: {},
      pagination: {},
    }
  },
  methods: {
    filterMethod: () => {},
    paginationMethod: () => {},
  },
  computed: {
    ...
  }
}
</script>
```

随着复杂度的上升，会带来很多问题。如下图，每个颜色代表每种功能，当我们以逻辑方式分类时，会清晰很多，代码的维护也会变得更容易。

<img src="https://img-blog.csdnimg.cn/20200605155509976.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Zlc2ZzZWZncw==,size_16,color_FFFFFF,t_70" alt="img" style="zoom:50%;" />

<img src="https://img-blog.csdnimg.cn/20200605160439258.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Zlc2ZzZWZncw==,size_16,color_FFFFFF,t_70" alt="img" style="zoom:50%;" />

Composition API 的出现即是解决上述问题，它以逻辑方式进行代码的编写。



## 2.2 Vue2 对 TypeScript 的支持非常有限

vue2 依赖于 this 上下文来往外暴露属性，但组件中的 this 比普通 JavaScript 对象多了很多“黑魔法”，没有考虑到 ts 的集成和类型推论等问题，所以在集成 ts 的过程中有很多的艰难险阻。

在 vue3 中，这些 API 的集成大部分使用了普通的 JavaScript 对象和方法，所以一开始就是类型友好的，可以享受到类型推论功能等福利。