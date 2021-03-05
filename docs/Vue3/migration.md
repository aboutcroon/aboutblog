# Vue3从Vue2中的迁移

# 1. v-for 中的 Ref 数组

在 Vue 2 中，在 `v-for` 里使用的 `ref` attribute 会用 ref 数组填充相应的 `$refs` property。当存在嵌套的 `v-for` 时，这种行为会变得不明确且效率低下。

在 Vue 3 中，这样的用法将不再在 `$ref` 中自动创建数组。要从单个绑定获取多个 ref，请将 `ref` 绑定到一个更灵活的函数上 (这是一个新特性)：

```html
<div v-for="item in list" :ref="setItemRef"></div>
```



结合 option API：

```js
export default {
  data() {
    return {
      itemRefs: []
    }
  },
  methods: {
    setItemRef(el) {
      this.itemRefs.push(el)
    }
  },
  beforeUpdate() {
    this.itemRefs = []
  },
  updated() {
    console.log(this.itemRefs)
  }
}
```

结合 composition API：

```js
import { ref, onBeforeUpdate, onUpdated } from 'vue'

export default {
  setup() {
    let itemRefs = []
    const setItemRef = el => {
      itemRefs.push(el)
    }
    onBeforeUpdate(() => {
      itemRefs = []
    })
    onUpdated(() => {
      console.log(itemRefs)
    })
    return {
      itemRefs,
      setItemRef
    }
  }
}
```

注意：

- `itemRefs` 不必是数组：它也可以是一个对象，其 ref 会通过迭代的 key 被设置。
- 如果需要，`itemRef` 也可以是响应式的且可以被监听。



# 2. 异步组件

变化内容为：

- 新的 `defineAsyncComponent` 助手方法，用于显式地定义异步组件
- `component` 选项重命名为 `loader`
- Loader 函数本身不再接收 `resolve` 和 `reject` 参数，且必须返回一个 Promise



以前，异步组件是通过将组件定义为返回 Promise 的函数来创建的，例如：

```js
const asyncPage = () => import('./NextPage.vue')
```

或者，对于带有选项的更高阶的组件语法：

```js
const asyncPage = {
  component: () => import('./NextPage.vue'),
  delay: 200,
  timeout: 3000,
  error: ErrorComponent,
  loading: LoadingComponent
}
```



现在，在 Vue 3 中，由于函数式组件被定义为纯函数，因此异步组件的定义需要通过将其包装在新的 `defineAsyncComponent` 助手方法中来显式地定义：

```js
import { defineAsyncComponent } from 'vue'
import ErrorComponent from './components/ErrorComponent.vue'
import LoadingComponent from './components/LoadingComponent.vue'

// 不带选项的异步组件
const asyncPage = defineAsyncComponent(() => import('./NextPage.vue'))

// 带选项的异步组件
const asyncPageWithOptions = defineAsyncComponent({
  loader: () => import('./NextPage.vue'),
  delay: 200,
  timeout: 3000,
  errorComponent: ErrorComponent,
  loadingComponent: LoadingComponent
})
```

此外，与 2.x 不同，loader 函数不再接收 `resolve` 和 `reject` 参数，且必须始终返回 Promise。

```js
// 2.x 版本
const oldAsyncComponent = (resolve, reject) => {
  /* ... */
}

// 3.x 版本
const asyncComponent = defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      /* ... */
    })
)
```



# 3. Data 选项

变化内容为：

- **非兼容**：`data` 组件选项声明不再接收纯 JavaScript `object`，而需要 `function` 声明。

- 当合并来自 mixin 或 extend 的多个 `data` 返回值时，现在是浅层次合并的而不是深层次合并的(只合并根级属性)。



在 Vue 2.x 中，开发者可以定义 `data` 选项是 `object` 或者是 `function`。

例如：

```html
<!-- Object 声明 -->
<script>
  const app = new Vue({
    data: {
      apiKey: 'a1b2c3'
    }
  })
</script>

<!-- Function 声明 -->
<script>
  const app = new Vue({
    data() {
      return {
        apiKey: 'a1b2c3'
      }
    }
  })
</script>
```

