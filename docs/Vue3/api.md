# Vue3常用API

# 1. 应用配置

## 1.1 globalProperties

- **类型**：`[key: string]: any`
- **默认**：`undefined`
- **用法**：

```js
app.config.globalProperties.foo = 'bar'

app.component('child-component', {
  mounted() {
    console.log(this.foo) // 'bar'
  }
})
```

添加可以在应用程序内的任何组件实例中访问的全局 property。属性名冲突时，组件的 property 将具有优先权。

这可以代替 Vue 2.x `Vue.prototype` 扩展：

```js
// 之前(Vue 2.x)
Vue.prototype.$http = () => {}

// 之后(Vue 3.x)
const app = Vue.createApp({})
app.config.globalProperties.$http = () => {}
```



## 1.2 isCustomElement

- **类型**：`(tag: string) => boolean`
- **默认**：`undefined`
- **用法**：

```js
// 任何以“ion-”开头的元素都将被识别为自定义元素
app.config.isCustomElement = tag => tag.startsWith('ion-')
```



# 2. 全局 API

## 2.1 createApp

返回一个提供应用上下文的应用实例。应用实例挂载的整个组件树共享同一个上下文。

```js
const app = Vue.createApp({})
```

你可以在 `createApp` 之后链式调用其它方法，

### 参数

该函数接收一个根组件选项对象作为第一个参数：

```js
const app = Vue.createApp({
  data() {
    return {
      ...
    }
  },
  methods: {...},
  computed: {...}
  ...
})
```

使用第二个参数，我们可以将根 prop 传递给应用程序：

```js
const app = Vue.createApp(
  {
    props: ['username']
  },
  { username: 'Evan' }
)
```

```html
<div id="app">
  <!-- 会显示 'Evan' -->
  {{ username }}
</div>
```



## 2.2 h

返回一个”虚拟节点“，通常缩写为 **VNode**：一个普通对象，其中包含向 Vue 描述它应在页面上渲染哪种节点的信息，包括所有子节点的描述。它的目的是用于手动编写的渲染函数

```js
render() {
  return Vue.h('h1', {}, 'Some title')
}
```

### 参数

接收三个参数：`type`，`props` 和 `children`

type

- **类型：**`String | Object | Function`

- **详细：**

  HTML 标签名、组件或异步组件。使用返回 null 的函数将渲染一个注释。此参数是必需的。

props

- **类型：**`Object`

- **详细：**

  一个对象，与我们将在模板中使用的 attribute、prop 和事件相对应。可选。

children

- **类型：**`String | Array | Object`

- **详细：**

  子代 VNode，使用 `h()` 生成，或者使用字符串来获取“文本 VNode”，或带有插槽的对象。可选。

  ```js
  h('div', {}, [
    'Some text comes first.',
    h('h1', 'A headline'),
    h(MyComponent, {
      someProp: 'foobar'
    })
  ])
  ```



## 2.3 defineComponent

从实现上看，`defineComponent` 只返回传递给它的对象。但是，就类型而言，返回的值有一个合成类型的构造函数，用于手动渲染函数、TSX 和 IDE 工具支持。

### 参数

具有组件选项的对象

```js
import { defineComponent } from 'vue'

const MyComponent = defineComponent({
  data() {
    return { count: 1 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
})
```



或者是一个 `setup` 函数，函数名称将作为组件名称来使用

```js
import { defineComponent, ref } from 'vue'

const HelloWorld = defineComponent(function HelloWorld() {
  const count = ref(0)
  return { count }
})
```

## 2.4 defineAsyncComponent

创建一个只有在需要时才会加载的异步组件。

### 参数

对于基本用法，`defineAsyncComponent` 可以接受一个返回 `Promise` 的工厂函数。Promise 的 `resolve` 回调应该在服务端返回组件定义后被调用。你也可以调用 `reject(reason)` 来表示加载失败。

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

