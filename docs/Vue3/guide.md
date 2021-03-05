# Vue3教程

# 1. Vue3 基础

## 1.1 应用 & 组件实例

### 1.1.1 创建一个应用实例

每个 Vue 应用都是通过用 `createApp` 函数创建一个新的**应用实例**开始的：

```js
const app = Vue.createApp({ /* 选项 */ })
```

> Vue2 中，每个应用是通过用 Vue 函数创建一个新的 Vue 实例开始：
>
> ```js
> var vm = new Vue({
>   // 选项
> })
> ```
>
> 



该应用实例是用来在应用中注册“全局”组件的，例如：

```js
const app = Vue.createApp({})
app.component('SearchInput', SearchInputComponent)
app.directive('focus', FocusDirective)
app.use(LocalePlugin)
```



应用实例暴露的大多数方法都会返回该同一实例，它允许链式调用，下列写法的作用与上面的相同：

```js
Vue.createApp({})
  .component('SearchInput', SearchInputComponent)
  .directive('focus', FocusDirective)
  .use(LocalePlugin)
```



### 1.1.2 根组件

传递给 `createApp` 的选项是用于配置**根组件**的。当我们**挂载**应用时，该组件被用作渲染的起点。

一个应用实例是需要被挂载到一个 DOM 元素中的。例如，如果我们想把一个 Vue 应用实例挂载到 `<div id="app"></div>`，我们应该传递 `#app`：

```js
const RootComponent = { /* 选项 */ }
const app = Vue.createApp(RootComponent)

// 将应用实例 app 挂载到 <div id="app"></div>
const ViewModel = app.mount('#app')  // 这个 ViewModel 表示一个组件实例
```

根组件与其他组件没什么不同，配置选项是一样的，所对应的组件实例行为也是一样的。



### 1.1.3 组件实例 property

在 `data` 中定义的 property 是通过组件实例暴露的：

```js
const app = Vue.createApp({
  data() {
    return { count: 4 }
  }
})

const vm = app.mount('#app')

console.log(vm.count) // => 4
```

还有各种其他的组件选项，可以将用户定义的 property 添加到组件实例中，例如 `methods`，`props`，`computed`，`inject` 和 `setup`。组件实例的所有 property，无论如何定义，都可以在组件的模板中访问。

Vue 还通过组件实例暴露了一些 `内置 property`，如 `$attrs` 和 `$emit`。这些 property 都有一个 `$` 前缀，以避免与用户定义的 property 名冲突。



### 1.1.4 生命周期钩子

vue3 的生命周期钩子函数的变化是：

- beforeDestroy 改名为 `beforeUnmount`，destroyed 改名为 `unmounted`
- 新增了 `onRenderTracked` 和 `onRenderTriggered` 两个调试用的 debug 钩子函数

在使用方面，钩子函数都可以写在 `setup()` 函数中，具体写法如下所示：

```js
beforeCreate -> use setup()
created -> use setup()
beforeMount -> onBeforeMount
mounted -> onMounted
beforeUpdate -> onBeforeUpdate
updated -> onUpdated
beforeUnmount -> onBeforeUnmount
unmounted -> onUnmounted
activated -> onActivated
deactivated -> onDeactivated
errorCaptured -> onErrorCaptured

onRenderTracked
onRenderTriggered
```

因为 `beforeCreate`、`created` 与 setup() 几乎是同时进行的，所以这两个钩子中的业务逻辑可以直接写在 setup() 中。

`onRenderTracked` 和 `onRenderTriggered` 用于调试，当数据发生变化时会触发。

- `onTrack` 将在响应式 property 或 ref 作为依赖项被追踪时被调用。
- `onTrigger` 将在依赖项变更导致副作用被触发时被调用。



示例：

```vue
<template>
  <div>
    <h1>{{ count }}</h1>
    <h1>{{ double }}</h1>
    <button @click="increase">👍 +1</button>
  </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs, onMounted, onRenderTriggered } from 'vue'
interface DataProps {
  count: number
  increase: () => void
  double: number
}
export default {
  setup() {
    onMounted(() => {
      console.log('mounted')
    })
    onRenderTriggered((event) => {
      console.log(event)
    })
    
    const data: DataProps = reactive({
      count: 0,
      increase: () => {
        data.count++
      },
      double: computed(() => {
        return data.count * 2
      }),
    })
    const refData = toRefs(data)
    return {
      ...refData
    }
  }
}
</script>
```

示例中，使用了 `onMounted` 和 `onRenderTriggerd` 两个钩子。当点击按钮时，`onRenderTriggerd` 打印的 event 对象如下：

```js
effect: ƒ reactiveEffect()
key: "count"
newValue: 1
oldTarget: undefined
oldValue: 0
target: {count: 1, double: ComputedRefImpl, increase: ƒ}
type: "set"
__proto__: Object
```

其中，key 代表被更新的值，type 代表操作的类型，newValue 和 oldValue 分别代表更新后和更新前的值



## 1.2 Data Property 和方法

### 1.2.1 Data Property

组件的 `data` 选项是一个函数。Vue 在创建新组件实例的过程中调用此函数。它应该返回一个对象，然后 Vue 会通过响应性系统将其包裹起来，并以 `$data` 的形式存储在组件实例中。为方便起见，该对象的任何 `顶级 property` 也直接通过组件实例暴露出来：