虽然这对于具有共享状态的根实例提供了一些便利，但是由于只有在根实例上才有可能，这导致了混乱。 



在 Vue 3.x，`data` 选项已标准化为只接受返回 `object` 的 `function`。

使用上面的示例，代码只有一个可能的实现：

```html
<script>
  import { createApp } from 'vue'

  createApp({
    data() {
      return {
        apiKey: 'a1b2c3'
      }
    }
  }).mount('#app')
</script>
```



Mixin 的合并行为发生了变更。当来自组件的 `data()` 及其 mixin 或 extends 基类被合并时，现在将`浅层次`执行合并：

```js
const Mixin = {
  data() {
    return {
      user: {
        name: 'Jack',
        id: 1
      }
    }
  }
}
const CompA = {
  mixins: [Mixin],
  data() {
    return {
      user: {
        id: 2
      }
    }
  }
}
```

在 Vue 2.x中，生成的 `$data` 是：

```json
{
  user: {
    id: 2,
    name: 'Jack'
  }
}
```

在 Vue 3.0 中，其结果将会是：

```json
{
  user: {
    id: 2
  }
}
```



# 4. 事件 API

在 vue2 中，vue 实例可通过事件触发 API 强制附加的处理程序 (`$on`，`$off` 和 `$once`)，这用于创建 event hub，以创建在整个应用程序中使用的全局事件侦听器（例如，由于插槽中不能使用ref，可以用全局事件侦听来使父组件能获取到子组件中的方法）：

```js
// eventHub.js

const eventHub = new Vue()

export default eventHub
```

```js
// ChildComponent.vue
import eventHub from './eventHub'

export default {
  mounted() {
    // 添加 eventHub listener
    eventHub.$on('custom-event', () => {
      console.log('Custom event triggered!')
    })
  },
  beforeDestroy() {
    // 移除 eventHub listener
    eventHub.$off('custom-event')
  }
}
```

```js
// ParentComponent.vue
import eventHub from './eventHub'

export default {
  methods: {
    callGlobalCustomEvent() {
      eventHub.$emit('custom-event') // 如果ChildComponent mounted，控制台中将显示一条消息
    }
  }
}
```



在 vue3 中，整个从实例中移除了 `$on`，`$off` 和 `$once` 方法，应用实例不再实现事件触发接口。

vue3 中，我们可以通过使用实现事件发射器接口的 `外部库 mitt` 来替换现有的 event hub。

下载安装 mitt：

```nginx
npm install mitt --save
```

引入并使用：

```vue
<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import mitt from 'mitt'
export const emitter = mitt()

export default defineComponent({
  setup(props, context) {
    const callback = (func?: ValidateFunc) => {
      if (func) {
        funcArr.push(func)
      }
    }
    
    emitter.on('form-item-created', callback)
    
    onUnmounted(() => {
      emitter.off('form-item-created', callback)
      funcArr = []
    })
    
    return {
      submitForm
    }
  }
})
</script>
```

组件销毁时，要将事件监听清理。当 `emitter.on` 设置完后，就会等待接收事件。这时可以在其他组件中将其引入并触发事件：

```vue
<script lang="ts">
import { defineComponent, reactive, PropType, onMounted, computed } from 'vue'
import { emitter } from './ValidateForm.vue'

export default defineComponent({
  setup(props, context) {
    const validateInput = () => {
      ...
    }
      
    onMounted(() => {
      emitter.emit('form-item-created', validateInput)
    })

    return {
      validateInput
    }
  }
})
</script>
```



# 5. filters

在 Vue 2.x，开发者可以使用过滤器来处理通用文本格式。

例如：

```html
<template>
  <h1>Bank Account Balance</h1>
  <p>{{ accountBalance | currencyUSD }}</p>
</template>

<script>
  export default {
    props: {
      accountBalance: {
        type: Number,
        required: true
      }
    },
    filters: {
      currencyUSD(value) {
        return '$' + value
      }
    }
  }
</script>
```

虽然这看起来很方便，但它需要一个自定义语法。



在 Vue 3.x 中，过滤器已删除，不再支持。相反地，我们建议用`方法调用`或`计算属性`替换它们。