app.component('async-component', AsyncComp)
```



当使用局部注册时，你也可以直接提供一个返回 `Promise` 的函数：

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



对于高阶用法，`defineAsyncComponent` 可以接受一个对象：

`defineAsyncComponent` 方法还可以返回以下格式的对象：

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent({
  // 工厂函数
  loader: () => import('./Foo.vue')
  // 加载异步组件时要使用的组件
  loadingComponent: LoadingComponent,
  // 加载失败时要使用的组件
  errorComponent: ErrorComponent,
  // 在显示 loadingComponent 之前的延迟 | 默认值：200（单位 ms）
  delay: 200,
  // 如果提供了 timeout ，并且加载组件的时间超过了设定值，将显示错误组件
  // 默认值：Infinity（即永不超时，单位 ms）
  timeout: 3000,
  // 定义组件是否可挂起 | 默认值：true
  suspensible: false,
  /**
   *
   * @param {*} error 错误信息对象
   * @param {*} retry 一个函数，用于指示当 promise 加载器 reject 时，加载器是否应该重试
   * @param {*} fail  一个函数，指示加载程序结束退出
   * @param {*} attempts 允许的最大重试次数
   */
  onError(error, retry, fail, attempts) {
    if (error.message.match(/fetch/) && attempts <= 3) {
      // 请求发生错误时重试，最多可尝试 3 次
      retry()
    } else {
      // 注意，retry/fail 就像 promise 的 resolve/reject 一样：
      // 必须调用其中一个才能继续错误处理。
      fail()
    }
  }
})
```



## 2.5 resolveComponent

> `resolveComponent` 只能在 `render` 或 `setup` 函数中使用。

如果在当前应用实例中可用，则允许按名称解析 `component`。

返回一个 `Component`。如果没有找到，则返回 `undefined`。

```js
const app = Vue.createApp({})
app.component('MyComponent', {
  /* ... */
})
```

```js
import { resolveComponent } from 'vue'
render() {
  const MyComponent = resolveComponent('MyComponent')
}
```

### 参数

接受一个参数：`name`

- **类型：**`String`

- **详细：**

  已加载的组件的名称。



## 2.6 resolveDynamicComponent

> `resolveDynamicComponent` 只能在 `render` 或 `setup` 函数中使用。

允许使用与 `<component :is="">` 相同的机制来解析一个 `component`。

返回已解析的 `Component` 或新创建的 `VNode`，其中组件名称作为节点标签。如果找不到 `Component`，将发出警告。

```js
import { resolveDynamicComponent } from 'vue'
render () {
  const MyComponent = resolveDynamicComponent('MyComponent')
}
```

### 参数

接受一个参数：`component`

- **类型：**`String | Object (组件的选项对象)`

- **详细：**

  有关详细信息，参考动态组件。



## 2.7 resolveDirective

> `resolveDirective` 只能在 `render` 或 `setup` 函数中使用。

如果在当前应用实例中可用，则允许通过其名称解析一个 `directive`。

返回一个 `Directive`。如果没有找到，则返回 `undefined`。

```js
const app = Vue.createApp({})
app.directive('highlight', {})
```

```js
import { resolveDirective } from 'vue'
render () {
  const highlightDirective = resolveDirective('highlight')
}
```

### 参数

接受一个参数：`name`

- **类型：**`String`

- **详细：**

  已加载的指令的名称。



## 2.8 withDirectives

> `withDirectives` 只能在 `render` 或 `setup` 函数中使用。

允许将指令应用于 **VNode**。返回一个包含应用指令的 VNode。

```js
import { withDirectives, resolveDirective } from 'vue'
const foo = resolveDirective('foo')
const bar = resolveDirective('bar')

return withDirectives(h('div'), [
  [foo, this.x],
  [bar, this.y]
])
```

### 参数

接受两个参数：`vnode` 和 `directives`。

#### vnode

- **类型：**`vnode`

- **详细：**

  一个虚拟节点，通常使用 `h()` 创建。

#### directives

- **类型：**`Array`

- **详细：**

  一个指令数组。

  每个指令本身都是一个数组，最多可以定义 4 个索引，如以下示例所示。

  - `[directive]` - 该指令本身。必选。

  ```js
  const MyDirective = resolveDirective('MyDirective')
  const nodeWithDirectives = withDirectives(h('div'), [[MyDirective]])
  ```

  - `[directive, value]` - 上述内容，再加上分配给指令的类型为 `any` 的值。

  ```js
  const MyDirective = resolveDirective('MyDirective')
  const nodeWithDirectives = withDirectives(h('div'), [[MyDirective, 100]])
  ```

  - `[directive, value, arg]` - 上述内容，再加上一个 `string` 参数，比如：在 `v-on:click` 中的 `click`。

  ```js
  const MyDirective = resolveDirective('MyDirective')
  const nodeWithDirectives = withDirectives(h('div'), [
    [MyDirective, 100, 'click']
  ])
  ```

  - `[directive, value, arg, modifiers]` - 上述内容，再加上定义任何修饰符的 `key: value` 键值对 `Object`。

  ```js
  const MyDirective = resolveDirective('MyDirective')
  const nodeWithDirectives = withDirectives(h('div'), [
    [MyDirective, 100, 'click', { prevent: true }]
  ])
  ```



