# VueRouter@next

# 1. 路由基础

## 1.1 基本使用

使用 npm 安装：

```nginx
npm install vue-router@4
```



当 Vue Router 被添加之后，就会自动内置两个组件：`router-link` 和 `router-view`

```html
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vue-router@4"></script>

<div id="app">
  <h1>Hello App!</h1>
  <p>
    <!-- 使用 router-link 组件 来导航 -->
    <!-- 通过传入 `to` 属性来指定链接 -->
    <!-- `<router-link>` 默认会被渲染成一个 `<a>` 标签 -->
    <router-link to="/">Go to Home</router-link>
    <router-link to="/about">Go to About</router-link>
  </p>
  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这 -->
  <router-view></router-view>
</div>
```



`router-link`

我们使用自定义组件 router-link 来创建链接，而不是使用常规的 a 标记。这可以允许 Vue Router 改变 URL 而无需重新加载页面，处理 URL 生成以及它的编码。我们将从这些特性中获益。



`router-view`

router-view 将显示所匹配到的 url 所对应的组件。你可以把它放在任何地方，以适应你的布局。



在  JavaScript 中使用：

```js
// 1. 定义路由组件.
// 这些路由组件可以从其他文件中 import 进来
const Home = { template: '<div>Home</div>' }
const About = { template: '<div>About</div>' }

// 2. 定义一些路由
// 每个路由映射一个组件
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
]

// 3. 创建 router 实例，然后传 routes 配置进去
// 你还可以传别的配置参数，如 meta 等
const router = VueRouter.createRouter({
  // 4. 提供历史记录的实现接口，在这里先简单的使用哈希历史记录
  history: VueRouter.createWebHashHistory(),
  routes,
})

// 5. 创建和挂载根实例
const app = Vue.createApp({})
// 要通过 router 配置参数注入路由，从而让整个应用都有路由功能
app.use(router)

app.mount('#app')

// 现在，应用就启动了
```

通过注入 `app.use(router)`，我们可以在任何组件内通过 `this.$router` 访问路由器，也可以通过 `this.$route` 访问当前路由：

```js
// Home.vue
export default {
  computed: {
    username() {
      // param 是动态路由中匹配到的动态路径参数
      return this.$route.params.username
    },
  },
  methods: {
    goToDashboard() {
      if (isAuthenticated) {
        this.$router.push('/dashboard')
      } else {
        this.$router.push('/login')
      }
    },
  },
}
```

为了能访问到 `setup` 中的 router 和 route，我们需要调用 `useRouter` 和 `useRoute` 函数。



## 1.2 动态路由匹配

我们经常需要把某种模式匹配到的所有路由，全都映射到同个组件。例如，有一个 `User` 组件，对于所有 ID 各不相同的用户，都要使用这个组件来渲染。那么，我们可以在 `vue-router` 的路由路径中使用 `动态路径参数` 来达到这个效果：

```js
const User = {
  template: '<div>User</div>',
}

// 这些路由会被传递到 createRouter 中
const routes = [
  // 动态路径参数以冒号开头
  { path: '/users/:id', component: User },
]
```

这样子，像 `/user/johnny` 和 `/user/jolyne` 的路径都将映射到相同的路由。

动态路径参数 `param` 是以冒号`:` 开头。当路由匹配时，其参数值将通过 `this.$route.params` 在每个组件中暴露出来。因此，我们可以通过将`User`的模板像下面这样渲染来呈现当前用户 ID：

```js
const User = {
  template: '<div>User {{ $route.params.id }}</div>',
}
```



你还可以在同一路径中具有多个参数，它们将映射到上的相应字段 `$route.params`，如下例子所示：

| pattern                        | matched path             | $ route.params                           |
| ------------------------------ | ------------------------ | ---------------------------------------- |
| /users/:username               | /users/eduardo           | `{ username: 'eduardo' }`                |
| /users/:username/posts/:postId | /users/eduardo/posts/123 | `{ username: 'eduardo', postId: '123' }` |

除了 `$route.params` 外，`$route` 对象还提供了其它有用的信息，例如，`$route.query` (如果 URL 中有查询参数)、`$route.hash` 等等。



### 1.2.1 响应路由参数的变化

当使用路由参数时，例如从 `/user/johnny` 导航到 `/user/jolyne`时，**原来的组件实例会被复用**。因为两个路由都渲染同个组件，比起销毁再创建，复用则显得更加高效。**不过，这也意味着组件的生命周期钩子不会再被调用**。

因此，复用组件时，想对路由参数的变化作出响应的话，可以使用侦听器 watch 来检测变化的 `$route` 对象：

```js
const User = {
  template: '...',
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // 对路由变化作出响应
      }
    )
  },
}
```

或者使用 `beforeRouteUpdate` 路由守卫：

```js
const User = {
  template: '...',
  async beforeRouteUpdate(to, from) {
    // 对路由变化作出响应
    this.userData = await fetchUser(to.params.id)
  },
}
```



### 1.2.2 捕获所有路由或 404 Not found 路由

常规参数只会匹配被 `/` 分隔的 URL 片段中的字符。如果想匹配**任意路径**，我们可以使用 `自定义正则表达式参数`，通过在参数后面加上括号内的正则表达式。

```js
const routes = [
  // 会匹配所有路径并且将之放到 `$route.params.pathMatch` 下面
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  // 会匹配所有以 `/user-` 开头的路径并且将之放到 `$route.params.afterUser` 下面
  { path: '/user-:afterUser(.*)', component: UserGeneric },
]
```

在这种特定情况下，我们在括号内使用 `自定义正则表达式`，并将 pathMatch 参数作为可选的重复参数，这可以让我们直接导航到相应路由，如果我们需要将路径拆分到一个数组中：

```js
this.$router.push({
  name: 'NotFound',
  params: { pathMatch: this.$route.path.split('/') },
})
```



## 1.3 嵌套路由

实际生活中的应用界面，通常由多层嵌套的组件组合而成。同样地，URL 中各段动态路径也按某种结构对应嵌套的各层组件，例如：

```
/user/johnny/profile                     /user/johnny/posts
+------------------+                  +-----------------+
| User             |                  | User            |
| +--------------+ |                  | +-------------+ |
| | Profile      | |  +------------>  | | Posts       | |
| |              | |                  | |             | |
| +--------------+ |                  | +-------------+ |
+------------------+                  +-----------------+
```

使用 vue-router 的 `嵌套路由` 则可实现这种结构。

如下例子：

```html
<div id="app">
  <router-view></router-view>
</div>
```

```js
const User = {
  template: '<div>User {{ $route.params.id }}</div>',
}

// routes 会被传递到 `createRouter`
const routes = [{ path: '/user/:id', component: User }]
```

这里的 `<router-view>` 是最顶层的出口，渲染最高级路由匹配到的组件。同样地，一个被渲染组件同样可以包含自己的嵌套 `<router-view>`。例如，在 `User` 组件的模板添加一个 `<router-view>`：