使用计算属性改写上面的例子：

```html
<template>
  <h1>Bank Account Balance</h1>
  <p>{{ accountInUSD }}</p>
</template>

<script>
  export default {
    props: {
      accountBalance: {
        type: Number,
        required: true
      }
    },
    computed: {
      accountInUSD() {
        return '$' + this.accountBalance
      }
    }
  }
</script>
```



# 6. 片段

在 Vue 3 中，组件现在正式支持多根节点组件，即片段。



在 Vue 2.x 中，不支持多根组件，当用户意外创建多根组件时会发出警告，因此，为了修复此错误，许多组件被包装在一个 `<div>` 中。

```html
<!-- Layout.vue -->
<template>
  <div>
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
  </div>
</template>
```



在 Vue 3.x 中，组件现在可以有多个根节点。但是，这确实要求开发者明确定义属性应该分布在哪里。

```html
<!-- Layout.vue -->
<template>
  <header>...</header>
  <main v-bind="$attrs">...</main>
  <footer>...</footer>
</template>
```

有关 Attribute 继承如何工作的详细信息可查看 `非 Prop 的 Attribute`



# 7. 全局 API

Vue 2.x 有许多全局 API 和配置，这些 API 和配置可以全局改变 Vue 的行为。例如，要创建全局组件，可以使用 `Vue.component` 这样的 API：

```js
Vue.component('button-counter', {
  data: () => ({
    count: 0
  }),
  template: '<button @click="count++">Clicked {{ count }} times.</button>'
})
```

类似地，使用全局指令的声明方式如下：

```js
Vue.directive('focus', {
  inserted: el => el.focus()
})
```

虽然这种声明方式很方便，但它也会导致一些问题。从技术上讲，Vue 2 没有“app”的概念，我们定义的应用只是通过 `new Vue()` 创建的根 Vue 实例。从同一个 Vue 构造函数**创建的每个根实例共享相同的全局配置**，因此：

- 在测试期间，全局配置很容易意外地污染其他测试用例。用户需要仔细存储原始全局配置，并在每次测试后恢复 (例如重置 `Vue.config.errorHandler`)。有些 API 像 `Vue.use` 以及 `Vue.mixin` 甚至连恢复效果的方法都没有，这使得涉及插件的测试特别棘手。实际上，vue-test-utils 必须实现一个特殊的 API `createLocalVue` 来处理此问题：

```js
import { createLocalVue, mount } from '@vue/test-utils'

// 建扩展的 `Vue` 构造函数
const localVue = createLocalVue()

// 在 “local” Vue构造函数上 “全局” 安装插件
localVue.use(MyPlugin)

// 通过 `localVue` 来挂载选项
mount(Component, { localVue })
```

- 全局配置使得在同一页面上的多个“app”之间共享同一个 Vue 副本非常困难，但全局配置不同。

  ```js
  // 这会影响两个根实例
  Vue.mixin({
    /* ... */
  })
  
  const app1 = new Vue({ el: '#app-1' })
  const app2 = new Vue({ el: '#app-2' })
  ```



为了避免这些问题，在 Vue 3 中我们引入了一个新的全局 API：`createApp`

调用 `createApp` 返回一个应用实例，这是 Vue 3 中的新概念：

```js
import { createApp } from 'vue'

const app = createApp({})
```



应用实例暴露当前全局 API 的子集，任何全局改变 Vue 行为的 API 现在都会移动到应用实例上，以下是当前全局 API 及其相应实例 API 的表：

| 2.x 全局 API               | 3.x 实例 API (`app`)       |
| -------------------------- | -------------------------- |
| Vue.config                 | app.config                 |
| Vue.config.productionTip   | 移除                       |
| Vue.config.ignoredElements | app.config.isCustomElement |
| Vue.component              | app.component              |
| Vue.directive              | app.directive              |
| Vue.mixin                  | app.mixin                  |
| Vue.use                    | app.use                    |



# 8. `key` Attribute

变化内容为：