## 2.9 createRenderer

createRenderer 函数接受两个泛型参数： `HostNode` 和 `HostElement`，对应于宿主环境中的 Node 和 Element 类型。

例如，对于 runtime-dom，HostNode 将是 DOM `Node` 接口，HostElement 将是 DOM `Element` 接口。

自定义渲染器可以传入特定于平台的类型，如下所示：

```js
import { createRenderer } from 'vue'
const { render, createApp } = createRenderer<Node, Element>({
  patchProp,
  ...nodeOps
})
```

### 参数

接受两个参数：`HostNode` 和 `HostElement`。

#### HostNode

- **类型：**`Node`

- **详细：**

  宿主环境中的节点。

#### HostElement

- **类型：**`Element`

- **详细：**

  宿主环境中的元素。



## 2.10 nextTick

将回调推迟到下一个 DOM 更新周期之后执行。在更改了一些数据以等待 DOM 更新后立即使用它。

```js
import { createApp, nextTick } from 'vue'

const app = createApp({
  setup() {
    const message = ref('Hello!')
    const changeMessage = async newMessage => {
      message.value = newMessage
      await nextTick()
      console.log('Now DOM is updated')
    }
  }
})
```



# 3. 响应式基础 API

## 3.1 `reactive`

返回对象的响应式副本

```js
const obj = reactive({ count: 0 })
```

响应式转换是“深层”的——它影响所有嵌套 property。在基于 ES2015 的 Proxy 实现中，返回的代理是**不**等于原始对象。建议只使用响应式代理，避免依赖原始对象。

**类型声明：**

```ts
function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
```



`reactive` 和 ref 很相似，也是一个函数，只不过它里面的参数不是一个原始类型，而是一个 Object，可以把一系列的响应式数据放进去

使用reactive 时，操作 count 不用使用 data.count.value，可直接使用 data.count来操作，也就是 count 当成 data 下面的一个值

示例：

```vue
<template>
  <div>
    <h1>{{ data.count }}</h1>
    <h1>{{ data.double }}</h1>
    <button @click="data.increase">👍 +1</button>
  </div>
</template>

<script lang="ts">
import { computed, reactive } from 'vue'
interface DataProps {
  count: number
  increase: () => void
  double: number
}
export default {
  setup() {
    const data: DataProps = reactive({
      count: 0,
      increase: () => {
        data.count++
      },
      double: computed(() => {
        return data.count * 2
      }),
    })
    return {
      data
    }
  }
}
</script>
```

在这个示例中，使用 reactive 改写了之前的例子。

注意以下几点：

- data 下面的 count 是 `number` 类型，increase 是 `() => void` 类型，double 返回的是数值，所以也是 `number` 类型，这样子会使得 data 被推断成 `any` 类型，就会报错，此时需要定义一个接口来给 data 规定一个类型。
- 这个时候 return 的是一个 data，且在模版中使用 `data.xxx` 的形式来展示值



## 3.2 `readonly`

获取一个对象 (响应式或纯对象) 或 ref 并返回原始代理的只读代理。

只读代理是深层的：访问的任何嵌套 property 也是只读的。

```js
const original = reactive({ count: 0 })

const copy = readonly(original)

watchEffect(() => {
  // 适用于响应性追踪
  console.log(copy.count)
})

// 变更original 会触发侦听器依赖副本
original.count++

// 变更副本将失败并导致警告
copy.count++ // 警告!
```



## 3.3 `isProxy`

检查对象是 `reactive` 还是 `readonly` 创建的代理



## 3.4 `isReactive`

检查对象是否是 `reactive` 创建的响应式 proxy。

```js
import { reactive, isReactive } from 'vue'
export default {
  setup() {
    const state = reactive({
      name: 'John'
    })
    console.log(isReactive(state)) // -> true
  }
}
```

如果 proxy 是 `readonly` 创建的，但还包装了由 `reactive` 创建的另一个 proxy，它也会返回 `true`