```js
const User = {
  template: `
    <div class="user">
      <h2>User {{ $route.params.id }}</h2>
      <router-view></router-view>
    </div>
  `,
}
```

要在嵌套的 `router-view` 中渲染组件，则需要在 routes 的参数中使用 `children` 配置：

```js
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        // 当 /user/:id/profile 匹配成功时
        // UserProfile 会被渲染在 User 的 <router-view> 中
        path: 'profile',
        component: UserProfile,
      },
      {
        // 当 /user/:id/posts 匹配成功时
        // UserPosts 会被渲染在 User 的 <router-view> 中
        path: 'posts',
        component: UserPosts,
      },
    ],
  },
]
```

**以 `/` 开头的嵌套路径会被当作根路径。 这可以让你充分的使用嵌套组件而无须设置嵌套的路径。**

`children` 配置就是像 `routes` 配置一样的路由配置数组，所以可以嵌套多层路由。

此时，基于上面的配置，当你访问 `/user/eduardo` 时，`User` 的 `router-view` 是不会渲染任何东西的，这是因为没有匹配到合适的子路由。如果你想要渲染点什么，可以提供一个  `空的子路由`：

```js
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // 当 /user/:id 匹配成功，
        // UserHome 会被渲染在 User 的 <router-view> 中
      { path: '', component: UserHome },

      // ...其他子路由
    ],
  },
]
```



## 1.4 编程式的导航

除了使用 `<router-link>` 创建 a 标签来定义导航链接，我们还可以借助 router 的实例方法，通过编写代码来实现。



### 1.4.1 导航到其他位置

**在 Vue 实例内部，你可以通过 `$router` 访问路由实例。因此可以调用 `this.$router.push`。**

要导航到不同的 URL，可以使用 `router.push` 方法。这个方法会向 history 栈添加一个新的记录，所以，当用户点击浏览器后退按钮时，则可以回到之前的 URL。

当你点击 `<router-link>` 时，这个方法会在内部调用，所以说，点击 `<router-link :to="...">` 等同于调用 `router.push(...)`。

| 声明式                    | 编程式             |
| ------------------------- | ------------------ |
| `<router-link :to="...">` | `router.push(...)` |

push 方法的参数可以是字符串路径，也可以是位置描述符对象。例如：

```js
// 字符串路径
router.push('/users/eduardo')

// 一个字符串路径的对象
router.push({ path: '/users/eduardo' })

// 具有 params 参数的命名路由
router.push({ name: 'user', params: { username: 'eduardo' } })

// 具有查询参数的路径对象，导航到 /register?plan=private
router.push({ path: '/register', query: { plan: 'private' } })

// 具有哈希值的路径对象，导航至 /about#team
router.push({ path: '/about', hash: '#team' })
```

**注意：如果提供了 `path`，`params` 会被忽略，上述例子中的 `query` 则不会忽略。取而代之的是下面例子的做法，你需要提供路由的 `name` 或手写完整的带有参数的 `path`：**

```js
const username = 'eduardo'

// 我们可以手动构建一个 url，但要自己将参数嵌入进去
router.push(`/user/${username}`) // -> /user/eduardo

// 与上面相同
router.push({ path: `/user/${username}` }) // -> /user/eduardo

// 使用 name 和 params 构造的路径对象
router.push({ name: 'user', params: { username } }) // -> /user/eduardo

// 这里的 params 将不会生效
router.push({ path: '/user', params: { username } }) // -> /user
```

因为属性 `to` 接收与 `router.push` 相同类型的对象。所以两者都适用上述同样的规则。



`router.push` 和其他所有导航方法都会返回一个 `Promise` 对象，这可以允许我们等待导航完成，并且知道它是成功还是失败。



### 1.4.2 替换当前位置

使用 `router.replace` 来替换当前位置。

跟 `router.push` 很像，唯一的不同就是，它不会向 history 添加新记录，而是跟它的方法名一样替换掉当前的 history 记录。

| 声明式                            | 编程式                |
| --------------------------------- | --------------------- |
| `<router-link :to="..." replace>` | `router.replace(...)` |

也可以直接添加属性 `replace: true` 到 `router.push` 中：

```js
router.push({ path: '/home', replace: true })
// 相当于
router.replace({ path: '/home' })
```



### 1.4.3 遍历历史记录

此方法采用一个整数作为参数，该参数指示在历史记录的堆栈中前进或后退多少步，类似于`window.history.go(n)`。

例子如下：

```js
// 向前移动 1 条记录，和 router.forward() 一样
router.go(1)

// 向后移动 1 条记录，和 router.back() 一样
router.go(-1)

// 向前移动 3 条记录
router.go(3)

// 如果没有那么多的记录，则会默认失败
router.go(-100)
router.go(100)
```



### 1.4.4 操作 History

注意到 `router.push`、 `router.replace` 和 `router.go` 跟 `window.history.pushState`、 `window.history.replaceState` 和 `window.history.go` 很像， 实际上它们确实是效仿 `window.history` API 的。

并且，Vue Router 的导航方法 (`push`、 `replace`、 `go`) 在各类路由模式 (`history`、 `hash` 和 `abstract`) 下表现一致。



## 1.5 命名路由

除了 `path`，你可以提供一个 `name` 来导航到任何路由，它有以下优点：

- 没有硬编码的网址
- 可以自动编码和解码 `params`
- 防止你在网址中输入错误的字
- 绕过多层路径，例如显示：

```js
const routes = [
  {
    path: '/user/:username',
    name: 'user',
    component: User
  }
]
```

要链接到该命名路由，可以直接将一个对象传递给 `router-link` 组件的 `to` 属性：

```html
<router-link :to="{ name: 'user', params: { username: 'erina' }}">
  User
</router-link>
```

通过编程式导航可同样实现：

```js
router.push({ name: 'user', params: { username: 'erina' } })
```

这两种情况，路由器都将导航到路径 `/user/erina`。



## 1.6 命名视图

有时候你想同时 (同级) 展示多个视图，而不是嵌套展示，例如创建一个布局，有 `sidebar` (侧导航) 和 `main` (主内容) 两个视图，这个时候命名视图就派上用场了。你可以在界面中拥有多个单独命名的视图，而不是只有一个单独的出口。如果 `router-view` 没有设置名字，那么默认为 `default`。

```html
<router-view class="view left-sidebar" name="LeftSidebar"></router-view>
<router-view class="view main-content"></router-view>
<router-view class="view right-sidebar" name="RightSidebar"></router-view>
```

一个视图是通过使用一个组件渲染的，因此对于同个路由，想要有多个视图就的话需要多个组件。以确保正确使用 `components` 配置 (带上 s)：

```js
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      components: {
        default: Home,
        // LeftSidebar: LeftSidebar 的简写
        LeftSidebar,
        // 它们匹配 <router-view> 上的 name 属性
        RightSidebar,
      },
    },
  ],
})
```



### 1.6.1 嵌套命名视图