- 对于 `v-if` / `v-else` / `v-else-if` 的各分支 `key` 选项将不再是必须的，因为现在 Vue 会自动生成唯一的 `key` 值。
- `<template v-for>` 的 `key` 应该设置在 `<template>` 标签上（而不是设置在它的子节点上）。



Vue 2.x 建议在 `v-if`/`v-else`/`v-else-if` 的分支中使用 `key`。

```html
<!-- Vue 2.x -->
<div v-if="condition" key="yes">Yes</div>
<div v-else key="no">No</div>
```



这个示例在 Vue 3.x 中仍能正常工作。但是我们不再建议在 `v-if`/`v-else`/`v-else-if` 的分支中继续使用 `key` attribute，因为没有为条件分支提供 `key` 时，也会自动生成唯一的 `key`。

```html
<!-- Vue 3.x -->
<div v-if="condition">Yes</div>
<div v-else>No</div>
```

非兼容变更体现在如果你手动提供了 `key`，那么每个分支都必须使用一个唯一的 `key`。因此大多数情况下都不需要设置这些 `key`。

```html
<!-- Vue 2.x -->
<div v-if="condition" key="a">Yes</div>
<div v-else key="a">No</div>

<!-- Vue 3.x (推荐做法: 去除 key 值) -->
<div v-if="condition">Yes</div>
<div v-else>No</div>

<!-- Vue 3.x (可选的做法: 确保 key 值是唯一的) -->
<div v-if="condition" key="a">Yes</div>
<div v-else key="b">No</div>
```



# 9. transition 的 class 名更改

transition 的类名 `v-enter` 修改为 `v-enter-from`、过渡类名 `v-leave` 修改为 `v-leave-from`。



在 Vue2 版本中, 引入 `v-enter-to` 来定义 enter 或 leave 变换之间的过渡动画插帧, 为了向下兼容, 并没有变动 `v-enter` 类名：

```css
.v-enter,
.v-leave-to {
  opacity: 0;
}

.v-leave,
.v-enter-to {
  opacity: 1;
}
```

这样做会带来很多困惑, 类似 *enter* 和 *leave* 含义过于宽泛并且没有遵循类名钩子的命名约定。



为了更加明确易读，我们现在将这些初始状态重命名为：

```css
.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.v-leave-from,
.v-enter-to {
  opacity: 1;
}
```

现在，这些状态之间的区别就清晰多了。

`<transition>` 组件相关属性名也发生了变化：

- `leave-class` 已经被重命名为 `leave-from-class` (在渲染函数或 JSX 中可以写为：`leaveFromClass`)
- `enter-class` 已经被重命名为 `enter-from-class` (在渲染函数或 JSX 中可以写为：`enterFromClass`)



# 10. v-model

变化内容为：

- prop: value -> modelValue
- event: input -> update:modelValue



在 Vue 2.x 中，在组件上使用 `v-model` 相当于绑定 `value` prop 和 `input` 事件：

```html
<ChildComponent v-model="pageTitle" />

<!-- 简写: -->

<ChildComponent :value="pageTitle" @input="pageTitle = $event" />
```

如果要将属性或事件名称更改为其他名称，则需要在 `ChildComponent` 组件中添加 `model` 选项：

```html
<!-- ParentComponent.vue -->

<ChildComponent v-model="pageTitle" />
```

```js
// ChildComponent.vue

export default {
  model: {
    prop: 'title',
    event: 'change'
  },
  props: {
    // 这将允许 `value` 属性用于其他用途
    value: String,
    // 使用 `title` 代替 `value` 作为 model 的 prop
    title: {
      type: String,
      default: 'Default title'
    }
  }
}
```



在 Vue 3.x 中，自定义组件上的 `v-model` 相当于传递了 `modelValue` prop 并接收抛出的 `update:modelValue` 事件：

```html
<ChildComponent v-model="pageTitle" />

<!-- 简写: -->

<ChildComponent
  :modelValue="pageTitle"
  @update:modelValue="pageTitle = $event"
/>
```



若需要更改 `model` 名称，而不是更改组件内的 `model` 选项，那么现在我们可以将一个 *argument* 传递给 `model`：

```html
<ChildComponent v-model:title="pageTitle" />

<!-- 简写: -->

<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" />
```