```js
import { reactive, isReactive, readonly } from 'vue'
export default {
  setup() {
    const state = reactive({
      name: 'John'
    })
    // 从普通对象创建的只读代理
    const plain = readonly({
      name: 'Mary'
    })
    console.log(isReactive(plain)) // -> false

    // 从响应式代理创建的只读代理
    const stateCopy = readonly(state)
    console.log(isReactive(stateCopy)) // -> true
  }
}
```



## 3.5 `isReadonly`

检查对象是否是由 `readonly` 创建的只读代理。



## 3.6 `toRaw`

返回 `reactive` 或 `readonly` 代理的原始对象。这是一个转义口，可用于临时读取而不会引起代理访问/跟踪开销，也可用于写入而不会触发更改。

不建议保留对原始对象的持久引用。请谨慎使用。

```js
const foo = {}
const reactiveFoo = reactive(foo)

console.log(toRaw(reactiveFoo) === foo) // true
```



## 3.7 `markRaw`

标记一个对象，使其永远不会转换为代理。返回对象本身。

```js
const foo = markRaw({})
console.log(isReactive(reactive(foo))) // false

// 嵌套在其他响应式对象中时也可以使用
const bar = reactive({ foo })
console.log(isReactive(bar.foo)) // false
```

> 下方的 `markRaw` 和 shallowXXX API 使你可以有选择地选择退出默认的深度响应式/只读转换，并将原始的，非代理的对象嵌入状态图中。它们可以在各种情况下使用：
>
> - 有些值不应被设置为响应式的，例如复杂的第三方类实例或 Vue 组件对象。
> - 当渲染具有不可变数据源的大列表时，跳过代理转换可以提高性能。
>
> 它们被认为是高阶的，因为原始选择退出仅在根级别，因此，如果将嵌套的、未标记的原始对象设置为响应式对象，然后再次访问它，则可以得到代理版本。这可能会导致**本源危害**——即执行依赖于对象本身但同时使用同一对象的原始版本和代理版本的操作：
>
> ```js
> const foo = markRaw({
>   nested: {}
> })
> 
> const bar = reactive({
>   // 虽然 `foo` 被标记为原始，foo.nested 不是。
>   nested: foo.nested
> })
> 
> console.log(foo.nested === bar.nested) // false
> ```



## 3.8 `shallowReactive`

创建一个响应式代理，该代理跟踪其自身 property 的响应性，但不执行嵌套对象的深度响应式转换 (暴露原始值)。

```js
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 改变状态本身的性质是响应式的
state.foo++
// ...但是不转换嵌套对象
isReactive(state.nested) // false
state.nested.bar++ // 非响应式
```



## 3.9 `shallowReadonly`

创建一个代理，使其自身的 property 为只读，但不执行嵌套对象的深度只读转换 (暴露原始值)。

```js
const state = shallowReadonly({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 改变状态本身的property将失败
state.foo++
// ...但适用于嵌套对象
isReadonly(state.nested) // false
state.nested.bar++ // 适用
```



# 4. Refs

## 4.1 ref

`ref` 接受一个内部值并返回一个 `响应式` 且 `可变` 的 ref 对象。ref 对象具有指向内部值的单个 property `.value`。

使用 ref 一般传入的是 JavaScript 的原始类型。

示例：

```js
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

如果将对象分配为 ref 值，则可以通过 `reactive` 方法使该对象具有高度的响应式（下面会提到）。



示例：

```vue
<template>
  <div>
    <h1>{{ count }}</h1>
    <button @click="increase">👍 +1</button>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const increase = () => {
      count.value ++
    }
    return {
      count,
      increase
    }
  }
}
</script>
```

在这个示例中，我们通过点击按钮，来实现 count 值每次加 1。

首先我们需要一个 `setup()` 方法。在 setup() 方法中，没法访问 this，因为 setup() 是与 created() 钩子函数同时间触发的。我们不能直接在 data 中访问对象，要引入一个 ref。

示例中，count 是一个 Ref 类型：

```typescript
count: Ref<number>
```

注意以下几点：

- 示例中的 count 是一个响应式对象，不能直接在 count 上更新它的值，而是要在它的 value 上才能更新值
- 通过 return 导出去的值才能在模版中被使用

- 在 vue 内部，对于一个 ref 对象，在模版中被引用的时候，可以帮你直接把里面的值给展示出来，所以可以直接在模版中写 count，而不是 count.value



## 4.2 `unref`

如果参数为 `ref`，则返回内部值，否则返回参数本身。相当于 `val = isRef(val) ? val.value : val`

```js
function useFoo(x: number | Ref<number>) {
  const unwrapped = unref(x) // unwrapped 确保现在是数字类型
}
```



## 4.3 `toRef`

可以用来为源响应式对象上的 property 性创建一个 `ref`。然后可以将 ref 传递出去，从而保持对其源 property 的响应式连接。

```js
const state = reactive({
  foo: 1,
  bar: 2
})