我们也有可能使用命名视图来创建嵌套视图的复杂布局。这时你也需要命名用到的嵌套 `router-view` 组件。例如：

```html
<!-- UserSettings.vue -->
<div>
  <h1>User Settings</h1>
  <NavBar />
  <router-view />
  <router-view name="helper" />
</div>
```

然后，您可以使用此路由配置来实现上述布局：

```js
{
  path: '/settings',
  // 你也可以把命名的视图放到最顶部
  component: UserSettings,
  children: [{
    path: 'emails',
    component: UserEmailsSubscriptions
  }, {
    path: 'profile',
    components: {
      default: UserProfile,
      helper: UserProfilePreview
    }
  }]
}
```



## 1.7 重定向和别名

### 1.7.1 重定向

重定向也是通过 `routes` 配置来完成，下面例子是从 `/a` 重定向到 `/b`：

```js
const routes = [{ path: '/home', redirect: '/' }]
```

重定向的目标也可以是一个命名的路由：

```js
const routes = [{ path: '/home', redirect: { name: 'homepage' } }]
```

甚至是一个方法，动态返回重定向目标：

```js
const routes = [
  {
    // /search/screens -> /search?q=screens
    path: '/search/:searchText',
    redirect: to => {
      // 方法接收 目标路由 作为参数
      // return 重定向的 字符串路径/路径对象
      return { path: '/search', query: { q: to.params.searchText } }
    },
  },
  {
    path: '/search',
    // ...
  },
]
```

注意，导航守卫并没有应用在跳转路由上，而仅仅应用在其目标上。在上面例子中，为 `/search` 路由添加一个 `beforeEnter` 守卫并不会有任何效果。

编写 `redirect` 时，你可以省略 `component` 选项，因为它永远不会直接到达，因此没有要渲染的组件。唯一的例外是 `嵌套路由`：如果路由具有 `children` 和 `redirect` 属性，则它也应该具有 `component` 属性。



### 1.7.2 相对重定向

也可以重定向到相对位置：

```js
const routes = [
  {
    path: '/users/:id/posts',
    redirect: to => {
      // 方法接收 目标路由 作为参数
      // return 重定向的 字符串路径/路径对象
    },
  },
]
```



### 1.7.4 别名

**`/` 的别名是 `/home`，意味着，当用户访问 `/home` 时，URL 会保持为 `/home`，但是路由匹配则为 `/`，就像用户访问 `/` 一样。**

以上内容可以在路由配置中表示为：

```js
const routes = [{ path: '/', component: Homepage, alias: '/home' }]
```

别名使你可以自由地将 UI 结构映射到任意的 URL，而不受配置嵌套结构的限制。使别名以 `/` 开始，以使路径在嵌套路由中是绝对的。你甚至可以将两者结合起来，并提供多个别名组成一个数组：

```js
const routes = [
  {
    path: '/users',
    component: UsersLayout,
    children: [
      // 下面这三个 URL 将都会渲染 UserList 这个组件
      // - /users
      // - /users/list
      // - /people
      { path: '', component: UserList, alias: ['/people', 'list'] },
    ],
  },
]
```

如果你的路径包含参数，那么在绝对路径的别名中一定要包含它：

```js
const routes = [
  {
    path: '/users/:id',
    component: UsersByIdLayout,
    children: [
      // 下面这三个 URL 将都会渲染 UserList 这个组件
      // - /users/24
      // - /users/24/profile
      // - /24
      { path: 'profile', component: UserDetails, alias: ['/:id', ''] },
    ],
  },
]
```

**关于SEO的注意事项**：使用别名时，请确保定义的是规范的链接。



## 1.8 路由组件传参

在组件中使用 `$route` 会使之与其对应路由形成高度耦合，从而使组件只能在某些特定的 URL 上使用，限制了其灵活性。此时，可以使用 `props` 将组件和路由解耦。

将以下代码：

```js
const User = {
  template: '<div>User {{ $route.params.id }}</div>'
}
const routes = [{ path: '/user/:id', component: User }]
```

替换成：

```js
const User = {
  props: ['id'],
  template: '<div>User {{ id }}</div>'
}
const routes = [{ path: '/user/:id', component: User, props: true }]
```

这使你可以在任何地方使用组件，也使组件更易于重用和测试。



### 1.8.1 布尔模式

如果 `props` 被设置为 `true`，`route.params` 将会被设置为 `组件属性`。



### 1.8.2 命名视图

对于具有命名视图的路由，`props` 必须为每个命名视图都定义 props 选项：

```js
const routes = [
  {
    path: '/user/:id',
    components: { default: User, sidebar: Sidebar },
    props: { default: true, sidebar: false }
  }
]
```



### 1.8.3 对象模式

如果 `props` 是一个对象，它会被按 `原样` 设置为组件属性。当 `props` 是静态的时候有用。

```js
const routes = [
  {
    path: '/promotion/from-newsletter',
    component: Promotion,
    props: { newsletterPopup: false }
  }
]
```



### 1.8.4 函数模式

你可以创建一个函数返回 `props`。这样你便可以将参数转换成另一种类型，将 `静态值` 与 `基于路由的值` 结合等等。

```js
const routes = [
  {
    path: '/search',
    component: SearchUser,
    props: route => ({ query: route.query.q })
  }
]
```

URL `/search?q=vue` 会将 `{query: 'vue'}` 作为属性传递给 `SearchUser` 组件。

应尽可能的保持 `props` 函数为无状态的，因为它只会在路由发生变化时起作用。如果你需要状态来定义 `props`，则需使用包装组件，这样 Vue 才可以对状态变化做出反应。



## 1.9 不同的历史记录模式

创建路由器实例时的 `history` 选项使我们可以选择不同的历史记录模式。



### 1.9.1 Hash 模式

Hash 模式由 `createWebHashHistory()` 生成：

```js
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    //...
  ],
})
```

这将会在内部传递的真实的 URL 之前使用一个哈希符号 `#`，因为 URL 的这一部分不会被发送到服务端，因此它不需要在服务器级别上进行任何特殊处理。然而它会对 SEO 有一定的坏处，如果想要解决这个问题，就得使用 HTML5 的 history 模式。



### 1.9.2 HTML5 模式

HTML5 模式由 `createWebHistory()` 生成，并且推荐使用：

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    //...
  ],
})
```

当使用 history 模式时，URL 看起来会和正常的 URL 一样。

但是，这也会出现一个问题：因为我们的应用是个单页客户端应用，如果后台没有正确的配置，当用户在浏览器直接访问 `http://oursite.com/user/id` 就会返回 404，这就不好看了。

所以，你要在 `服务端` 增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 `index.html` 页面，这个页面就是你 app 依赖的页面。

这就需要进行相应的服务端配置。



# 2. 路由进阶

## 2.1 导航守卫

顾名思义，Vue Router 提供的导航守卫主要通过 `重定向` 或 `取消导航` 来保护导航。有很多方法可以将其挂载到到路由导航过程中：`全局的`，`单个路由独享的` 或者 `组件级别的`。