```js
const app = Vue.createApp({
  data() {
    return { count: 4 }
  }
})

const vm = app.mount('#app')

console.log(vm.$data.count) // => 4
console.log(vm.count)       // => 4

// 修改 vm.count 的值也会更新 $data.count
vm.count = 5
console.log(vm.$data.count) // => 5

// 反之亦然
vm.$data.count = 6
console.log(vm.count) // => 6
```

这些实例 property 仅在实例首次创建时被添加，所以你需要确保它们都在 `data` 函数返回的对象中。必要时，要对尚未提供所需值的 property 使用 `null`、`undefined` 或其他占位的值。

Vue 使用 `$` 前缀通过组件实例暴露自己的内置 API。它还为内部 property 保留 `_` 前缀。你应该避免使用这两个字符开头的的 `顶级 data property` 名称。



### 1.2.2 方法

我们用 `methods` 选项向组件实例添加方法，它应该是一个包含所需方法的对象：

```js
const app = Vue.createApp({
  data() {
    return { count: 4 }
  },
  methods: {
    increment() {
      // `this` 指向该组件实例
      this.count++
    }
  }
})

const vm = app.mount('#app')

console.log(vm.count) // => 4

vm.increment()

console.log(vm.count) // => 5
```

Vue 自动为 `methods` 绑定 `this`，以便于它始终指向组件实例。这将确保方法在用作事件监听或回调时保持正确的 `this` 指向。

> 在定义 `methods` 时应避免使用箭头函数，因为这会阻止 Vue 绑定恰当的 `this` 指向。



也可以直接从模版中调用方法，但是通常这种情况换做 `计算属性` 会更好。

你可以在模板支持 JavaScript 表达式的任何地方调用方法：

```html
<span :title="toTitleDate(date)">
  {{ formatDate(date) }}
</span>
```

如果 `toTitleDate` 或 `formatDate` 访问任何响应式数据，则将其作为渲染依赖项进行跟踪，就像直接在模板中使用过一样。



### 1.2.3 防抖和节流



## 1.3 表单输入绑定

### 1.3.1 在当前组件使用 v-model

用 `v-model` 指令可以在表单 `<input>`、`<textarea>` 及 `<select>` 元素上创建双向数据绑定，它会根据控件类型自动选取正确的方法来更新元素。

但 `v-model` 本质上不过是语法糖，它负责监听用户的输入事件以更新数据，并对一些极端场景进行一些特殊处理。`v-model` 在内部为不同的输入元素使用不同的 property 并抛出不同的事件：

- text 和 textarea 元素使用 `value` property 和 `input` 事件；
- checkbox 和 radio 使用 `checked` property 和 `change` 事件；
- select 字段将 `value` 作为 prop 并将 `change` 作为事件。



文本（Text）：

```html
<input v-model="message" placeholder="edit me" />
<p>Message is: {{ message }}</p>
```

多行文本（textarea）：

```html
<span>Multiline message is:</span>
<p style="white-space: pre-line;">{{ message }}</p>

<textarea v-model="message" placeholder="add multiple lines"></textarea>
```

复选框（Checkbox）：

```html
<input type="checkbox" id="checkbox" v-model="checked" />
<label for="checkbox">{{ checked }}</label>
```

单选框（Radio）：

```html
<div id="v-model-radiobutton">
  <input type="radio" id="one" value="One" v-model="picked" />
  <label for="one">One</label>
  
  <input type="radio" id="two" value="Two" v-model="picked" />
  <label for="two">Two</label>
  
  <span>Picked: {{ picked }}</span>
</div>
```

选择框（Select）：

```html
<div id="v-model-select" class="demo">
  <select v-model="selected">
    <option disabled value="">Please select one</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  <span>Selected: {{ selected }}</span>
</div>
```

### 1.3.2 在组件上使用 v-model

vue2 中，在组件上使用 `v-model` 时，v-model 会默认利用 `value` 当作 property，默认利用名为 `input` 的事件。用在普通的 text 和 textarea 上时是这样，但是当用在 checkbox 和 radio 上时，是将 checked 当作 property，change 当作事件。

针对这种情况，vue2 提供的解决方案是写一个 model 字段，里面含有想绑定的 property 和 想触发的事件名称，从而使用model 来覆盖默认的 value 和 input：

```js
model: {
  prop: "checked",
  event: "change"
}
```



显而易见，vue2 这样的做法有几个缺点：

- 需要定义一个新的 model，比较繁琐
- 只能支持一个 v-model，当组件需要双向绑定多个值时存在一定困难



针对此问题，vue3 中使用 modelValue 作为 property，使用与该 modelValue 对应的 update:modelValue 名称作为事件名。这样，property 和 事件间就能够一一对应起来，就不存在上述的问题了，且其支持多个 v-model。



在 vue3 中使用 v-model 时，同理，需要使用自定义事件，自定义事件可以用于创建 `v-model` 的自定义输入组件，通常情况下记住：

```html
<input v-model="searchText" />
```

等价于：