const fooRef = toRef(state, 'foo')

fooRef.value++
console.log(state.foo) // 2

state.foo++
console.log(fooRef.value) // 3
```

当你要将 prop 的 ref 传递给复合函数时，`toRef` 很有用：

```js
export default {
  setup(props) {
    useSomeFeature(toRef(props, 'foo'))
  }
}
```



## 4.4 `toRefs`

将响应式对象转换为普通对象，其中结果对象的每个 property 都是指向原始对象相应 property 的 `ref`。

```js
const state = reactive({
  foo: 1,
  bar: 2
})

const stateAsRefs = toRefs(state)
/*
Type of stateAsRefs:

{
  foo: Ref<number>,
  bar: Ref<number>
}
*/

// ref 和 原始property “链接”
state.foo++
console.log(stateAsRefs.foo.value) // 2

stateAsRefs.foo.value++
console.log(state.foo) // 3
```



当从合成函数返回响应式对象时，`toRefs` 非常有用，这样消费组件就可以在不丢失响应性的情况下对返回的对象进行分解/扩散：

```js
function useFeatureX() {
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // 逻辑运行状态

  // 返回时转换为ref
  return toRefs(state)
}

export default {
  setup() {
    // 可以在不失去响应性的情况下破坏结构
    const { foo, bar } = useFeatureX()

    return {
      foo,
      bar
    }
  }
}
```



## 4.5 `isRef`

检查某个值是不是一个 ref 对象



## 4.6 `customRef`

创建一个自定义的 ref，并对其依赖项跟踪和更新触发进行显式控制。它需要一个工厂函数，该函数接收 `track` 和 `trigger` 函数作为参数，并应返回一个带有 `get` 和 `set` 的对象。

- 使用 `v-model` 使用自定义 ref 实现 `debounce` 的示例：

  ```html
  <input v-model="text" />
  ```

  ```js
  function useDebouncedRef(value, delay = 200) {
    let timeout
    return customRef((track, trigger) => {
      return {
        get() {
          track()
          return value
        },
        set(newValue) {
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            value = newValue
            trigger()
          }, delay)
        }
      }
    })
  }
  
  export default {
    setup() {
      return {
        text: useDebouncedRef('hello')
      }
    }
  }
  ```

**归类：**

```ts
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}
```



## 4.7 `shallowRef`

创建一个 ref，它跟踪自己的 `.value` 更改，但不会使其值成为响应式的。

```js
const foo = shallowRef({})
// 改变 ref 的值是响应式的
foo.value = {}

// 但是这个值不会被转换。
isReactive(foo.value) // false
```



## 4.8 `triggerRef`

手动执行与 `shallowRef` 关联的任何效果。

```js
const shallow = shallowRef({
  greet: 'Hello, world'
})

// 第一次运行时记录一次 "Hello, world"
watchEffect(() => {
  console.log(shallow.value.greet)
})

// 这不会触发作用，因为 ref 很浅层
shallow.value.greet = 'Hello, universe'

// 记录 "Hello, universe"
triggerRef(shallow)
```



# 5. Computed 与 Watch

## 5.1 computed 计算值 

computed 是一个函数，它有一个参数，这个参数是一个回调函数。

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
import { ref, computed } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const double = computed(() => {
      return count.value * 2
    })
    const increase = () => {
      count.value ++
    }
    return {
      count,
      double,
      increase
    }
  }
}
</script>
```

在这个示例中，double 展示的是通过计算得到的两倍的 count 值。

示例中，double 是一个类似于 Ref 的 ComputedRef 类型：

```typescript
double: ComputedRef<number>
```



## 5.2 watch

示例：

```vue
<template>
  <div>
    <h1>{{ greetings }}</h1>
    <button @click="updateGreeting">update title</button>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
export default {
  setup() {
    const greetings = ref('')
    const updateGreeting = () => {
      greetings.value += 'Hello!'
    }
    document.title = 'updated' + greetings.value
    return {
      greetings,
      updateGreeting,
    }
  }
}
</script>
```