### 2.1.1 全局前置守卫

你可以通过 `router.beforeEach` 来注册全局前置守卫：

```js
const router = createRouter({ ... })

router.beforeEach((to, from) => {
  // ...
  // 显示的返回 false 来取消导航
  return false
})
```

当一个导航触发时，全局前置守卫会按照创建的顺序进行调用。守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于 **pending**。

每个守卫都接收两个参数：

- `to`：即将要进入的目标路由对象
- `from`：当前导航正要离开的路由

并且可以选择性的返回以下任何值：

- `false`：取消当前导航。如果浏览器的 URL 被更改（由用户手动或通过后退按钮更改），它将被重置为该 `from` 路由的 URL
- `一个路由地址`：通过传递一个路由地址来重定向到一个不同的地址，相当于调用 `router.push()`，也可以使用 `replace: true` 或 `name: 'home'`，这些都会从原来的 `from` 中创建新导航出去。



如果遇到意外情况，则会抛出一个 `Error`，这也会取消当前导航并且可以通过 `router.onError()` 来执行抛出错误时的回调函数。

如果什么也不输出，则返回 `undefined` 或 `true`，**导航得到验证**，紧接着下一个导航守卫将会被调用。

以上所有功能在使用 `async` 或 `Promise` 时也一样：

```js
router.beforeEach(async (to, from) => {
  // 函数 canUserAccess() 返回 true 或 false
  return await canUserAccess(to)
})
```



#### 可选的第三个参数 `next`

在早期的 Vue Router 版本中，也可以使用第三个参数 `next`。我们可以将第三个参数传给任何导航守卫，在这种情况下，任何通过验证的导航守卫我们都必须严格调用一次 `next`，`next` 可以调用多次，但是只能在所有的逻辑路径都不重叠的情况下，否则 `next` 钩子永远都不会被解析或报错。下面是一个在用户未能验证身份时重定向到 `/login` 的示例：

```js
// BAD
router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
  // 如果用户未能验证身份，则 next 会被调用两次
  next()
})
```

```js
// GOOD
router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
  else next()
})
```



### 2.1.2 全局解析守卫

你可以用 `router.beforeResolve` 注册一个全局守卫。这和 `router.beforeEach` 类似，因为它会在每次导航时触发，区别是：在导航被确认之前，**同时在所有组件内守卫和异步路由组件被解析之后**，解析守卫就被调用。

下面这个示例可确保用户为自定义了 `meta` 的 `requiresCamera` 属性的路由授予对 Camera 的访问权限：

```js
router.beforeResolve(async to => {
  if (to.meta.requiresCamera) {
    try {
      await askForCameraPermission()
    } catch (error) {
      if (error instanceof NotAllowedError) {
        // ... 处理错误并且取消导航
        return false
      } else {
        // 意料之外的错误，取消导航并且抛出错误到全局
        throw error
      }
    }
  }
})
```



### 2.1.3 全局后置钩子

你也可以注册 `全局后置钩子`，然而和守卫不同的是，这些钩子不会接受 `next` 函数也不会改变导航本身：

```js
router.afterEach((to, from) => {
  sendToAnalytics(to.fullPath)
})
```

全局后置钩子，对于分析，更改页面标题等功能很有用处。

全局后置钩子将 `导航失败` 作为第三个参数。

```js
router.afterEach((to, from, failure) => {
  if (!failure) sendToAnalytics(to.fullPath)
})
```



### 2.1.4 路由独享的守卫

你可以在路由的配置对象中直接定义 `beforeEnter` 守卫：

```js
const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: (to, from) => {
      // 取消导航
      return false
    },
  },
]
```

`beforeEnter` 守卫，只会当你在在进入该路由时触发，当路由的 params，query 或 hash 值改变时则不会触发，例如从 `/users/2` 到 `/users/3`，或者从 `/users/2#info` 到 `/users/2#projects`。它们只会在导航从一个不同的路由进入时才会触发。

你也可以给 `beforeEnter` 添加一个具有多个方法的数组。当为不同的守卫重用时会很有用。

```js
function removeQueryParams(to) {
  if (Object.keys(to.query).length)
    return { path: to.path, query: {}, hash: to.hash }
}

function removeHash(to) {
  if (to.hash) return { path: to.path, query: to.query, hash: '' }
}

const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: [removeQueryParams, removeHash],
  },
  {
    path: '/about',
    component: UserDetails,
    beforeEnter: [removeQueryParams],
  },
]
```

也可以使用全局前置守卫，和添加 `meta` 字段来实现同样的功能。



### 2.1.5 组件内的守卫

最后，你可以在路由组件内直接定义路由导航守卫。



#### 使用 options API

- `beforeRouteEnter`
- `beforeRouteUpdate`
- `beforeRouteLeave`

```js
const UserDetails = {
  template: `...`,
  beforeRouteEnter(to, from) {
    // 在呈现该组件的路由被确认之前调用
    // 没有访问 `this` 组件实例的权限，因为在守卫调用时组件实例还没有被创建
  },
  beforeRouteUpdate(to, from) {
    // 在呈现该组件的路由更改的时候被调用
    // 但是这个组件会在新路由中被重用
    // 例如，路由为 `/users/:id` 时，当我们从 `/users/1` 更改为 `/users/2` 时，组件实例会被重用，但这个导航守卫会被触发
    // 因为组件在此过程中被挂载，所以导航守卫可以访问 `this` 组件实例。
  },
  beforeRouteLeave(to, from) {
    // 在呈现该组件的路由即将离开时被调用
    // 与 `beforeRouteUpdate` 一样，它可以访问 `this` 组件实例
  },
}
```

在 `beforeRouteEnter` 中，不可以访问 this，但是你可以通过传递一个回调函数给 `next` 来访问组件实例，当导航被确认时，将调用该回调函数，并将组件实例作为回调函数的参数：

```js
beforeRouteEnter (to, from, next) {
  next(vm => {
    // 通过 `vm` 来访问组件实例
  })
}
```

但是注意，`beforeRouteEnter` 是这三个守卫中唯一支持传递回调函数给 `next` 的守卫，对于 `beforeRouteUpdate` 和 `beforeRouteLeave`，`this` 已经可用，所以就不需要再传递回调函数了：

```js
beforeRouteUpdate (to, from) {
  // 直接使用 `this`
  this.name = to.params.name
}
```

`beforeRouteLeave` 守卫通常是用来防止用户在还未保存修改前意外离开当前路由，可以通过返回一个 `false` 来取消当前导航：

```js
beforeRouteLeave (to, from) {
  const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
  if (!answer) return false
}
```



#### 使用 Composition API

如果正在使用 Composition API 和 setup 函数来编写组件，则通过使用 `onBeforeRouteUpdate` 和 `onBeforeRouteLeave` 来完成上述功能。



### 2.1.6 完整的导航解析流程