```html
<input :value="searchText" @input="searchText = $event.target.value" />
```

而当在组件上使用 v-model 时，父组件的 v-model 则为：

```html
<custom-input v-model="searchText"></custom-input>
```

等价于这样：

```html
<custom-input
  :model-value="searchText"
  @update:model-value="searchText = $event"
></custom-input>
```

为了让它正常工作，这个 `custom-input` 组件内的 `<input>` 必须：

- 将其 `value` attribute 绑定到一个名叫 `modelValue` 的 prop 上
- 在其 `input` 事件被触发时，将新的值通过自定义的 `update:modelValue` 事件抛出

> 也就是属性名为 `modelValue`, 事件名为 `update:modelValue`（这里 update 后面的 modelValue 的值和属性名 modelValue 保持一致）。

所以子组件 `custom-input` 如下所示：

```typescript
app.component('custom-input', {
  props: ['modelValue'],
  template: `
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  `
})
```

### 1.3.3 使用 computed 改写自定义 v-model

在自定义组件中创建 `v-model` 功能的另一种方法是使用 `computed` property 的功能来定义 getter 和 setter。

下面的示例中，我们使用计算属性重构 `<custom-input>` 组件。

```js
app.component('custom-input', {
  props: ['modelValue'],
  template: `
    <input v-model="value">
  `,
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(value) { this.$emit('update:modelValue', value)
      }
    }
  }
})
```

注意两点：

- `get` 方法应返回 `modelValue` property，或用于绑定的任何 property
- `set` 方法应为该 property 触发相应的 `$emit`



## 1.4 组件基础

### 解析 DOM 模版时的注意事项

有些 HTML 元素，诸如 `<ul>`、`<ol>`、`<table>` 和 `<select>`，对于哪些元素可以出现在其内部是有严格限制的。而有些元素，诸如 `<li>`、`<tr>` 和 `<option>`，只能出现在其它某些特定的元素内部。

这会导致我们使用这些有约束条件的元素时遇到一些问题。例如：

```html
<table>
  <blog-post-row></blog-post-row>
</table>
```

这个自定义组件 `<blog-post-row>` 会被作为无效的内容提升到外部，并导致最终渲染结果出错。

但我们有一个特殊的 `v-is` attribute 给了我们一个变通的办法：

```html
<table>
  <tr v-is="'blog-post-row'"></tr>
</table>
```

> 注意：
>
> `v-is` 值应该为 JavaScript 字符串文本：
>
> ```html
> <!-- 错误的，这样不会渲染任何东西 -->
> <tr v-is="blog-post-row"></tr>
> 
> <!-- 正确的 -->
> <tr v-is="'blog-post-row'"></tr>
> ```

> Vue2 中是 `is` attribute
>
> 例如：
>
> ```html
> <table>
>   <tr is="blog-post-row"></tr>
> </table>
> ```



另外，HTML 属性名不区分大小写，因此浏览器将把所有大写字符解释为小写。这意味着当你在 DOM 模板中使用时，驼峰 prop 名称和 event 处理器参数需要使用它们的 kebab-cased (横线字符分隔) 等效值：

```js
//  在JavaScript中的驼峰

app.component('blog-post', {
  props: ['postTitle'],
  template: `
    <h3>{{ postTitle }}</h3>
  `
})
```

```html
<!-- 在HTML则是横线字符分割 -->

<blog-post post-title="hello!"></blog-post>
```



# 2. 组件深入

## 2.1 非 Prop 的 Attribute

一个非 prop 的 attribute 是指：

传向一个组件，但是该组件并没有相应 props 或 emits 定义的 attribute。常见的示例包括 `class`、`style` 和 `id` 属性。

### 2.1.1 Attribute 继承

当组件返回单个根节点时，非 prop attribute 将自动添加到根节点的 attribute 中。

例如，在 `<date-picker>` 组件的实例中：

```js
app.component('date-picker', {
  template: `
    <div class="date-picker">
      <input type="datetime" />
    </div>
  `
})
```

如果我们需要通过 `data status` property 定义 `<date-picker>` 组件的状态，它将会应用于根节点 (即 `div.date-picker`)：

```html
<!-- 具有非prop attribute的Date-picker组件，给其传递data-status property -->
<date-picker data-status="activated"></date-picker>

<!-- 渲染 date-picker 组件时，data-status property 将应用于根节点上，如下 -->
<div class="date-picker" data-status="activated">
  <input type="datetime" />
</div>
```

同样的规则适用于事件监听器 `v-on` 等。

### 2.1.2 禁用 Attribute 继承

如果你不希望组件的根元素继承 attribute，你可以在组件的选项中设置 `inheritAttrs: false`。禁用 attribute 继承的常见情况是需要将 attribute 应用于根节点之外的其他元素。

通过将 `inheritAttrs` 选项设置为 `false`，你可以访问组件的 `$attrs` property，该 property 包括组件 `props` 和 `emits` property 中未包含的所有属性 (例如，`class`、`style`、`v-on` 监听器等)。

改写上面例子：

```js
app.component('date-picker', {
  inheritAttrs: false,
  template: `
    <div class="date-picker">
      <input type="datetime" v-bind="$attrs" />
    </div>
  `
})
```