上述代码中，我们想要在每次更新 greeting 的值时也同时更新网页的 title ，但是会发现只更新了greeting 的值，没有更新 document.title，这是因为 setup() 和 created 是同时进行的，而且只会触发一次，所以每次数据更新的时候不会再次触发。

此时我们想要实时更新网页的 title，则需要用到 `watch`。

watch 的第一个参数是要侦测的对象（可以是一个数组，数组中放多个对象），第二个参数是要执行的回调函数。回调函数中也有两个参数，分别是新的值和旧的值，当第一个参数为数组时，新的值和旧的值这两个参数也会变成数组。

我们用 watch 改写上述示例：

```vue
<template>
  <div>
    <h1>{{ greetings }}</h1>
    <button @click="updateGreeting">update title</button>
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue'
export default {
  setup() {
    const greetings = ref('11')
    const updateGreeting = () => {
      greetings.value += 'Hello!'
    }
    
    watch(greetings, (newValue, oldValue) => {
      document.title = 'updated' + greetings.value
    })
    
    return {
      greetings,
      updateGreeting,
    }
  }
}
</script>
```

注意，watch 能够侦测的值是：

- getter / effect function
- ref
- reactive object
- an array of these types



# 6. composition API（组合式 API）

## 6.1 `setup`

一个组件选项，在创建组件**之前**执行，一旦 `props` 被解析，并作为组合式 API 的入口点

- **入参：**
  - `{Data} props`
  - `{SetupContext} context`
- **类型声明**：

```ts
interface Data {
  [key: string]: unknown
}

interface SetupContext {
  attrs: Data
  slots: Slots
  emit: (event: string, ...args: unknown[]) => void
}

function setup(props: Data, context: SetupContext): Data
```

> 若要获取传递给 `setup()` 的参数的类型推断，必须使用 defineComponent。

- **示例：**

  使用模板：

  ```vue
  <!-- MyBook.vue -->
  <template>
    <div>{{ readersNumber }} {{ book.title }}</div>
  </template>
  
  <script>
    import { ref, reactive } from 'vue'
  
    export default {
      setup() {
        const readersNumber = ref(0)
        const book = reactive({ title: 'Vue 3 Guide' })
  
        // expose to template
        return {
          readersNumber,
          book
        }
      }
    }
  </script>
  ```

  

  使用渲染函数：

  ```js
  // MyBook.vue
  
  import { h, ref, reactive } from 'vue'
  
  export default {
    setup() {
      const readersNumber = ref(0)
      const book = reactive({ title: 'Vue 3 Guide' })
      // 请注意，我们需要在这里显式地暴露ref值
      return () => h('div', [readersNumber.value, book.title])
    }
  }
  ```



## 6.2 Provide / Inject

`provide` 和 `inject` 启用依赖注入。只有在使用当前活动实例的 `setup()` 期间才能调用这两者。

- **类型声明**：

```ts
interface InjectionKey<T> extends Symbol {}

function provide<T>(key: InjectionKey<T> | string, value: T): void

// without default value
function inject<T>(key: InjectionKey<T> | string): T | undefined
// with default value
function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T
```



Vue 提供了一个 `InjectionKey` 接口，该接口是扩展 `Symbol` 的泛型类型。它可用于在提供者和消费者之间同步注入值的类型：

```ts
import { InjectionKey, provide, inject } from 'vue'

const key: InjectionKey<string> = Symbol()

provide(key, 'foo') // 提供非字符串值将导致错误

const foo = inject(key) // foo 的类型: string | undefined
```

如果使用字符串 key 或非类型化 symbols，则需要显式声明注入值的类型：

```ts
const foo = inject<string>('foo') // string | undefined
```



## 6.3 `getCurrentInstance`

`getCurrentInstance` 允许访问内部组件实例。

```ts
import { getCurrentInstance } from 'vue'

const MyComponent = {
  setup() {
    const internalInstance = getCurrentInstance()

    internalInstance.appContext.config.globalProperties // 通过此可以访问 globalProperties
  }
}
```



`getCurrentInstance` 只能在 setup 和 生命周期函数中使用。

```ts
const MyComponent = {
  setup() {
    const internalInstance = getCurrentInstance() // 生效

    const id = useComponentId() // 生效

    const handleClick = () => {
      getCurrentInstance() // 不生效
      useComponentId() // 不生效

      internalInstance // 不生效
    }

    onMounted(() => {
      getCurrentInstance() // 生效
    })

    return () =>
      h(
        'button',
        {
          onClick: handleClick
        },
        `uid: ${id}`
      )
  }
}
```