# 11. v-if 与 v-for 的优先级对比

在 Vue 2.x 版本中在一个元素上同时使用 `v-if` 和 `v-for` 时，`v-for` 会优先作用。

而在 Vue 3.x 版本中 `v-if` 总是优先于 `v-for` 生效。



由于语法上存在歧义，建议避免在同一元素上同时使用两者。

比起在模板层面管理相关逻辑，更好的办法是`通过创建计算属性`筛选出列表，并以此创建可见元素。



# 12. v-bind 合并行为

在 Vue 2.x 中，如果一个元素同时定义了 `v-bind="object"` 和一个相同的单独的 property，那么这个单独的 property 总是会覆盖 `object` 中的绑定。

```html
<!-- template -->
<div id="red" v-bind="{ id: 'blue' }"></div>
<!-- result -->
<div id="red"></div>
```



在 Vue 3.x 中，如果一个元素同时定义了 `v-bind="object"` 和一个相同的单独的 property，那么声明绑定的顺序决定了它们如何合并。换句话说，相对于假设开发者总是希望单独的 property 覆盖 `object` 中定义的内容，现在开发者对自己所希望的合并行为有了更好的控制。

```html
<!-- template -->
<div id="red" v-bind="{ id: 'blue' }"></div>
<!-- result -->
<div id="blue"></div>

<!-- template -->
<div v-bind="{ id: 'blue' }" id="red"></div>
<!-- result -->
<div id="red"></div>
```



# 13. slot

`slot` 插槽允许你像这样合成组件：

```html
<todo-button>
  Add todo
</todo-button>
```

然后在 `<todo-button>` 的模板中，你可能有：

```html
<!-- todo-button 组件模板 -->
<button class="btn-primary">
  <slot></slot>
</button>
```

当组件渲染的时候，将会被替换为“Add Todo”：

```html
<!-- 渲染 HTML -->
<button class="btn-primary">
  Add todo
</button>
```

不止是字符串，插槽还可以包括任何模版代码，包括 HTML 或其他组件。



#### 具名插槽

有时我们需要多个插槽。例如对于一个带有如下模板的 `<base-layout>` 组件：

```html
<div class="container">
  <header>
    <!-- 我们希望把页头放这里 -->
  </header>
  <main>
    <!-- 我们希望把主要内容放这里 -->
  </main>
  <footer>
    <!-- 我们希望把页脚放这里 -->
  </footer>
</div>
```

对于这样的情况，`<slot>` 元素有一个特殊的 attribute：`name`。这个 attribute 可以用来定义额外的插槽：

```html
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

一个不带 `name` 的 `<slot>` 出口会带有隐含的名字“default”。

在向具名插槽提供内容的时候，我们可以在一个 `<template>` 元素上使用 `v-slot` 指令，并以 `v-slot` 的参数的形式提供其名称：

```html
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <template v-slot:default>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </template>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

现在 `<template>` 元素中的所有内容都将会被传入相应的插槽。

渲染的 HTML 将会是：

```html
<div class="container">
  <header>
    <h1>Here might be a page title</h1>
  </header>
  <main>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </main>
  <footer>
    <p>Here's some contact info</p>
  </footer>
</div>
```

> 注意，**`v-slot` 只能添加在 `<template>`**，只有一种情况例外，如下述独占默认插槽的缩写写法。



#### 作用域插槽

有时我们需要让插槽内容能够访问子组件中才有的数据。

例如，我们有一个组件，包含 todo-items 的列表：

```js
app.component('todo-list', {
  data() {
    return {
      items: ['Feed a cat', 'Buy milk']
    }
  },
  template: `
    <ul>
      <li v-for="(item, index) in items">
        {{ item }}
      </li>
    </ul>
  `
})
```

我们可能需要替换插槽以在父组件上自定义它：

```html
<todo-list>
  <i class="fas fa-check"></i>
  <span class="green">{{ item }}</span>
</todo-list>
```

但直接这样写是行不通的，因为只有 `<todo-list>` 组件可以访问 `item`，要使 `item` 可用于父级提供的 slot 内容，我们可以添加一个 `<slot>` 元素并将其绑定为属性：