上面例子中，我们在组件的选项中设置了 `inheritAttrs: false`，并且在 `<input>` 上添加了 `v-bind:"$attrs"`，那么 `data-status` attribute 将应用于 `<input>` 上：

```html
<!-- Date-picker 组件 使用非 prop attribute -->
<date-picker data-status="activated"></date-picker>

<!-- 渲染 date-picker 组件 -->
<div class="date-picker">
  <input type="datetime" data-status="activated" />
</div>
```

### 2.1.3 多个根节点上的 Attribute 继承

与单个根节点组件不同，具有多个根节点的组件不具有`自动 attribute 回退行为`。如果未显式绑定 `$attrs`，将发出运行时警告。

```html
<custom-layout id="custom-layout" @click="changeValue"></custom-layout>
```

```js
// 这将发出警告
app.component('custom-layout', {
  template: `
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
  `
})

// 没有警告，$attrs被传递到<main>元素
app.component('custom-layout', {
  template: `
    <header>...</header>
    <main v-bind="$attrs">...</main>
    <footer>...</footer>
  `
})
```



## 2.2 自定义事件

### 2.2.1 事件名

不同于组件和 prop，事件名不存在任何自动化的大小写转换。而是触发的事件名需要完全匹配监听这个事件所用的名称。举个例子，如果触发一个 camelCase 名字的事件：

```js
this.$emit('myEvent')
```

则监听这个名字的 kebab-case 版本是不会有任何效果的：

```html
<!-- 没有效果 -->
<my-component @my-event="doSomething"></my-component>
```

不同于组件和 prop，事件名不会被用作一个 JavaScript 变量名或 property 名，所以就没有理由使用 camelCase 或 PascalCase 了。

并且 `v-on` 事件监听器在 DOM 模板中会被自动转换为全小写 (因为 HTML 是大小写不敏感的)，所以 `@myEvent` 将会变成 `@myevent`——导致 `myEvent` 不可能被监听到。

因此，事件名都推荐始终使用 `kebab-case` 事件名。

### 2.2.2 定义自定义事件

通过 `emits` 选项在组件上定义已发出的事件：

```js
app.component('custom-form', {
  emits: ['in-focus', 'submit']
})
```

> Vue2 中没有 emits 选项



当在 `emits` 选项中定义了原生事件 (如 `click`) 时，将使用该事件**替代**原生事件侦听器。

> 建议定义所有发出的事件，以便更好地记录组件应该如何工作。

#### 验证抛出的事件

与 prop 类型验证类似，如果使用`对象语法`而不是数组语法定义发出的事件，则可以验证它。

若要添加验证，则需为事件分配一个函数，该函数`接收`传递给 `$emit` 调用的参数，并`返回`一个布尔值以指示事件是否有效。

```js
app.component('custom-form', {
  emits: {
    // 没有验证
    click: null,

    // 验证submit 事件
    submit: ({ email, password }) => {
      if (email && password) {
        return true
      } else {
        console.warn('Invalid submit event payload!')
        return false
      }
    }
  },
  methods: {
    submitForm() {
      this.$emit('submit', { email, password })
    }
  }
})
```

### 2.2.3 `v-model` 参数

默认情况下，组件上的 `v-model` 使用 `modelValue` 作为 prop 和 `update:modelValue` 作为事件。我们可以通过向 `v-model` 传递参数来`修改这些名称`：

```html
<my-component v-model:foo="bar"></my-component>
```

在本例中，子组件将需要一个 `foo` 的 prop，并发出 `update:foo` 这个要同步的事件：

```js
const app = Vue.createApp({})

app.component('my-component', {
  props: {
    foo: String
  },
  template: `
    <input 
      type="text"
      :value="foo"
      @input="$emit('update:foo', $event.target.value)">
  `
})
```

```html
<my-component v-model:foo="bar"></my-component>
```

### 2.2.4 多个 `v-model` 绑定

通过 v-model 的参数，我们现在可以在单个组件实例上创建`多个` v-model 绑定。

> Vue2 的组件不支持多个 v-model 绑定



每个 v-model 将同步到不同的 prop，而不需要在组件中添加额外的选项：

```html
<user-name
  v-model:first-name="firstName"
  v-model:last-name="lastName"
></user-name>
```

```js
const app = Vue.createApp({})

app.component('user-name', {
  props: {
    firstName: String,
    lastName: String
  },
  template: `
    <input 
      type="text"
      :value="firstName"
      @input="$emit('update:firstName', $event.target.value)">

    <input
      type="text"
      :value="lastName"
      @input="$emit('update:lastName', $event.target.value)">
  `
})
```



## 2.3 异步组件

### 2.3.1 基本使用

在大型应用中，我们可能需要将应用分割成小一些的代码块，并且只在需要的时候才从服务器加载一个模块。为了简化，Vue 有一个 `defineAsyncComponent` 方法：

```js
const app = Vue.createApp({})

const AsyncComp = Vue.defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      resolve({
        template: '<div>I am async!</div>'
      })
    })
)

app.component('async-example', AsyncComp)
```

此方法接受返回 `Promise` 的工厂函数。从服务器检索组件定义后，应调用 Promise 的 `resolve` 回调。你也可以调用 `reject(reason)`，以指示加载失败。