1. 导航被触发。
2. 在失活的组件里调用 `beforeRouteLeave` 守卫。
3. 调用全局的 `beforeEach` 守卫。
4. 在重用的组件里调用 `beforeRouteUpdate` 守卫。
5. 在路由配置里调用 `beforeEnter`。
6. 解析异步路由组件。
7. 在被激活的组件里调用 `beforeRouteEnter`。
8. 调用全局的 `beforeResolve` 守卫。
9. 导航被确认。
10. 调用全局的 `afterEach` 钩子。
11. 触发 DOM 更新。
12. 调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数，创建好的组件实例会作为回调函数的参数传入。



## 2.2 路由元信息

有时，你会想要将一些附加信息添加到路由中，比如 transition，谁能访问该路由等。这些可以通过 `meta` 的属性来实现，`meta` 可以接收一个对象。你可以定义如下 `meta` 属性：

```js
const routes = [
  {
    path: '/posts',
    component: PostsLayout,
    children: [
      {
        path: 'new',
        component: PostsNew,
        // 只有通过身份验证的用户才能创建 posts
        meta: { requiresAuth: true }
      },
      {
        path: ':id',
        component: PostsDetail
        // 每个人都能访问 post
        meta: { requiresAuth: false }
      }
    ]
  }
]
```

那么该如何访问 `meta` 字段呢？

首先，我们称呼 `routes` 配置中的每个路由对象为 **路由记录**。路由记录可以是嵌套的，因此，当一个路由匹配成功后，他可能匹配多个路由记录。

例如，根据上面的路由配置，URL `/posts/new`  将同时匹配父路由记录 `path: '/posts'` 和子路由记录 `path: 'new'`。

一个路由匹配到的所有路由记录会暴露为 `$route` 对象 (还有在导航守卫中的路由对象) 的 `$route.matched` 数组，我们需要遍历 `$route.matched` 来检查路由记录中的 `meta` 字段。Vue Router 也提供了一个 `$route.meta`，这是一个从父路由到子路由所有 `meta` 属性的非递归集合，这意味着你可以简单的写：

```js
router.beforeEach((to, from) => {
  // 可以替代必须要检查每个 route 的
  // to.matched.some(record => record.meta.requiresAuth)
  if (to.meta.requiresAuth && !auth.isLoggedIn()) {
    // 这个路由需要身份验证，要检查是否已经登录
    // 如果没有，则会跳转到 login 页面
    return {
      path: '/login',
      // 保存现有的地址，用于登录后再重新返回回来
      query: { redirect: to.fullPath },
    }
  }
})
```



#### TypeScript 支持

通过拓展 `RouteMeta` 接口可以键入 `meta` 字段：

```ts
declare module 'vue-router' {
  interface RouteMeta {
    // 可选的
    isAdmin?: boolean
    // 每个路由都必须要声明的
    requiresAuth: boolean
  }
}
```



## 2.3 数据获取

有时候，进入某个路由后，需要从服务器获取数据。例如，在渲染用户信息时，你需要从服务器获取用户的数据。我们可以通过两种方式来实现：

- **导航完成之后获取**：先完成导航，然后在接下来的组件生命周期钩子中获取数据。在数据获取期间显示“加载中”之类的指示。
- **导航完成之前获取**：导航完成前，在路由进入的守卫中获取数据，在数据获取成功后执行导航。

从技术角度讲，两种方式都不错 —— 就看你想要的用户体验是哪种。



### 2.3.1 导航完成后获取数据

当你使用这种方式时，我们会马上导航和渲染组件，然后在组件的 `created` 钩子中获取数据。这让我们有机会在数据获取期间展示一个 loading 状态，还可以在不同视图间展示不同的 loading 状态。

假设我们有一个 `Post` 组件，需要基于 `$route.params.id` 获取文章数据：

```html
<template>
  <div class="post">
    <div v-if="loading" class="loading">Loading...</div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="post" class="content">
      <h2>{{ post.title }}</h2>
      <p>{{ post.body }}</p>
    </div>
  </div>
</template>
```

```js
export default {
  data() {
    return {
      loading: false,
      post: null,
      error: null,
    }
  },
  created() {
    // 侦听 route 的 params 来再次获取数据
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData()
      },
      // 组件创建完后获取数据，
      // 此时 data 已经被 observed 了
      { immediate: true }
    )
  },
  methods: {
    fetchData() {
      this.error = this.post = null
      this.loading = true
      // 基于 `$route.params.id` 获取数据
      getPost(this.$route.params.id, (err, post) => {
        this.loading = false
        if (err) {
          this.error = err.toString()
        } else {
          this.post = post
        }
      })
    },
  },
}
```



### 2.3.2 导航完成前获取数据

通过这种方式，我们在导航转入新的路由前获取数据。我们可以在接下来的组件的 `beforeRouteEnter` 守卫中获取数据，当数据获取成功后只调用 `next` 方法。

```js
export default {
  data() {
    return {
      post: null,
      error: null,
    }
  },
  beforeRouteEnter(to, from, next) {
    getPost(to.params.id, (err, post) => {
      next(vm => vm.setData(err, post))
    })
  },
  // 当组件已经渲染，且路由发生变化时
  async beforeRouteUpdate(to, from) {
    this.post = null
    try {
      this.post = await getPost(to.params.id)
    } catch (error) {
      this.error = error.toString()
    }
  },
}
```

在为后面的视图获取数据时，用户会停留在当前的界面，因此建议在数据获取期间，显示一些进度条或者别的指示。如果数据获取失败，同样有必要展示一些全局的错误提醒。



## 2.4 Vue Router 与 Composition API

随着 setup 和 Composition API 的引入，开辟了新的可能。但为了能充分利用 Vue Router 的潜力，我们将需要使用一些新的函数来取代对 `this` 的访问和组件内的导航守卫。

### 2.4.1 在 setup 内访问 Router 和 当前 Route

因为在 setup 中我们无法访问 `this`，我们再也不能直接的访问 `this.$router` 和 `this.$route`，我们使用 `useRouter` 函数来替代：

```js
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    function pushWithQuery(query) {
      router.push({
        name: 'search',
        query: {
          ...route.query,
        },
      })
    }
  },
}
```

这里的 route 对象是 reactive 对象，所以其中的任何属性都可以被侦听，同时我们应该避免侦听整个 route 对象。

```js
export default {
  setup() {
    const route = useRoute()
    const userData = ref()

    // 当 route.params 改变时获取新的数据
    watch(
      () => route.params,
      async newParams => {
        userData.value = await fetchUser(newParams.id)
      }
    )
  },
}
```

注意，我们仍然可以在模版中访问 `$router` 和 `$route`，所以这里我们不需要在 setup 中返回 `router` 或 `route`。



### 2.4.2 导航守卫

虽然你仍然可以在 setup 函数中使用组件内导航守卫，但 Vue Router 会将 `update` 和 `leave` 的导航守卫作为 Composition API 暴露出来：