```html
<ul>
  <li v-for="( item, index ) in items">
    <slot :item="item"></slot>
  </li>
</ul>
```

绑定在 `<slot` > 元素上的 attribute 被称为**插槽 prop**。现在在父级作用域中，我们可以使用带值的 `v-slot` 来定义我们提供的插槽 prop 的名字：

```html
<todo-list>
  <template v-slot:default="slotProps">
    <i class="fas fa-check"></i>
    <span class="green">{{ slotProps.item }}</span>
  </template>
</todo-list>
```



#### 独占默认插槽的缩写语法

在上述情况下，`当被提供的内容只有默认插槽时，组件的标签才可以被当作插槽的模板来使用`。这样我们就可以把 `v-slot` 直接用在组件上，而不用写在 template 上：

```html
<todo-list v-slot:default="slotProps">
  <i class="fas fa-check"></i>
  <span class="green">{{ slotProps.item }}</span>
</todo-list>
```

我们还可以更简化的写，不带参数的 `v-slot` 被假定对应默认插槽：

```html
<todo-list v-slot="slotProps">
  <i class="fas fa-check"></i>
  <span class="green">{{ slotProps.item }}</span>
</todo-list>
```

注意默认插槽的缩写语法**不能**和具名插槽混用，因为它会导致作用域不明确：

```html
<!-- 无效，会导致警告 -->
<todo-list v-slot="slotProps">
  <todo-list v-slot:default="slotProps">
    <i class="fas fa-check"></i>
    <span class="green">{{ slotProps.item }}</span>
  </todo-list>
  <template v-slot:other="otherSlotProps">
    slotProps is NOT available here
  </template>
</todo-list>
```

所以，`只要出现多个插槽`，就一定要为所有的插槽使用完整的基于 `<template>` 的语法：

```html
<todo-list>
  <template v-slot:default="slotProps">
    <i class="fas fa-check"></i>
    <span class="green">{{ slotProps.item }}</span>
  </template>

  <template v-slot:other="otherSlotProps">
    ...
  </template>
</todo-list>
```



#### 解构插槽 Prop

在作用域插槽传值的情况下，可以使用解构来传入具体的插槽 prop，如下：

```html
<todo-list v-slot="{ item }">
  <i class="fas fa-check"></i>
  <span class="green">{{ item }}</span>
</todo-list>
```

这样可以使模板更简洁，`尤其是在该插槽提供了多个 prop 的时候`。它同样可以支持 prop 重命名等，例如将 `item` 重命名为 `todo`：

```html
<todo-list v-slot="{ item: todo }">
  <i class="fas fa-check"></i>
  <span class="green">{{ todo }}</span>
</todo-list>
```

还可以定义插槽的默认内容，用于插槽 prop 是 undefined 的情形：

```html
<todo-list v-slot="{ item = 'Placeholder' }">
  <i class="fas fa-check"></i>
  <span class="green">{{ item }}</span>
</todo-list>
```



#### 动态插槽名

`动态指令参数` 也可以用在 v-slot 上，用来定义动态的插槽名：

```html
<base-layout>
  <template v-slot:[dynamicSlotName]>
    ...
  </template>
</base-layout>
```



#### 具名插槽的缩写

跟 `v-on` 和 `v-bind` 一样，`v-slot` 也有缩写，即把参数之前的所有内容 (`v-slot:`) 替换为字符 `#`。例如 `v-slot:header` 可以被重写为 `#header`：

```html
<base-layout>
  <template #header>
    <h1>Here might be a page title</h1>
  </template>

  <template #default>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </template>

  <template #footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

和其它指令一样，该缩写只在其 `有参数的时候才可用`。这意味着以下语法是无效的：

```html
<!-- 这将会引发警告 -->
<todo-list #="{ item }">
  <i class="fas fa-check"></i>
  <span class="green">{{ item }}</span>
</todo-list>
```

如果希望使用缩写的话，必须始终以明确插槽名取而代之：

```html
<todo-list #default="{ item }">
  <i class="fas fa-check"></i>
  <span class="green">{{ item }}</span>
</todo-list>
```