# 7. 模块化

使用 Composition API 进行模块化。

### 7.1 例子1

有这样一个需求，我们在每次点击屏幕的时候需要展示当前鼠标的 x 和 y 坐标，示例如下：

```vue
<template>
  <div>
    <h1>x: {{ x }}</h1>
    <h1>y: {{ y }}</h1>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
export default {
  setup() {
    const x = ref(0)
    const y = ref(0)
    const updateMouse = (e: MouseEvent) => {
      x.value = e.pageX
      y.value = e.pageY
    }
    onMounted(() => {
      document.addEventListener('click', updateMouse)
    })
    onUnmounted(() => {
      document.removeEventListener('click', updateMouse)
    })
    return {
      x,
      y,
    }
  }
}
</script>
```

如上示例，我们在当前组件实现了该需求。但当我们需要重用当前逻辑到另一个组件时呢？这时候我们可以将这个逻辑抽离出去，我们可以在 src 目录下新建文件夹 hooks，在里面放置各种重用逻辑的 ts 文件。

我们将逻辑放入 `hooks/useMousePosition.ts` 中：

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
function useMousePosition() {
  const x = ref(0)
  const y = ref(0)
  const updateMouse = (e: MouseEvent) => {
    x.value = e.pageX
    y.value = e.pageY
  }
  onMounted(() => {
    document.addEventListener('click', updateMouse)
  })
  onUnmounted(() => {
    document.removeEventListener('click', updateMouse)
  })
  return { x, y }
}

export default useMousePosition
```

再在组件中将其引入：

```vue
<template>
  <div>
    <h1>x: {{ x }}</h1>
    <h1>y: {{ y }}</h1>
  </div>
</template>

<script lang="ts">
// 模块化
import { ref, onMounted, onUnmounted } from 'vue'
import useMousePosition from '../hooks/useMousePosition'
export default {
  setup() {
    const { x, y } = useMousePosition()
    return {
      x,
      y,
    }
  }
}
</script>
```

这种模块化方式的优点是：

- 我们可以很清楚的知道上述 x 和 y 两个值的来源
- 我们可以给 x 和 y 设置任意的别名，这样也就避免了命名冲突
- 逻辑可以脱离整个组件而存在

### 7.2 例子2

当我们要实现这么一个需求，发送 HTTP 请求时显示 loading，当数据接收完毕时去掉 loading，显示数据。

我们将这么一个复用逻辑写在 `hooks/useURLLoader.ts` 中：

```typescript
import { ref } from 'vue'
import axios from 'axios'

function useURLLoader(url: string) {
  const result = ref(null)
  const loading = ref(true)
  const loaded = ref(false)
  const error = ref(null)

  axios.get(url).then(rawData => {
    loading.value = false
    loaded.value = true
    result.value = rawData.data
  }).catch(e => {
    error.value = e
  })

  return {
    result,
    loading,
    loaded,
    error,
  }
}

export default useURLLoader
```

在组件中引用它：

```vue
<template>
  <div>
    <h1 v-if="loading">Loading ...</h1>
    <img v-if="loaded" :src="result.message" alt="dog">
  </div>
</template>

<script lang="ts">
import { toRefs } from 'vue'
import useURLLoader from '../hooks/useURLLoader'
export default {
  setup() {
    const { result, loading, loaded, error } = useURLLoader('https://dog.ceo/api/breeds/image/random')
    return {
      result,
      loading,
      loaded,
      error,
    }
  }
}
</script>
```

这时候，当发送请求时，页面会显示 `loading...`，当返回成功时，则展示返回数据中的图片。

### 7.3 模块化结合 TypeScript

在现实中，我们发送 HTTP 请求时获取到的数据的类型可能和我们想要的会大相径庭，这时我们可以结合 TypeScript 来约束类型。

例如我们取 `result.value.message` 时，会报错，因为 `result.value` 是 null 类型，在 null 类型中再去通过 `.` 取值就会报错。这时我们可以通过 TypeScript 的泛型来给其一个类型。

改写后，`hooks/useURLLoader.ts` 中的代码：

```typescript
import { ref } from 'vue'
import axios from 'axios'