```js
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

export default {
  setup() {
    // 除了不能访问 `this`，其他和 beforeRouteLeave 一样
    onBeforeRouteLeave((to, from) => {
      const answer = window.confirm(
        'Do you really want to leave? you have unsaved changes!'
      )
      // 取消导航
      if (!answer) return false
    })

    const userData = ref()

    // 除了不能访问 `this`，其他和 beforeRouteUpdate 一样
    onBeforeRouteUpdate(async (to, from) => {
      // 仅在 id 发生变化时才 fetchUser
      if (to.params.id !== from.params.id) {
        userData.value = await fetchUser(to.params.id)
      }
    })
  },
}
```

使用 Composition API 的导航守卫也可以在任何被 `<router-view>` 渲染的组件中使用，它们不需要像组件内导航守卫一样要直接用在 route 的组件上。



## 2.5 Transitions

为了在路由组件和动画效果的导航中使用 transitions，我们需要使用到 `v-slot`。

```html
<router-view v-slot="{ Component }">
  <transition name="fade">
    <component :is="Component" />
  </transition>
</router-view>
```

transition 中的所有 API 在这里也同样适用。

### 2.5.1 单个路由的 Transition

上面的用法会给所有路由设置一样的过渡效果，如果你想让 `每个路由组件有各自的过渡效果`，可以在各路由配置中使用 `<meta>` 属性并将 transition 添加进去。

```js
const routes = [
  {
    path: '/custom-transition',
    component: PanelLeft,
    meta: { transition: 'slide-left' },
  },
  {
    path: '/other-transition',
    component: PanelRight,
    meta: { transition: 'slide-right' },
  },
]
```

```html
<router-view v-slot="{ Component, route }">
  <!-- 使用任何自定义的过渡效果和回调 -->
  <transition :name="route.meta.transition || 'fade'">
    <component :is="Component" />
  </transition>
</router-view>
```

### 2.5.2 基于路由的动态过渡

还可以基于当前路由与目标路由的变化关系，动态设置过渡效果：

```html
<!-- 使用一个动态的 transition 名字 -->
<router-view v-slot="{ Component, route }">
  <transition :name="route.meta.transition">
    <component :is="Component" />
  </transition>
</router-view>
```

我们可以添加一个 `全局后置钩子` 来动态的向路由的 meta 中添加信息：

```js
router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})
```



## 2.6 滚动行为

在使用前端路由时，我们希望在切换到新路由时，页面能够滚动到顶部，或者保持原先的滚动位置，就像重新加载页面一样。Vue Router 使你可以实现这些目标，甚至可以完全自定义路由导航中的滚动行为。

> **注意: 这个功能只在支持 `history.pushState` 的浏览器中可用。**



当创建一个 Router 实例，你可以提供一个 `scrollBehavior` 方法：

```js
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...],
  scrollBehavior (to, from, savedPosition) {
    // 返回一个期望中的位置
  }
})
```

`scrollBehavior` 方法接收 `to` 和 `from` 路由对象。第三个参数 `savedPosition` 当且仅当 `popstate` 导航 (通过浏览器的 前进/后退 按钮触发) 时才可用。



`scrollBehavior` 方法可以返回一个 `ScrollToOptions` 位置对象（自定义返回的位置）：

```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    // 总是返回顶部
    return { top: 0 }
  },
})
```

你还可以通过传递一个 `CSS 选择器` 或者一个 `DOM 节点` 。在这种情况下，`top` 和 `left`将被视为相对该元素的偏移。如果返回错误值或空对象，则不会滚动。

```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    // 总是返回 #main 元素上 10px 的位置
    return {
      // 也可以写成
      // el: document.getElementById('main'),
      el: '#main',
      top: -10,
    }
  },
})
```



若返回 `savedPosition`，则在按下 后退/前进 按钮时，就会像浏览器的原生表现那样：

```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})
```



### 2.6.1 延迟滚动

有时我们需要稍等片刻才进行页面的滚动。例如，在处理过渡时，我们要等待过渡完成后再滚动。为此，你可以返回一个 Promise，该 Promise 返回所需的位置描述符。下面的示例表示我们在滚动之前等待 500 毫秒：

```js
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ left: 0, top: 0 })
      }, 500)
    })
  },
})
```



## 2.7 路由懒加载

当打包构建应用时，JavaScript 包会变得非常大，影响页面加载。如果我们能把不同路由对应的组件分割成不同的代码块，然后 `当路由被访问的时候才加载对应组件`，这样就更加高效了。

Vue Router 开箱即用的支持动态导入，这意味着你可以使用动态导入来代替静态导入。

```js
// 使用下列代码代替 import UserDetails from './views/UserDetails'
const UserDetails = () => import('./views/UserDetails')

const router = createRouter({
  // ...
  routes: [{ path: '/users/:id', component: UserDetails }],
})
```



在 component（和 components）中，接收一个返回 Promise 组件的函数，并且 Vue Router 将只会在第一次进入该页面时获取它，然后将其缓存下来使用，这意味着你也可以有更多复杂的函数，只要它们返回的是一个 Promise：

```js
const UserDetails = () =>
  Promise.resolve({
    /* 组件定义 */
  })
```

通常，对所有路由**始终使用动态导入**是一个更好的主意。



> 注意，千万不能使用异步组件作为路由，异步组件仍然可以在路由组件中使用，但是路由组件本身只能通过动态导入。

当使用 webpack 打包工具时，这会自动的使之受益于 `code splitting`。

当使用 Babel 时，你需要添加 `动态导入语法插件` 来使 Babel 能正确的解析语法。



### 2.7.1 将组件按组分块

有时我们可能想将嵌套在同一路由下的所有组件分组到同一异步块中。为了实现这一点，我们需要通过使用特殊注释语法提供块名称来使用 `命名块`（webpack 版本需要 > 2.4）：

有时候我们想把某个路由下的所有组件都打包在同个异步块 (chunk) 中。只需要使用 `命名 chunk`，一个特殊的注释语法来提供 chunk name (需要 Webpack > 2.4)。

```js
const UserDetails = () =>
  import(/* webpackChunkName: "group-user" */ './UserDetails.vue')
const UserDashboard = () =>
  import(/* webpackChunkName: "group-user" */ './UserDashboard.vue')
const UserProfileEdit = () =>
  import(/* webpackChunkName: "group-user" */ './UserProfileEdit.vue')
```

Webpack 会将任何一个异步模块与相同的块名称组合到相同的异步块中。



## 2.8 导航故障

当使用 `router-link` 组件时，Vue Router 会自动调用 `router.push` 来触发一次导航。 虽然大多数链接的预期行为是将用户导航到一个新页面，但也有少数情况下用户将留在同一页面上：

- 用户已经位于他们正在尝试导航到的页面
- 一个导航守卫通过调用 `next(false)` 中断了这次导航
- 新的导航守卫即将触发，但上一个导航守卫还未完成
- 一个导航守卫通过返回一个新的位置（比如 `return '/login'`）重定向到了其他地方。
- 一个导航守卫抛出了一个错误，或者调用了 `next(new Error())`