你也可以在工厂函数中返回一个 `Promise`，所以把 webpack 2 和 ES2015 语法加在一起，我们可以这样使用动态导入：

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

app.component('async-component', AsyncComp)
```

在本地注册组件时，你也可以使用 `defineAsyncComponent`

```js
import { createApp, defineAsyncComponent } from 'vue'

createApp({
  // ...
  components: {
    AsyncComponent: defineAsyncComponent(() =>
      import('./components/AsyncComponent.vue')
    )
  }
})
```

> Vue2 中是将异步组件和 webpack 的 code-splitting 结合或者直接使用动态导入

### 2.3.2 与Suspense 一起使用

详情见内置组件中的 Suspense



# 3. 内置组件

## 3.1 Teleport

`Teleport` 意为瞬间移动。Teleport 提供了一种干净的方法，允许我们控制在 DOM 中哪个父节点下呈现 HTML，而不必求助于全局状态或将其拆分为两个组件。

当我们需要写一个弹窗组件时，会遇到几点问题：

- 被包裹在其他组件中，容易被干扰
- 样式也在其他组件中，容易变得非常混乱

我们会希望这个弹窗组件能直接出现在顶层 DOM 节点上，而不用嵌套在很深层级的 DOM 中，这个时候就需要用到 Teleport。

Teleport 可以建立一个传送门，Teleport 包裹的组件在表现层和其他组件没有任何差异，但渲染的结果却像经过一个传送门一样出现在另外一个地方。

以下是示例。

在 `components/Modal.vue` 中：

```vue
<template>
<!-- 这里会转移到 id 为 modal 的 DOM 上 -->
<teleport to="#modal">
  <div id="center" v-if="isOpen">
    <h2>
      <slot>this is a modal</slot>
    </h2>
    <button @click="buttonClick">close</button>
  </div>
</teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    isOpen: Boolean,
  },
  emits: {
    'close-modal': null
  },
  setup(props, context) {
    const buttonClick = () => {
      context.emit('close-modal')
    }
    
    return {
      buttonClick
    }
  }
})
</script>

<style>
  #center {
    width: 200px;
    height: 200px;
    border: 2px solid black;
    background: white;
    position: fixed;
    left: 50%;
    top: 50%;
    margin-left: -100px;
    margin-top: -100px;
  }
</style>
```

在父组件中引用 Modal 组件：

```vue
<template>
  <div>
    <modal :isOpen="modalIsOpen" @close-modal="onModalClose">this is a modal</modal>
    <button @click="openModal">open modal</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Modal from '../components/Modal.vue'
export default defineComponent({
  components: {
    Modal
  },
  setup() {
    const modalIsOpen = ref(false)
    const openModal = () => {
      modalIsOpen.value = true
    }
    const onModalClose = () => {
      modalIsOpen.value = false
    }

    return {
      modalIsOpen,
      openModal,
      onModalClose,
    }
  }
})
</script>
```

使用 teleport 包裹组件，teleport 上面有一个 to 的属性，它接收一个 CSS querySelector 作为参数，意为要把这个组件渲染到哪个 DOM 上面去。我们最好将模板的这一部分移动到 DOM 中 Vue app 之外的其他位置。

> 使用 emits 的作用：
>
> - 可以更明确的显示组件的自定义事件有哪些
> - 支持运行时的检验，接收一个自定义函数，可以验证发送的参数是否正确
> - 支持类型推论，自动补全
> - 将来还会支持 IDE 中模版的自动补全



## 3.2 Suspense

`Suspense` 是异步请求的好帮手。

在发起异步请求时，我们往往需要判断这些异步请求的状态，根据这些请求是否完毕来展示不同的界面。

Suspense 有两个 template slot ，刚开始会渲染一个 fallback 内容，直到达到某个条件以后，才会渲染正式的内容（default）。这样来进行异步渲染，就会变得非常的简单。

> 特别注意，如果要使用 Suspense，那么在 setup() 中，我们要返回一个 Promise，而不是直接返回一个对象。

以下是一个示例。

先写一个异步的组件，在 `components/AsyncShow.vue` 中：

```vue
<template>
  <div>
    <h1>{{ result }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve({
          result: 42
        })
      }, 3000)
    })
  }
})
</script>
```

这个异步组件，三秒后返回一个数字，且为一个 Promise 对象

在组件中引用它：

```vue
<template>
  <div>
    <Suspense>
      <!-- 先展示的 fallback 内容 -->
      <template #fallback>
        <h1>Loading ...</h1>
      </template>
      <!-- resolve 后展示的内容 -->
      <template #default>
        <async-show></async-show>
      </template>
    </Suspense>
    <p>{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onErrorCaptured, ref } from 'vue'