function useURLLoader<T>(url: string) {
  const result = ref<T | null>(null)
  const loading = ref(true)
  const loaded = ref(false)
  const error = ref(null)

  axios.get(url).then(rawData => {
    loading.value = false
    loaded.value = true
    result.value = rawData.data
  }).catch(e => {
    error.value = e
  })

  return {
    result,
    loading,
    loaded,
    error,
  }
}

export default useURLLoader
```

改写后的组件中：

```vue
<template>
  <div>
    <h1 v-if="loading">Loading ...</h1>
    <img v-if="loaded" :src="result.message" alt="dog">
  </div>
</template>

<script lang="ts">
import { watch } from 'vue'
import useURLLoader from '../hooks/useURLLoader'
interface DogType {
  message: string
  status: string
}
export default {
  setup() {
    const { result, loading, loaded, error } = useURLLoader<DogType>('https://dog.ceo/api/breeds/image/random')
    
    watch(result, () => {
      console.log(result.value?.message)
    })
      
    return {
      result,
      loading,
      loaded,
      error,
    }
  }
}
</script>
```

result 一开始是什么都没有，类型是 null，当加载完数据后就有了类型，所以类型是 `<T | null>` 。这时 TypeScript 就会自动帮我们判断 result 是否是 null 类型。

因为期望接口的数据返回的是两个 string，我们将其放到 interface DogType 中，以约束返回的数据类型，这时 result 的类型就变化了：

```typescript
result: Ref<{message: string; status: string;} | null>
```

并且在写 `result.value.` 时，后面会自动补全 message 和 status 两个选项。



这时，当我们又有另一个返回不同结构数据的 API 时，则可以定义另一个 interface 类型，比较灵活。



# 8. defineComponent 与 setup

要让 TypeScript 正确推断 Vue 组件选项中的类型，需要使用 `defineComponent` 全局方法定义组件：

```typescript
import { defineComponent } from 'vue'

const Component = defineComponent({
  // 已启用类型推断
})
```

defineComponent 方法对于 TypeScript 来说是非常友好的，我们以后写的组件都可以使用这个函数进行包裹，它能让传入的对象获得非常多的类型。在这个方法中，我们也可以写 vue2 中的关键字和方法。

当 TypeScript 和 Options API 一起使用时， TypeScript 应该能够在不显式定义类型的情况下推断大多数类型。例如，如果有一个具有数字 `count` property 的组件，如果试图对其调用特定于字符串的方法，则会出现错误：

```typescript
const Component = defineComponent({
  data() {
    return {
      count: 0
    }
  },
  mounted() {
    const result = this.count.split('') // 错误 Property 'split' does not exist on type 'number'
  }
})
```



从实现上看，`defineComponent` 只返回传递给它的对象。但是，就类型而言，返回的值有一个合成类型的构造函数，用于手动渲染函数、TSX 和 IDE 工具支持。



`setup()` 方法也是写在 defineComponent 中。setup() 方法有两个参数，`props` 和 `context`，context 是上下文对象，它提供了 this 上面最常访问的三个对象：`attrs`、`slots` 和 `emit`。分别对应 vue2 中的属性、插槽、和触发事件。这三个值都会自动同步成最新的值。

> 若要获取传递给 `setup()` 的参数的类型推断，使用 defineComponent 是必需的。



# 9. PropType

对于定义了 `type` 的 prop ，需要执行运行时验证。我们要将这些类型提供给 TypeScript，此时我们则需要使用 `PropType` 来强制转换构造函数。

首先看一个例子，如果你有一个复杂的类型或接口，你可以使用 TypeScript 的 `类型断言` 对其进行强制转换：

```typescript
interface Book {
  title: string
  author: string
  year: number
}

const Component = defineComponent({
  data() {
    return {
      book: {
        title: 'Vue 3 Guide',
        author: 'Vue Team',
        year: 2020
      } as Book
    }
  }
})
```

而当对定义了 type 的 prop 进行类型验证时，不能直接使用类型断言。如以下示例的数组类型，因为 Array 是一个数组的构造函数，它不是一个类型，你没法把它断言成一个类型。这时就需要用到 propType，propType 接收一个泛型，然后将 Array 的构造函数返回传入的泛型类型。

```vue
<script>
import { defineComponent, PropType } from 'vue'
interface ColumnProps {
  id: number;
  title: string;
  avatar?: string;
  description: string;
}

export default defineComponent({
  props: {
    list: {
      // type: Array as ColumnProps,  // 错误
      type: Array as PropType<ColumnProps[]>,  // 正确
      required: true,
    }
  },
})
</script>
```


