# 🚀 React Router 7 全面指南：从零搭建 SPA 路由系统

> 本文基于一个完整的 React Router Demo 项目，带你从零理解前端路由的核心概念，涵盖**基本路由配置、嵌套路由、动态路由、路由懒加载、路由守卫（鉴权路由）、编程式导航**等所有关键知识点。

---

## 📖 目录

- [一、为什么需要前端路由？](#一为什么需要前端路由)
- [二、项目初始化与 Router 选型](#二项目初始化与-router-选型)
- [三、路由基本配置](#三路由基本配置)
- [四、路由懒加载（性能优化）](#四路由懒加载性能优化)
- [五、Link 组件：SPA 专属导航](#五link-组件spa-专属导航)
- [六、动态路由与 useParams](#六动态路由与-useparams)
- [七、嵌套路由与 Outlet](#七嵌套路由与-outlet)
- [八、404 兜底路由与 useNavigate](#八404-兜底路由与-usenavigate)
- [九、重定向：Navigate 组件](#九重定向navigate-组件)
- [十、鉴权路由（路由守卫）](#十鉴权路由路由守卫)
- [十一、编程式导航与 useLocation](#十一编程式导航与-uselocation)
- [十二、完整项目结构总览](#十二完整项目结构总览)

---

## 一、为什么需要前端路由？

### 🕰️ 传统模式 vs SPA 模式

在传统的 Web 开发中，每次用户点击链接，浏览器都会向服务器发送请求，服务器返回一个全新的 HTML 页面。这意味着：

- ❌ 每次跳转都会**白屏闪烁**
- ❌ 服务器压力大，每个页面都要单独渲染
- ❌ 用户体验差，页面切换不流畅

而现代 **SPA（Single Page Application，单页应用）** 的做法是：

- ✅ 浏览器只加载**一个 HTML 页面**
- ✅ 通过 JavaScript 动态切换页面内容
- ✅ URL 变化时**不刷新页面**，只替换局部组件
- ✅ 用户体验丝滑，像原生 App 一样

**前端路由**就是实现 SPA 的核心机制 —— 它监听 URL 的变化，然后渲染对应的组件，而不是向服务器请求新页面。

---

## 二、项目初始化与 Router 选型

### 📦 安装依赖

```bash
pnpm add react-router-dom
```

项目使用的是 **React 19 + React Router DOM 7**：

```json
{
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.18.3"
  }
}
```

### 🔀 两种 Router 选型

React Router 提供了两种路由模式：

| 模式 | URL 格式 | 原理 | 适用场景 |
|------|----------|------|----------|
| **HashRouter** | `http://localhost/#/pay` | 监听 `hashchange` 事件 | 兼容旧浏览器、静态部署 |
| **BrowserRouter** | `http://localhost/pay` | 使用 HTML5 History API | 现代项目首选 ✅ |

**本项目选择的是 `BrowserRouter`**：

```jsx
// src/App.jsx
import {
  BrowserRouter as Router,  // ✅ HTML5 History 模式
  // HashRouter as Router,   // 也可以切换为 Hash 模式
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
```

> 💡 **为什么推荐 BrowserRouter？**
> - URL 更干净美观，没有 `#/` 丑陋前缀
> - 与后端路由风格一致（RESTful）
> - 支持 SSR（服务端渲染）

---

## 三、路由基本配置

### 🏗️ 核心三件套：Router + Routes + Route

路由配置的结构非常清晰：

```
Router          ← 最外层，接管所有路由
 └── Routes     ← 路由配置数组（同一时刻只渲染一个匹配的 Route）
      └── Route  ← 路由配置项（path + element）
```

来看最核心的 `App.jsx`：

```jsx
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

const App = () => {
  return (
    <Router>
      <Navigation />
      <div id='container'>
        <Routes>
          {/* path: URL 路径  element: 对应渲染的组件 */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
};
```

### 📝 关键概念解析

- **`<Router>`**：最外层容器，接管整个应用的路由系统
- **`<Routes>`**：路由匹配容器，**同一时刻只会渲染一个**匹配的 `<Route>`
- **`<Route path="/" element={<Home />} />`**：当 URL 为 `/` 时，渲染 `<Home />` 组件

每个页面组件就是一个普通的 React 组件：

```jsx
// src/pages/Home/index.jsx
function Home() {
  return (
    <>
      Home
    </>
  );
}

export default Home;
```

```jsx
// src/pages/About/index.jsx
function About() {
  return (
    <>
      About
    </>
  );
}

export default About;
```

> 🎯 **核心思想**：URL 与组件是一一映射关系。URL 改变 → 匹配新的 Route → 渲染新的组件。

---

## 四、路由懒加载（性能优化）

### ⚡ 为什么需要懒加载？

在一个真实的 SPA 应用中，可能有几十个页面。如果一开始就加载所有页面的代码：

- ❌ 首屏加载时间过长
- ❌ 用户可能根本不会访问某些页面
- ❌ 浪费带宽和内存

**路由懒加载**的思路是：**只加载当前页面需要的代码**，其他页面的代码在用户访问时才加载。

### 🔧 实现方式：`lazy()` + `<Suspense>`

```jsx
// src/App.jsx
import { lazy, Suspense } from 'react';

// ❌ 传统方式：一开始就加载所有页面
// import Home from './pages/Home';
// import About from './pages/About';

// ✅ 懒加载方式：变成 import 函数，访问时才加载
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/Products/Detail'));
const NewProduct = lazy(() => import('./pages/Products/New'));
const Login = lazy(() => import('./pages/Login'));
const Pay = lazy(() => import('./pages/Pay'));
const ProtectRoute = lazy(() => import('./ProtectRoute'));

const App = () => {
  return (
    <Router>
      {/* Suspense 在懒加载组件未加载完成时显示 fallback */}
      <Suspense fallback={<div>Loading...</div>}>
        <Navigation />
        <div id='container'>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* ...其他路由 */}
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
};
```

### 🧩 工作原理

```
用户访问 /about
     ↓
React 发现 <About /> 还没加载
     ↓
触发 lazy(() => import('./pages/About'))
     ↓
显示 <Suspense fallback={<div>Loading...</div>}>
     ↓
JS 文件下载完成，About 组件渲染
```

> ⚠️ **注意**：`<Suspense>` 是必须的！因为 `lazy()` 返回的组件在加载完成前是 `undefined`，`<Suspense>` 提供了一个 loading 状态的兜底 UI。

---

## 五、Link 组件：SPA 专属导航

### 🚫 为什么不能用 `<a>` 标签？

在 SPA 中，如果用传统的 `<a>` 标签：

```html
<!-- ❌ 这会导致页面刷新，破坏 SPA 体验 -->
<a href="/about">About</a>
```

点击后浏览器会**重新请求页面**，整个 React 应用会重新加载，状态全部丢失。

### ✅ 使用 `<Link>` 组件

React Router 提供了 `<Link>` 组件，它会**阻止浏览器默认跳转行为**，只更新 URL 并渲染对应的组件：

```jsx
// src/components/Navigation.jsx
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/user/123">小家</Link></li>
        <li><Link to="/products/123">产品详情</Link></li>
        <li><Link to="/products/new">产品新增</Link></li>
        <li><Link to="/pay">支付</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
```

### 🆚 `<Link>` vs `<NavLink>`

| 特性 | `<Link>` | `<NavLink>` |
|------|----------|-------------|
| 基础跳转 | ✅ | ✅ |
| 自动高亮当前路由 | ❌ | ✅（添加 `active` class） |
| 适用场景 | 普通导航 | 导航栏菜单 |

---

## 六、动态路由与 useParams

### 🎯 什么是动态路由？

很多场景下，URL 中会包含**动态参数**，比如：

- `/user/123` —— 用户 ID 是动态的
- `/products/456` —— 产品 ID 是动态的
- `/posts/2024/my-article` —— 文章 slug 是动态的

在 Route 配置中，用 `:参数名` 来声明动态参数：

```jsx
<Route path="/user/:id" element={<UserProfile />} />
```

### 📥 使用 `useParams()` 获取参数

```jsx
// src/pages/UserProfile/index.jsx
import { useParams } from 'react-router-dom';

function UserProfile() {
  // useParams() 返回一个对象，包含所有动态参数
  let { id } = useParams();
  console.log(id); // 例如访问 /user/123，这里输出 "123"

  return (
    <>
      <h2>UserProfile: {id}</h2>
    </>
  );
}

export default UserProfile;
```

当用户访问 `/user/123` 时：
- `useParams()` 返回 `{ id: "123" }`
- 组件渲染 `<h2>UserProfile: 123</h2>`

当用户访问 `/user/456` 时：
- `useParams()` 返回 `{ id: "456" }`
- 组件渲染 `<h2>UserProfile: 456</h2>`

> 💡 **Hook 思想**：`useParams` 是一个 React Hook，"召之即来"——在组件内部随时可以调用，获取当前路由的参数信息。

---

## 七、嵌套路由与 Outlet

### 📐 什么是嵌套路由？

在实际项目中，页面往往有**公共布局**。比如一个电商网站的产品页面：

```
/products              → 产品列表
/products/123          → 产品详情
/products/new          → 新增产品
```

这三个页面都有**相同的头部**（"产品列表"标题），只是**内容区域不同**。这就是嵌套路由的典型场景。

### 🔧 路由配置

```jsx
// src/App.jsx 中的路由配置
<Route path='/products' element={<Products />}>
  {/* 二级路由 */}
  <Route path=':productId' element={<ProductDetail />} />
  <Route path='new' element={<NewProduct />} />
</Route>
```

注意：
- 父级 `<Route path='/products'>` 定义了**布局组件** `<Products />`
- 子级 `<Route>` 定义了**内容区域**的切换

### 🚪 Outlet：二级路由出口

父级组件需要一个"出口"来渲染匹配到的子路由组件，这就是 `<Outlet />`：

```jsx
// src/pages/Products/index.jsx
import { Outlet } from 'react-router-dom';

function Products() {
  return (
    <>
      <h1>产品列表</h1>
      {/* Outlet 就是子路由组件的渲染位置 */}
      <Outlet />
    </>
  );
}

export default Products;
```

### 🧩 渲染流程

```
访问 /products/123 时：

  Products 组件渲染
    ├── <h1>产品列表</h1>      ← 父级固定内容
    └── <Outlet />             ← 被替换为 <ProductDetail />
         └── <h3>产品详情 123</h3>

访问 /products/new 时：

  Products 组件渲染
    ├── <h1>产品列表</h1>      ← 父级固定内容
    └── <Outlet />             ← 被替换为 <NewProduct />
         └── New Product
```

子路由组件使用 `useParams` 获取动态参数：

```jsx
// src/pages/Products/Detail/index.jsx
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { productId } = useParams();
  return (
    <>
      <h3>产品详情 {productId}</h3>
    </>
  );
}

export default ProductDetail;
```

> 🎯 **Outlet 的本质**：它是一个占位符，告诉 React "把匹配到的子路由组件渲染在这里"。这样父级组件的公共部分（导航、侧边栏等）不会重新渲染，只有内容区域切换。

---

## 八、404 兜底路由与 useNavigate

### 🎯 如何处理未知路径？

当用户访问一个不存在的路由时，我们需要一个**兜底页面**。使用 `path="*"` 可以匹配所有未被其他 Route 匹配的路径：

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  {/* ...其他路由 */}

  {/* * 贪婪匹配所有，最后404兜底 —— 必须放在最后！ */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 🔄 `useNavigate`：编程式导航

有时候我们需要在 JS 代码中跳转路由（而不是用户点击链接），比如：

- 404 页面 3 秒后自动跳回首页
- 表单提交成功后跳转
- 鉴权失败后跳转到登录页

```jsx
// src/pages/NotFound/index.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  let navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      // 3秒后自动跳转到首页
      navigate('/');
    }, 3000);
  }, []);

  return (
    <>
      Not Found
    </>
  );
};

export default NotFound;
```

### 📌 `navigate()` vs `window.location.href`

| 方式 | 刷新页面 | SPA 体验 | 状态保留 |
|------|----------|----------|----------|
| `navigate('/')` | ❌ 不刷新 | ✅ 丝滑 | ✅ 保留 |
| `window.location.href = '/'` | ✅ 刷新 | ❌ 白屏 | ❌ 丢失 |

> ⚠️ **注意**：在 React Router 中，永远用 `navigate()` 做跳转，除非你确实需要刷新整个页面。

---

## 九、重定向：Navigate 组件

### 🔀 场景说明

有些场景需要**自动重定向**：

- 旧路由迁移到新路由（SEO 兼容）
- 用户访问首页时重定向到某个子页面
- 鉴权失败时重定向到登录页

`<Navigate>` 组件可以在路由配置中声明重定向规则：

```jsx
// 当用户访问 /old-path 时，自动重定向到 /new-path
<Route path='/old-path' element={<Navigate replace to="/new-path" />} />
```

### 📝 关键属性

| 属性 | 说明 |
|------|------|
| `to` | 重定向的目标路径 |
| `replace` | 用新路径替换历史记录（用户不能通过"后退"回到旧路径） |

> 💡 **`replace` 的作用**：如果不加 `replace`，用户点击浏览器"后退"按钮会回到 `/old-path`，然后又被重定向到 `/new-path`，形成死循环。加了 `replace` 后，`/old-path` 的历史记录被替换掉了。

---

## 十、鉴权路由（路由守卫）

### 🔐 核心问题

有些页面需要**登录后才能访问**，比如：
- `/pay` 支付页面
- `/dashboard` 管理后台
- `/settings` 用户设置

我们需要一个"门禁系统"——**路由守卫**，在用户访问这些页面前检查是否已登录。

### 🏗️ 实现思路

```
用户访问 /pay
     ↓
ProtectRoute（门禁）检查 localStorage
     ↓
已登录？ → 渲染 <Pay />（放行）
未登录？ → 重定向到 /login（拦截）
```

### 🔧 ProtectRoute 组件

```jsx
// src/ProtectRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

const ProtectRoute = ({ children }) => {
  // 从 localStorage 检查登录状态
  const isLogin = localStorage.getItem('isLogin') === 'true';

  // 获取当前路由信息（用于登录后跳回）
  const location = useLocation();

  if (!isLogin) {
    // 未登录 → 重定向到 /login
    // 同时把当前路径通过 state 传递过去，登录后可以跳回来
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 已登录 → 渲染子组件（放行）
  return <>{children}</>;
};

export default ProtectRoute;
```

### 📝 在路由配置中使用

```jsx
// src/App.jsx
<Route path='/pay' element={
  <ProtectRoute>
    <Pay />
  </ProtectRoute>
} />
```

这里运用了 **`props.children` 模式**：
- `<ProtectRoute>` 是"门禁安保"
- `<Pay />` 是"要进的房间"（children）
- 通过鉴权后，`<ProtectRoute>` 渲染 `{children}` 即 `<Pay />`

> 💡 **这种模式的优势**：`ProtectRoute` 是一个**通用组件**，可以包裹任何需要鉴权的页面，无需为每个页面单独写鉴权逻辑。

### 🔑 登录页面实现

```jsx
// src/pages/Login/index.jsx
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // 从 location.state 获取"从哪里来"的信息
  const from = location.state?.from || '/';

  function handleSubmit(e) {
    e.preventDefault(); // 阻止表单默认提交行为

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
      alert('请输入用户名和密码');
      return;
    }

    if (username === 'admin' && password === '123456') {
      // 登录成功，标记登录状态
      localStorage.setItem('isLogin', 'true');

      // 跳转回之前的页面（而不是首页）
      // replace: 用目标页面替换登录页的历史记录
      // 这样用户登录后按"后退"不会回到登录页
      navigate(from, { replace: true });
    } else {
      alert('用户名或密码错误');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>登录</h1>
      <input name='username' placeholder='请输入用户名' required />
      <input name='password' placeholder='请输入密码' required />
      <button type='submit'>登录</button>
    </form>
  );
}

export default Login;
```

### 🔄 完整鉴权流程

```
1. 用户访问 /pay（未登录）
     ↓
2. ProtectRoute 检查 → isLogin = false
     ↓
3. 重定向到 /login，携带 state: { from: '/pay' }
     ↓
4. 用户输入 admin / 123456 登录
     ↓
5. localStorage 设置 isLogin = 'true'
     ↓
6. navigate('/pay', { replace: true }) 跳回支付页面
     ↓
7. ProtectRoute 再次检查 → isLogin = true → 放行 ✅
```

> 🎯 **`replace: true` 的妙用**：登录成功后，用 `/pay` 替换 `/login` 的历史记录。用户按浏览器"后退"按钮时，不会回到登录页，而是回到登录前的页面，体验更自然。

---

## 十一、编程式导航与 useLocation

### 📍 `useLocation`：获取当前路由信息

`useLocation()` 返回一个 location 对象，包含当前 URL 的详细信息：

```jsx
const location = useLocation();
console.log(location.pathname);  // 当前路径，如 "/login"
console.log(location.state);     // 通过 navigate 或 Link 传递的状态对象
console.log(location.search);    // 查询字符串，如 "?name=test"
console.log(location.hash);      // 锚点，如 "#section1"
```

### 🧭 核心 Hooks 一览

| Hook | 用途 | 返回值 |
|------|------|--------|
| `useParams()` | 获取动态路由参数 | `{ id: "123" }` |
| `useNavigate()` | 编程式导航 | `navigate('/path')` 函数 |
| `useLocation()` | 获取当前路由信息 | location 对象 |
| `useSearchParams()` | 读写 URL 查询参数 | `[searchParams, setSearchParams]` |
| `useMatch()` | 匹配某个路由 | match 对象或 null |

### 🔄 `navigate()` 的两种用法

```jsx
const navigate = useNavigate();

// 1️⃣ 简单跳转
navigate('/about');

// 2️⃣ 带选项跳转
navigate('/login', {
  replace: true,                    // 替换历史记录
  state: { from: location.pathname } // 传递状态数据
});
```

---

## 十二、完整项目结构总览

```
react-router-demo/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              ← 应用入口
    ├── App.jsx               ← 路由配置（核心！）
    ├── App.css               ← 样式
    ├── index.css             ← 全局样式
    ├── ProtectRoute.jsx      ← 路由守卫（鉴权）
    ├── components/
    │   └── Navigation.jsx    ← 导航栏（Link 组件）
    └── pages/
        ├── Home/
        │   └── index.jsx     ← 首页
        ├── About/
        │   └── index.jsx     ← 关于页
        ├── Login/
        │   └── index.jsx     ← 登录页（useNavigate + useLocation）
        ├── Pay/
        │   └── index.jsx     ← 支付页（受路由守卫保护）
        ├── UserProfile/
        │   └── index.jsx     ← 用户页（useParams 动态参数）
        ├── NotFound/
        │   └── index.jsx     ← 404 页面（自动跳转首页）
        └── Products/
            ├── index.jsx     ← 产品列表（嵌套路由 + Outlet）
            ├── Detail/
            │   └── index.jsx ← 产品详情（useParams）
            └── new/
                └── index.jsx ← 新增产品
```

### 📊 路由配置速查表

| 路径 | 组件 | 特性 |
|------|------|------|
| `/` | `<Home />` | 基础路由 |
| `/about` | `<About />` | 基础路由 |
| `/user/:id` | `<UserProfile />` | 动态路由 + `useParams` |
| `/products` | `<Products />` | 嵌套路由（父级） |
| `/products/:productId` | `<ProductDetail />` | 嵌套路由（子级） |
| `/products/new` | `<NewProduct />` | 嵌套路由（子级） |
| `/old-path` | `<Navigate to="/new-path" />` | 重定向 |
| `/login` | `<Login />` | 编程式导航 |
| `/pay` | `<ProtectRoute><Pay /></ProtectRoute>` | 鉴权路由 |
| `*` | `<NotFound />` | 404 兜底 |

---

## 🎯 总结

本文通过一个完整的 Demo 项目，覆盖了 React Router 的所有核心知识点：

1. **前端路由的本质**：监听 URL 变化 → 渲染对应组件 → 实现 SPA 无刷新体验
2. **Router + Routes + Route**：路由配置三件套
3. **路由懒加载**：`lazy()` + `<Suspense>` 优化首屏性能
4. **Link 组件**：SPA 专属导航，替代 `<a>` 标签
5. **动态路由**：`:param` 声明 + `useParams()` 获取
6. **嵌套路由**：父级布局 + `<Outlet />` 子路由出口
7. **404 兜底**：`path="*"` 匹配所有未命中路由
8. **重定向**：`<Navigate>` 组件声明式跳转
9. **路由守卫**：`ProtectRoute` + `props.children` 模式实现鉴权
10. **编程式导航**：`useNavigate()` + `useLocation()` 灵活控制路由

> 🚀 掌握了这些，你就掌握了 React Router 的全部核心能力，可以构建任何复杂的 SPA 应用了！