import AsyncShow from '../components/AsyncShow.vue'
export default defineComponent({
  components: {
    AsyncShow
  },
  setup() {
    const error = ref(null)
    onErrorCaptured((e: any) => {
      error.value = e
      return true
    })

    return {
      error
    }
  }
})
</script>
```

与异步组件相似，Suspense 也完美支持异步组件。总之，Suspense 组件可以为异步请求的界面进行个性化的定制。

> 若要抓取错误，可使用 onErrorCaptured 钩子函数，这个钩子函数要返回一个布尔值，表示是否向上传播。



# 4. 响应性

## 4.1 响应性原理

在 vue2 中，通过 `Object.defineProperty` 来实现响应式，但是在对象新增和删除属性时，或是修改数组长度直接通过索引修改一个数组项时，无法检测。

针对上述缺点，vue3 采用了 `Proxy` 来实现响应式。Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。

以下是两者的对比

```js
Object.defineProperty(data, 'count', {
  get() {},
  set() {},
})

new Proxy(data, {
  get(key) {},
  set(key, value) {},
})
```

可以看到，相比于 Object.defineProperty，Proxy 在更高维度上进行了属性的拦截与修改。

在 Object.defineProperty 中，对于给定的 data，需要给定具体的 key 值才能进行拦截与修改，这个 key 值就是上述代码的 count，也就是说，我们需要预先知道要拦截的 key 是什么，所以对新增的 key 值无能为力。而 Proxy 则不关心所要拦截的 key 是什么，它可以拦截和修改 data 上任意的 key，所以不管是已有的 key 还是新增的 key，Proxy 都能对其进行拦截和修改。

Proxy 更强大的地方在于，它除了 getter 和 setter，还可以拦截更多的操作符。



## 4.2 响应性基础

### 4.2.1 声明响应式状态

要为 JavaScript 对象创建响应式状态，可以使用 `reactive` 方法：

```js
import { reactive } from 'vue'

// 响应式状态
const state = reactive({
  count: 0
})
```

> `reactive` 相当于 Vue 2.x 中的 `Vue.observable()` API ，为避免与 RxJS 中的 observables 混淆因此对其重命名。该 API 返回一个响应式的对象状态。该响应式转换是“深度转换”——它会影响嵌套对象传递的所有 property。



这就是 Vue 响应性系统的本质。当从组件中的 `data()` 返回一个对象时，它在内部交由 `reactive()` 使其成为响应式对象。模板会被编译成能够使用这些响应式 property 的渲染函数。

### 4.2.2 创建独立的响应式值作为 `refs`

我们有一个独立的原始值 (例如，一个字符串)，我们想让它变成响应式的。当然，我们可以创建一个拥有相同字符串 property 的对象，并将其传递给 `reactive`。

但 Vue3 也为我们提供了一个可以做相同事情的方法 ——`ref`：

```js
import { ref } from 'vue'

const count = ref(0)
```

`ref` 会返回一个可变的响应式对象，该对象作为它的内部值——一个**响应式的引用**，这就是名称的来源。此对象只包含一个名为 `value` 的 property，通过 value 这个属性才能取到它的值 ：

```js
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

#### ref展开