如果我们想在导航完成后做某些事情，那么我们需要等到 `router.push` 调用后才做某事。想象一下我们有一个移动菜单，允许我们去不同的页面，并且我们只想在我们导航到新的页面时隐藏这个菜单。我们会想做下面的一些事情：

```js
router.push('/my-profile')
this.isMenuOpen = false
```

但是这样只会马上就关闭菜单，因为导航是异步的，我们需要 `await` 一个 `router.push` 返回的 Promise：

```js
await router.push('/my-profile')
this.isMenuOpen = false
```

现在，一旦导航完成，这个菜单就将关闭，但如果导航被阻止了，菜单也会关闭。因此我们需要一种方法来检测是否真正的改变了页面。



### 2.8.1 检测导航故障

如果导航被阻止，导致用户停留在同一页面中，则 `router.push` 返回的 Promise 的 resolve 值是一个导航失败的内容。否则，它将是一个伪造的值（通常为 undefined）。这使我们可以区分是否成功导航到了某处。

```js
const navigationResult = await router.push('/my-profile')

if (navigationResult) {
  // 导航被阻止
} else {
  // 导航成功 (包括重定向的情况)
  this.isMenuOpen = false
}
```

导航失败是具有一些额外属性的 `Error` 实例，这些实例使我们有足够的信息来了解阻止了什么导航以及为什么要导航。若要检查导航结果的性质，则要使用以下 `isNavigationFailure` 功能：

```js
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

// trying to leave the editing page of an article without saving
const failure = await router.push('/articles/2')

if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  // show a small notification to the user
  showToast('You have unsaved changes, discard and leave anyway?')
}
```

> 如果你忽略第二个参数，只有第一个参数：`isNavigationFailure(failure)`，那么就只会检查这个错误是不是一个*导航故障*。

#### `NavigationFailureType`

就像一开始说的，导致导航异常终止的情况有很多，可以使用`NavigationFailureType` 可以帮助开发者来区分不同类型的*导航故障*。有以下不同的类型：

- `aborted`: 在导航守卫中调用了 `next(false)` 中断了本次导航。
- `cancelled`: 在当前导航还没有完成之前又有了一个新的导航。比如，在等待导航守卫的过程中又调用了 `router.push`。
- `duplicated`: 导航被阻止，因为我们已经在目标位置了。



### 2.8.2 导航故障的属性

所有的导航故障都会有 `to` 和 `from` 属性，用来描述这次失败的导航的当前位置和目标位置。

```js
// 正在尝试访问admin页面
router.push('/admin').push(failure => {
  if (isNavigationFailure(failure, NavigationFailureType.redirected)) {
    failure.to.path // '/admin'
    failure.from.path // '/'
  }
})
```

在所有情况下，`to` 和 `from` 都是规范化的路由位置。

### 2.8.3 检测重定向

当在路由守卫中返回一个新的位置时，我们将触发一个新的导航，该导航会覆盖正在进行的导航，与其他异常返回值不同的是，重定向不会阻止导航，它会创建一个新的导航。因此，可以通过读取 `redirectedFrom` 中的属性来进行不同的检查：

```js
await router.push('/my-profile')
if (router.currentRoute.value.redirectedFrom) {
  // redirectedFrom 是解析的路由位置，就像导航守卫中的 to 和 from
}
```



# 3. 从 Vue2 迁移的部分

## 3.1 `createRouter` 成为新路由

Vue Router 将不再是一个类，而是一系列函数。我们不再使用 `new Router()`，而使用 `createRouter` 替代：

```js
// 之前是
// import Router from 'vue-router'
import { createRouter } from 'vue-router'

const router = createRouter({
  // ...
})
```



## 3.2 新的 `history` 选项代替了 `mode` 选项

`mode: history` 选项已经被替换成了更灵活的 `history`，然后使用适当的函数与之前的进行替换：

- `"history"`： `createWebHistory()`
- `"hash"`： `createWebHashHistory()`
- `"abstract"`： `createMemoryHistory()`

```js
import { createRouter, createWebHistory } from 'vue-router'
// 同样的，也可以引入 createWebHashHistory 和 createMemoryHistory

createRouter({
  history: createWebHistory(),
  routes: [],
})
```



## 3.3 移动了 `base` 选项

移动了基路径 `base` 选项，将其移动到了 `createWebHistory/createWebHashHistory/createMemoryHistory` 的第一个参数：

```js
import { createRouter, createWebHistory } from 'vue-router'
createRouter({
  history: createWebHistory('/base-directory/'),
  routes: [],
})
```



## 3.4 删除了 `*` 路由

之前用 `*` 和 `/*` 捕获所有路由，现在则必须使用带有自定义正则表达式的参数：

```js
const routes = [
  // pathMatch 是参数的名称，例如跳转到 /not/found 页面
  // { params: { pathMatch: ['not', 'found'] }}
  // 这要归功于最后一个 `*`，它意味着重复的参数，如果你打算使用它的名称直接导航到未找到的路由，那么这是必要的
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  // 如果你去掉最后面的 `*`，那么参数中的 `/` 字符在resolve的时候会被算入进去
  { path: '/:pathMatch(.*)', name: 'bad-not-found', component: NotFound },
]

// 使用命名路由时
// bad
router.resolve({
  name: 'bad-not-found',
  params: { pathMatch: 'not/found' },
}).href // '/not%2Ffound'

// good
router.resolve({
  name: 'not-found',
  params: { pathMatch: ['not', 'found'] },
}).href // '/not/found'
```

> 如果你不需要使用 name 来直接进入到 not found 路由的话，你就不需要为重复的参数使用 `*`。如果你调用 `router.push('not/found/url')`，它将会得到正确的 `pathMatch` 参数。



## 3.5 将 `onReady` 替换成 `isReady`

`router.onReady()` 函数被替换成 `router.isReady()`，这个函数无参数，返回一个 Promise：

```js
// 替换前
router.onReady(onSuccess, onError)

// 替换后
router.isReady().then(onSuccess).catch(onError)

// 或者使用await
try {
  await router.isReady()
  // onSuccess
} catch (err) {
  // onError
}
```



## 3.6 `scrollBehavior` 的改变

`scrollBehavior` 返回的对象现在和 `ScrollToOptions` 类似：`x` 被重命名为 `left`，`y` 被重命名为 `top`。

> 更改原因：使返回对象与 `ScrollToOptions` 类似，是为了使之更偏向于原生的 JS API，并且将来有可能启用新的选项。



## 3.7 `<router-view>`，`<keep-alive>` 和 `<transition>`

现在必须在 `RouterView` 的内部通过 `v-slot` API 来使用 `transition` 和 `keep-alive`：

```html
<router-view v-slot="{ Component }">
  <transition>
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </transition>
</router-view>
```



## 3.8 删除 `<router-link>` 中的 `append` 属性

Vue2 中，设置 `append` 属性后，则在当前（相对）路径前添加基路径。例如，我们从 `/a` 导航到一个相对路径 `b`，如果没有配置 `append`，则路径为 `/b`，如果配了，则为 `/a/b`。

Vue3 中 `append` 属性从 `<router-link>` 中删除，不过你可以手动将现有的 `path` 值添加进去：

```html
// 替换前
<router-link to="child-route" append>to relative child</router-link>

// 替换后
<router-link :to="append($route.path, 'child-route')">
  to relative child
</router-link>
```

但为此你必须在你的 App 实例上定义一个全局的 `append` 函数：

```js
app.config.globalProperties.append = (path, pathToAppend) =>
  path + (path.endsWith('/') ? '' : '/') + pathToAppend
```

> 更改原因：`append` 不经常使用



## 3.9 删除 `<router-link>` 中的 `event` 和 `tag` 属性

Vue2 中，我们有时候想要将 `<router-link>` 渲染成某种标签，例如 `<li>`。 于是我们使用 tag prop 类指定何种标签，同样它还是会监听点击，触发导航。

Vue3 中，`event` 和 `tag` 属性都在 `<router-link>` 中被移除了。你可以使用 `v-slot` API 来完全自定义 `<router-link>`：

```html
// 替换前
<router-link to="/about" tag="span" event="dblclick">About Us</router-link>

// 替换后
<router-link to="/about" custom v-slot="{ navigate }">
  <span @click="navigate" @keypress.enter="navigate" role="link">About Us</span>
</router-link>
```



## 3.10 删除 `<router-link>` 中的 `exact` 属性



## 3.11 mixins 中的导航守卫将被忽略

在 mixins 中将不再支持使用导航守卫



## 3.12 删除 `router.match` 并将其更改到 `router.resolve`

`router.match` 和 `router.resolve` 属性都被合并到 `router.resolve` 中



## 3.13 删除 `router.getMatchedComponents()`

`router.getMatchedComponents()` 方法现在已被删除，因为可以从 `router.currentRoute.value.matched` 中得到匹配到的组件

```js
router.currentRoute.value.matched.flatMap(record =>
  Object.values(record.components)
)
```

> 更改原因：此方法仅在 SSR 期间使用，并且功能可由用户自己完成即可



## 3.14 现在的所有导航都是异步的

现在所有的导航（包括第一个导航），都是异步的。这意味着，如果你使用一个 `transition`，你可能需要在挂载到 app 前等待这个导航准备就绪：

```js
app.use(router)
// 在 Server 端，你需要手动的 push 最初始的位置
router.isReady().then(() => app.mount('#app'))
```

否则，将会进行初始转换，就像你给 `transition` 提供了 `appear` 属性一样，因为 router 会显示其初始位置（什么都没有），然后才会显示第一个位置。



## 3.15 将内容传递到路由组件的 `<slot>`

在将模版 `<slot>` 嵌套在 `<router-view>` 组件下方之前，可以直接传递要由路由组件渲染的模版：

```html
<router-view>
  <p>In Vue Router 3, I render inside the route component</p>
</router-view>
```

由于 Vue3 给 `<router-view>` 引入了 `v-slot` API，因此你必须使用 `v-slot` API 将这个模版传递给 `<component>`：

```html
<router-view v-slot="{ Component }">
  <component :is="Component">
    <p>In Vue Router 3, I render inside the route component</p>
  </component>
</router-view>
```



## 3.16 `history.state` 的用法

Vue Router 在 `history.state` 中保存了信息。如果你有任何需要手动调用 `history.pushState()` 的代码，你应该避免使用它，或者使用 `router.push()` 和 `history.replaceState()` 来代替：

```js
// 替换前
history.pushState(myState, '', url)

// 替换后
await router.push(url)
history.replaceState({ ...history.state, ...myState }, '')
```

同样的，如果在调用 `history.replaceState()` 时未保留当前状态，则需要传递当前的 `history.state`：

```js
// 替换前
history.replaceState({}, '', url)

// 替换后
history.replaceState(history.state, '', url)
```

> 更改原因：我们使用 history state 来保存导航的信息，例如 scroll 滚动的位置、前一个导航的位置等等。



## 3.17 `routes` 在 `options` 中是必需的

`routes` 属性现在是一个必需的 `options`：

```js
createRouter({ routes: [] })
```

> 更改原因：router 是通过 routes 来创建的，你也可以后续再将其添加进去。在大多数情况下，你至少需要一个 route，并且通常每个应用程序中都需要编写一次。



## 3.18 不存在的命名路由

push 或 resolve 一个不存在的命名路由会抛出一个错误：

```js
// 不存在的命名路由
router.push({ name: 'homee' }) // throws
router.resolve({ name: 'homee' }) // throws
```

> 更改原因：以前，这种情况下，路由将导航至 `/` 但不显示任何内容（而不是显示主页）。这样看来，抛出错误的做法会更有意义一些，因为我们无法生成有效的 URL 进行导航。



## 3.19 在命名路由中缺少必需的参数

push 或 resolve 一个命名路由，但未填写必要参数时，将会抛出一个错误：

```js
// 给定以下 route
const routes = [{ path: '/users/:id', name: 'user', component: UserDetails }]

// 因为缺少 id 这个 params，将会报错
router.push({ name: 'user' })
router.resolve({ name: 'user' })
```

> 更改原因：与 3.18 类似



## 3.20 具有空 `path` 的子命名路由不再添加斜线 `/`

给定任意一个嵌套的命名路由，并带有一个空的 `path`：

```js
const routes = [
  {
    path: '/dashboard',
    name: 'dashboard-parent',
    component: DashboardParent
    children: [
      { path: '', name: 'dashboard', component: DashboardDefault },
      { path: 'settings', name: 'dashboard-settings', component: DashboardSettings },
    ],
  },
]
```

现在，导航解析到命名的路由 `dashboard` 时将产生一个**不带斜杠**的URL ：

```js
router.resolve({ name: 'dashboard' }).href // '/dashboard'
```

但是这对子路由 `redirect` 的记录有副作用：

```js
const routes = [
  {
    path: '/parent',
    component: Parent,
    children: [
      // 这个将会导航到 `/home` 而不是 `/parent/home`
      { path: '', redirect: 'home' },
      { path: 'home', component: Home },
    ],
  },
]
```

注意，原本的逻辑在 `path` 是 `/parent/` 时才会生效，因为是在 `/parent/` 的相对路径下增加 `home` ，所以会被导航到 `/parent/home`。但是在现在的副作用下是基于 `/parent` 增加 `home`，会直接导航到 `/home`。

> 更改原因：是为了使尾部斜杠保持一致，默认情况下，所有路由都允许尾部斜杠。这可以通过使用 strict 选项或者手动在路由添加（或不添加）斜杠来禁用。



## 3.21 TypeScript 中的变化

部分命名的变化：

| `vue-router@3` | `vue-router@4`          |
| -------------- | ----------------------- |
| RouteConfig    | RouteRecordRaw          |
| Location       | RouteLocation           |
| Route          | RouteLocationNormalized |