当 ref 作为渲染上下文 (从 setup() 中返回的对象）上的 property 返回并可以在模版中被访问时，它将自动展开为内部值，而不需要在模版中追加 `.value`

```vue
<template>
  <div>
    <span>{{ count }}</span>
    <button @click="count ++">Increment count</button>
  </div>
</template>

<script>
  import { ref } from 'vue'
  export default {
    setup() {
      const count = ref(0)
      return {
        count
      }
    }
  }
</script>
```

#### 访问响应式对象

当 `ref` 作为响应式对象（reactive）的 property 被访问或更改时，为使其行为类似于普通 property，它会自动展开内部值：

```js
const count = ref(0)
const state = reactive({
  count
})

console.log(state.count) // 0

state.count = 1
console.log(count.value) // 1
```

如果将新的 ref 赋值给现有 ref 的 property，将会替换旧的 ref：

```js
const otherCount = ref(2)

state.count = otherCount
console.log(state.count) // 2
console.log(count.value) // 1
```

Ref 展开仅发生在被响应式 `Object` 嵌套的时候。当从 `Array` 或原生集合类型如 `Map` 访问 ref 时，`不会`进行展开：

```js
const books = reactive([ref('Vue 3 Guide')])
// 这里需要 .value
console.log(books[0].value)

const map = reactive(new Map([['count', ref(0)]]))
// 这里需要 .value
console.log(map.get('count').value)
```

### 4.2.3 响应式状态解构

当我们想使用大型响应式对象的一些 property 时，可能很想使用 ES6 的解构来获取我们想要的 property：

```js
import { reactive } from 'vue'

const book = reactive({
  author: 'Vue Team',
  year: '2020',
  title: 'Vue 3 Guide',
  description: 'You are reading this book right now ;)',
  price: 'free'
})

let { author, title } = book
```

但这时，使用解构的两个 property 的响应性都会丢失。对于这种情况，我们需要将我们的响应式对象转换为一组 ref。这些 ref 将保留与源对象的响应式关联，这时我们需要用到 `toRefs`：

```js
import { reactive, toRefs } from 'vue'

const book = reactive({
  author: 'Vue Team',
  year: '2020',
  title: 'Vue 3 Guide',
  description: 'You are reading this book right now ;)',
  price: 'free'
})

let { author, title } = toRefs(book)

title.value = 'Vue 3 Detailed Guide' // 我们需要使用 .value 作为标题，现在是 ref
console.log(book.title) // 'Vue 3 Detailed Guide'
```

### 4.2.4 使用 `readonly` 防止更改响应式对象

有时我们想跟踪响应式对象 (`ref` 或 `reactive`) 的变化，但我们也希望防止在应用程序的某个位置更改它。例如，当我们有一个被 provide 的响应式对象时，我们不想让它在 inject 的时候被改变。为此，我们可以基于原始对象创建一个只读的 Proxy 对象：

```js
import { reactive, readonly } from 'vue'

const original = reactive({ count: 0 })

const copy = readonly(original)

// 在copy上转换original 会触发侦听器依赖
original.count++

// 转换copy 将导失败并导致警告
copy.count++ // 警告: "Set operation on key 'count' failed: target is readonly."
```



## 4.3 响应式计算和侦听

### 4.3.1 computed

有时我们需要依赖于其他状态的状态。在 Vue 中，这是用组件计算属性处理的。

创建计算值，我们可以使用 `computed` 方法：它接受 getter 函数并为 getter 返回的值返回一个不可变的响应式 ref 对象。

```js
const count = ref(1)
const plusOne = computed(() => count.value++)

console.log(plusOne.value) // 2

plusOne.value++ // error
```

或者，它可以使用一个带有 `get` 和 `set` 函数的对象来创建一个可写的 ref 对象。

```js
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: val => {
    count.value = val - 1
  }
})

plusOne.value = 1
console.log(count.value) // 0
```

### 4.3.2 watch

`watch` API 完全等同于组件侦听器 property。`watch` 需要侦听特定的数据源，并在回调函数中执行副作用。默认情况下，它也是惰性的，即只有当被侦听的源发生变化时才执行回调。

侦听器数据源可以是返回值的 getter 函数，也可以直接是 `ref`：

```js
// 侦听一个 getter
const state = reactive({ count: 0 })
watch(
  () => state.count,
  (count, prevCount) => {
    /* ... */
  }
)

// 直接侦听ref
const count = ref(0)
watch(count, (count, prevCount) => {
  /* ... */
})
```



# 5. composition API（组合式 API）

在 Vue2 中，采用的是 options API：按选项类型分组。

这种碎片化使得理解和维护复杂组件变得困难。选项的分离掩盖了潜在的逻辑问题。此外，在处理单个逻辑关注点时，我们必须不断地“跳转”相关代码的选项块。

如果我们能够将与同一个逻辑关注点相关的代码配置在一起会更好。而这正是组合式 API 使我们能够做到的。



## 5.1 基础用法

为了开始使用组合式 API，我们首先需要一个可以实际使用它的地方。在 Vue 组件中，我们将此位置称为 `setup`。

`setup` 选项应该是一个接受 `props` 和 `context` 的函数。此外，我们从 `setup` 返回的所有内容都将暴露给组件的其余部分 (计算属性、方法、生命周期钩子等等) 以及组件的模板。

```js
export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: { type: String }
  },
  setup(props) {
    console.log(props) // { user: '' }

    return {} // 这里返回的任何内容都可以用于组件的其余部分
  }
  // 组件的“其余部分”
}
```

> 由于在执行 `setup` 时，尚未创建组件实例，因此在 `setup` 选项中没有 `this`。这意味着，除了 `props` 之外，你将无法访问组件中声明的任何属性——**本地状态**、**计算属性**或**方法**。



例子：

```js
// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'

// 在我们的组件内
setup (props) {
  let repositories = []
  const getUserRepositories = async () => {
    repositories = await fetchUserRepositories(props.user)
  }

  return {
    repositories,
    getUserRepositories // 返回的函数与方法的行为相同
  }
}
```

上述代码中，我们的 `repositories` 变量是非响应式的，需要将其变成响应式的。

```js
// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'
import { ref } from 'vue'

// in our component
setup (props) {
  const repositories = ref([])
  const getUserRepositories = async () => {
    repositories.value = await fetchUserRepositories(props.user)
  }

  return {
    repositories,
    getUserRepositories
  }
}
```

现在，每当我们调用 `getUserRepositories` 时，`repositories` 都将发生变化，视图将更新以反映更改。我们的组件现在应该如下所示：

```js
// src/components/UserRepositories.vue
import { fetchUserRepositories } from '@/api/repositories'
import { ref } from 'vue'

export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: { type: String }
  },
  setup (props) {
    const repositories = ref([])
    const getUserRepositories = async () => {
      repositories.value = await fetchUserRepositories(props.user)
    }

    return {
      repositories,
      getUserRepositories
    }
  },
  data () {
    return {
      filters: { ... }, // 3
      searchQuery: '' // 2
    }
  },
  computed: {
    filteredRepositories () { ... }, // 3
    repositoriesMatchingSearchQuery () { ... }, // 2
  },
  watch: {
    user: 'getUserRepositories' // 1
  },
  methods: {
    updateFilters () { ... }, // 3
  },
  mounted () {
    this.getUserRepositories() // 1
  }
}
```

使用在 setup 内部书写生命周期函数与侦听器的方式来改写后：

```js
// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'
import { ref, onMounted, watch, toRefs } from 'vue'

// 在我们组件中
setup (props) {
  // 使用 `toRefs` 创建对prop的 `user` property 的响应式引用
  const { user } = toRefs(props)

  const repositories = ref([])
  const getUserRepositories = async () => {
    // 更新 `prop.user` 到 `user.value` 访问引用值
    repositories.value = await fetchUserRepositories(user.value)
  }

  onMounted(getUserRepositories)

  // 在用户 prop 的响应式引用上设置一个侦听器
  watch(user, getUserRepositories)
  
  const searchQuery = ref('')
  const repositoriesMatchingSearchQuery = computed(() => {
    return repositories.value.filter(
      repository => repository.name.includes(searchQuery.value)
    )
  })

  return {
    repositories,
    getUserRepositories
  }
}
```

我们在 `setup` 的顶部使用了 `toRefs`。这是为了确保我们的侦听器能够对 `user` prop 所做的更改做出反应。



这样子，setup 中的内容会变得非常多，我们可以将部分功能提取到一个独立的`组合式函数`中：

```js
// src/composables/useUserRepositories.js

import { fetchUserRepositories } from '@/api/repositories'
import { ref, onMounted, watch } from 'vue'

export default function useUserRepositories(user) {
  const repositories = ref([])
  const getUserRepositories = async () => {
    repositories.value = await fetchUserRepositories(user.value)
  }

  onMounted(getUserRepositories)
  watch(user, getUserRepositories)

  return {
    repositories,
    getUserRepositories
  }
}
```

```js
// src/composables/useRepositoryNameSearch.js

import { ref, computed } from 'vue'

export default function useRepositoryNameSearch(repositories) {
  const searchQuery = ref('')
  const repositoriesMatchingSearchQuery = computed(() => {
    return repositories.value.filter(repository => {
      return repository.name.includes(searchQuery.value)
    })
  })

  return {
    searchQuery,
    repositoriesMatchingSearchQuery
  }
}
```

现在在单独的文件中有了这两个功能，我们就可以开始在组件中使用它们了：

```js
// src/components/UserRepositories.vue
import { toRefs } from 'vue'
import useUserRepositories from '@/composables/useUserRepositories'
import useRepositoryNameSearch from '@/composables/useRepositoryNameSearch'
import useRepositoryFilters from '@/composables/useRepositoryFilters'

export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: { type: String }
  },
  setup(props) {
    const { user } = toRefs(props)

    const { repositories, getUserRepositories } = useUserRepositories(user)

    const {
      searchQuery,
      repositoriesMatchingSearchQuery
    } = useRepositoryNameSearch(repositories)

    const {
      filters,
      updateFilters,
      filteredRepositories
    } = useRepositoryFilters(repositoriesMatchingSearchQuery)

    return {
      repositories: filteredRepositories,
      getUserRepositories,
      searchQuery,
      filters,
      updateFilters
    }
  }
}
```

这样就已经完成了想要达到的目的。这就是组合式 API 的用法。



## 5.2 Setup

使用 `setup` 函数时，它将接受两个参数：

1. `props`
2. `context`

让我们更深入地研究如何使用每个参数。

### 5.2.1 Props

`setup` 函数中的第一个参数是 `props`。正如在一个标准组件中所期望的那样，`setup` 函数中的 `props` 是响应式的，当传入新的 prop 时，它将被更新。

```js
// MyBook.vue

export default {
  props: {
    title: String
  },
  setup(props) {
    console.log(props.title)
  }
}
```

> 但是，因为 `props` 是响应式的，你**不能使用 ES6 解构**，因为它会消除 prop 的响应性。

如果需要解构 prop，可以通过使用 `setup` 函数中的 `toRefs` 来安全地完成此操作。

```js
// MyBook.vue

import { toRefs } from 'vue'

setup(props) {
	const { title } = toRefs(props)

	console.log(title.value)
}
```

### 5.2.2 context

传递给 `setup` 函数的第二个参数是 `context`。`context` 是一个普通的 JavaScript 对象，它暴露三个组件的 property：

```js
// MyBook.vue

export default {
  setup(props, context) {
    // Attribute (非响应式对象)
    console.log(context.attrs)

    // 插槽 (非响应式对象)
    console.log(context.slots)

    // 触发事件 (方法)
    console.log(context.emit)
  }
}
```

`context` 是一个普通的 JavaScript 对象，也就是说，它不是响应式的，这意味着你可以安全地对 `context` 使用 ES6 解构：

```js
// MyBook.vue
export default {
  setup(props, { attrs, slots, emit }) {
    ...
  }
}
```

`attrs` 和 `slots` 是有状态的对象，它们总是会随组件本身的更新而更新。这意味着你应该避免对它们进行解构，并始终以 `attrs.x` 或 `slots.x` 的方式引用 property。

> 但请注意，与 `props` 不同，`attrs` 和 `slots` 是**非**响应式的。如果你打算根据 `attrs` 或 `slots` 更改应用副作用，那么应该在 `onUpdated` 生命周期钩子中执行此操作。



执行 `setup` 时，组件实例尚未被创建。因此，你只能访问以下 property：

- `props`
- `attrs`
- `slots`
- `emit`

换句话说，你**将无法访问**以下组件选项：

- `data`
- `computed`
- `methods`



