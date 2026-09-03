# 🔐 React + JWT 登录鉴权全链路实战

> **技术栈**：React 19 + React Router 7 + Zustand + Axios + Vite Mock + JSONWebToken
>
> 本文将从零拆解一个完整的 JWT 登录鉴权 Demo，涵盖 **Mock 服务 → 登录接口 → Token 签发 → 请求拦截 → 路由守卫 → 全局状态管理** 的完整闭环。

---

## 📖 目录

- [1. 为什么需要 JWT？](#1-为什么需要-jwt)
- [2. 项目架构总览](#2-项目架构总览)
- [3. Mock 服务搭建](#3-mock-服务搭建)
- [4. JWT 签发与验证（核心）](#4-jwt-签发与验证核心)
- [5. Axios 封装与请求拦截器](#5-axios-封装与请求拦截器)
- [6. Zustand 全局状态管理](#6-zustand-全局状态管理)
- [7. 登录页面与表单验证](#7-登录页面与表单验证)
- [8. 路由守卫（鉴权拦截）](#8-路由守卫鉴权拦截)
- [9. 导航栏动态渲染](#9-导航栏动态渲染)
- [10. 总结](#10-总结)

---

## 1. 为什么需要 JWT？

HTTP 协议是 **无状态（Stateless）** 的，服务器不知道"你是谁"。传统方案是 **Cookie + Session**：

| 对比维度 | Cookie/Session | JWT |
|---------|---------------|-----|
| 存储位置 | 服务端内存 | 客户端本地 |
| 每次请求 | 自动携带 Cookie | 手动放 Header |
| 分布式 | ❌ 需要共享 Session | ✅ 任意服务器可验证 |
| 扩展性 | 受限 | 天然适合微服务 |

**JWT 的核心流程**：

```
用户登录 → 服务器签发 Token → 客户端存储 → 每次请求携带 → 服务器验证解码
```

> 💡 **关键理解**：JWT 是 **单向操作** —— JSON 身份对象通过 `sign` 变成 Token，通过 `verify` 还原，但无法从 Token 反推出密钥。

---

## 2. 项目架构总览

```
login-demo/
├── mock/
│   └── user.js              # 🎭 Mock 接口（登录 + 鉴权）
├── src/
│   ├── api/
│   │   ├── config.js         # ⚙️ Axios 实例 + 拦截器
│   │   ├── user.js           # 👤 用户相关接口
│   │   └── repo.js           # 📦 资源相关接口
│   ├── components/
│   │   ├── Nav.jsx           # 🧭 导航栏组件
│   │   └── RequireAuth.jsx   # 🛡️ 路由守卫组件
│   ├── pages/
│   │   ├── Home.jsx          # 🏠 首页
│   │   ├── Login.jsx         # 🔑 登录页
│   │   └── Pay.jsx           # 💰 支付页（需鉴权）
│   ├── store/
│   │   ├── user.js           # 🗄️ 用户状态仓库
│   │   └── todos.js          # 📝 Todos 状态仓库
│   ├── App.jsx               # 🚀 应用入口 + 路由配置
│   └── main.jsx              # 📌 渲染入口
└── vite.config.js            # 🔧 Vite 配置（含 Mock 插件）
```

**核心依赖**：

```json
{
  "axios": "^1.20.0",           // HTTP 请求库
  "jsonwebtoken": "^9.0.3",    // JWT 签发与验证
  "react": "^19.2.6",          // UI 框架
  "react-router-dom": "^7.18.3", // 路由
  "zustand": "^5.0.15",        // 轻量状态管理
  "vite-plugin-mock": "^3.0.2" // Mock 数据插件
}
```

---

## 3. Mock 服务搭建

> ⚠️ **重点**：使用 `vite-plugin-mock` 在开发环境中模拟后端接口，无需真实服务器。

### 3.1 Vite 配置

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: 'mock',      // 👈 Mock 文件目录
      localEnabled: true,    // 👈 开发环境启用 Mock
    })
  ],
})
```

> 🔑 **核心配置**：`mockPath` 指定 Mock 文件存放目录，`localEnabled` 控制开发环境是否启用。

---

## 4. JWT 签发与验证（核心）

> 🌟 **这是整个项目的核心文件**，模拟了后端的登录签发和资源验证两个关键接口。

```js
// mock/user.js
import jwt from 'jsonwebtoken'

// 🔐 密钥（生产环境应存放在环境变量中，绝不能硬编码）
const secret = 'secret819!$';

export default [
  {
    // ============================================
    // 📦 接口一：获取资源（需要 Token 验证）
    // ============================================
    url: '/api/repo',
    method: 'GET',
    response: req => {
      // ① 从请求头获取 Authorization 字段
      const authHeader = req.headers['authorization'];

      // ② 没有 Token → 401 未登录
      if (!authHeader) {
        return { code: 401, message: '未登录' }
      }

      // ③ 提取 Bearer 后面的 Token 字符串
      const token = authHeader.split(' ')[1];

      try {
        // ④ ⭐ 核心：verify 验证 Token 并解码出用户信息
        let decode = jwt.verify(token, secret);
        return { code: 0, data: decode.user }
      } catch (err) {
        // ⑤ Token 过期或被篡改 → 验证失败
        return { code: 401, message: 'token验证失败' }
      }
    }
  },
  {
    // ============================================
    // 🔑 接口二：用户登录（签发 Token）
    // ============================================
    url: '/api/login',
    method: 'POST',
    timeout: 2000,
    response: (req, res) => {
      const body = req.body;

      // ① 校验用户名密码
      if (body.username !== 'admin' || body.password !== '123456') {
        return { code: -1, message: '用户名或密码错误' }
      }

      // ② ⭐ 核心：sign 签发 Token
      //    - 第一个参数：用户身份信息（载荷 Payload）
      //    - 第二个参数：密钥
      //    - 第三个参数：配置项（过期时间等）
      const token = jwt.sign(
        { user: body.username, role: 'admin' },  // 👈 身份信息
        secret,                                     // 👈 密钥
        { expiresIn: 86400 }                        // 👈 有效期 24 小时（秒）
      )

      // ③ 返回 Token 和用户信息给前端
      return {
        code: 0,
        user: { username: body.username },
        token: token   // 👈 前端拿到后存入 localStorage
      }
    }
  }
]
```

### 🔍 JWT 工作原理图解

```
┌─────────────────────────────────────────────────────────────┐
│                     JWT 签发流程 (sign)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  { user: "admin", role: "admin" }                           │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐    ┌──────────┐                        │
│  │   Payload 载荷   │ +  │ Secret 密钥│                       │
│  └────────┬────────┘    └─────┬────┘                        │
│           │                   │                              │
│           └───────┬───────────┘                              │
│                   ▼                                          │
│           jwt.sign() 算法                                    │
│                   │                                          │
│                   ▼                                          │
│  "eyJhbGciOiJIUzI1NiIs..."  ← 这就是 Token                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    JWT 验证流程 (verify)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Header: Authorization: Bearer eyJhbGciOi...                │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐    ┌──────────┐                        │
│  │   Token 字符串   │ +  │ Secret 密钥│                       │
│  └────────┬────────┘    └─────┬────┘                        │
│           │                   │                              │
│           └───────┬───────────┘                              │
│                   ▼                                          │
│           jwt.verify() 算法                                  │
│                   │                                          │
│          ┌────────┴────────┐                                 │
│          ▼                 ▼                                 │
│     ✅ 验证成功        ❌ 验证失败                             │
│   解码出用户信息      Token过期/被篡改                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Axios 封装与请求拦截器

> 🌟 **拦截器是 JWT 自动化的关键**，让每个请求自动携带 Token，无需手动处理。

```js
// src/api/config.js
import axios from 'axios'

// ① 创建 Axios 实例，设置基础路径和超时
const instance = axios.create({
  baseURL: '/api',    // 👈 所有请求自动拼接 /api 前缀
  timeout: 5000
})

// ============================================
// ⭐ 请求拦截器：自动为每个请求添加 Token
// ============================================
instance.interceptors.request.use(config => {
  // ② 从 localStorage 读取 Token
  const token = localStorage.getItem('token');

  // ③ 如果存在 Token，添加到请求头
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    //  👆 格式：Bearer <token>  ← 这是行业标准格式
  }

  return config;  // ⚠️ 必须返回 config，否则请求会被中断
})

// ============================================
// 📥 响应拦截器：统一处理返回数据
// ============================================
instance.interceptors.response.use(res => {
  return res.data;  // 👈 直接返回 data，省去每次 res.data 的麻烦
})

export default instance
```

> 💡 **为什么用拦截器？**
> - 没有拦截器：每个接口都要手动加 `headers` → 代码冗余、容易遗漏
> - 有拦截器：`config.js` 写一次，所有接口自动生效 → **一处配置，全局生效**

### API 接口文件

```js
// src/api/user.js
import axios from './config';

// 登录接口
export const login = async (data) => {
  const res = await axios.post('/login', data);
  return res;
}
```

```js
// src/api/repo.js
import axios from './config';

// 获取资源接口（需要鉴权）
export const getRepo = async () => {
  const res = await axios.get('/repo');
  return res;
}
```

---

## 6. Zustand 全局状态管理

> 🌟 **Zustand 是本项目的状态管理核心**，管理用户登录状态，跨组件、跨路由共享。

### 6.1 用户状态仓库

```js
// src/store/user.js
import { create } from 'zustand'

// ⭐ create 是高阶函数：接收一个函数，返回一个 Hook
export const useAuthStore = create(set => ({
  // ============================================
  // 📦 状态：从 localStorage 初始化（刷新不丢失）
  // ============================================
  token: localStorage.getItem('token') || '',

  // 👇 安全解析 JSON，防止 localStorage 数据损坏导致崩溃
  user: (() => {
    try { return JSON.parse(localStorage.getItem('user')) }
    catch { return null }
  })(),

  // ============================================
  // 🔑 Action：登录 —— 保存 Token + 用户信息
  // ============================================
  setAuth: ({ token, user }) => {
    // ① 持久化到 localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // ② 更新 Zustand 状态（触发组件重新渲染）
    set({ token, user })
  },

  // ============================================
  // 🚪 Action：登出 —— 清除所有状态
  // ============================================
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: '', user: null })
  }
}))
```

### 6.2 Zustand vs Context API

| 对比维度 | Context API | Zustand |
|---------|-------------|---------|
| 代码量 | 需要 Provider + useContext | 一个 `create` 搞定 |
| 性能 | Context 值变化，所有消费者重渲染 | ✅ 精准订阅，按需渲染 |
| 使用方式 | 必须包裹 Provider | 任意组件直接调用 Hook |
| 适用场景 | 简单的静态值共享 | 频繁变化的全局状态 |

> 🔑 **核心理念**：`React App = UI Component + Store`，组件只负责 UI，状态统一由 Store 管理。

---

## 7. 登录页面与表单验证

> 🌟 **登录页是用户交互的入口**，集成了表单验证、API 调用、状态更新、路由跳转。

```jsx
// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api/user';
import { useAuthStore } from '../store/user';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ 记录用户从哪个页面跳转来的，登录后返回原页面
  const from = location.state?.from || '/';

  // ⭐ 从 Zustand 获取 setAuth 方法
  const setAuth = useAuthStore(state => state.setAuth);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isValid, setIsValid] = useState(false);

  // ============================================
  // 🔍 实时表单验证（每次输入触发）
  // ============================================
  useEffect(() => {
    const newErrors = { username: '', password: '' };

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3位';
    }

    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位';
    }

    setErrors(newErrors);
    setIsValid(!newErrors.username && !newErrors.password);
  }, [formData]);

  // ============================================
  // 🚀 登录提交
  // ============================================
  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await login(formData);      // ① 调用登录 API
      if (res.code === 0) {
        setAuth({ token: res.token, user: res.user }); // ② 存储到 Zustand + localStorage
        navigate(from, { replace: true });              // ③ 跳转回原页面
      } else {
        alert(res.message || '登录失败');
      }
    } catch (err) {
      alert('登录失败');
    }
  };

  return (
    <div className={styles.container}>
      <h2>登录</h2>
      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label htmlFor="username">用户名</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <div className={styles.error}>{errors.username}</div>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <div className={styles.error}>{errors.password}</div>}
        </div>
        <button type="submit" disabled={!isValid}>登录</button>
      </form>
    </div>
  );
}
```

### 🔄 登录流程时序图

```
用户输入账号密码        Login 组件           API 层           Mock 服务          Zustand Store
     │                    │                  │                  │                   │
     │  ① 填写表单         │                  │                  │                   │
     ├──────────────────► │                  │                  │                   │
     │                    │  ② login(formData)│                  │                   │
     │                    ├────────────────► │                  │                   │
     │                    │                  │  ③ POST /api/login│                   │
     │                    │                  ├────────────────► │                   │
     │                    │                  │                  │  ④ jwt.sign()     │
     │                    │                  │                  │  签发 Token        │
     │                    │                  │  ⑤ 返回 token     │                   │
     │                    │                  │ ◄────────────────┤                   │
     │                    │  ⑥ res.token     │                  │                   │
     │                    │ ◄────────────────┤                  │                   │
     │                    │                                      │                   │
     │                    │  ⑦ setAuth({ token, user })          │                   │
     │                    ├────────────────────────────────────────────────────────► │
     │                    │                                      │  ⑧ 写入 localStorage
     │                    │                                      │  ⑨ 更新状态，触发重渲染
     │                    │  ⑩ navigate('/')                     │                   │
     │                    ├──────►                               │                   │
```

---

## 8. 路由守卫（鉴权拦截）

> 🌟 **路由守卫是保护敏感页面的核心机制**，未登录用户无法访问受保护路由。

```jsx
// src/components/RequireAuth.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/user";

function RequireAuth({ children }) {
  // ⭐ 从 Zustand 获取 Token
  const token = useAuthStore((state) => state.token)

  // 🔐 没有 Token → 重定向到登录页
  if (!token) {
    return <Navigate to="/login" replace />
    //  👆 replace: 替换历史记录，用户点后退不会回到受保护页面
  }

  // ✅ 有 Token → 渲染子组件
  return children
}
```

### 路由配置中的使用

```jsx
// src/App.jsx
function App() {
  return (
    <Router>
      <Nav />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* ⭐ Pay 页面被 RequireAuth 包裹，未登录无法访问 */}
          <Route path="/pay" element={
            <RequireAuth>
              <Pay />
            </RequireAuth>
          } />
        </Routes>
      </Suspense>
    </Router>
  )
}
```

> 💡 **设计亮点**：使用 `<RequireAuth>` 包裹组件的方式，比在每个页面内部判断更优雅，实现了 **声明式鉴权**。

---

## 9. 导航栏动态渲染

```jsx
// src/components/Nav.jsx
import { Link } from "react-router-dom"
import { useAuthStore } from "../store/user"

function Nav() {
  // ⭐ 精准订阅：只在 token/user/logout 变化时重渲染
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/pay">pay</Link>

      {/* 🔐 未登录：显示 login 链接 */}
      {!token && <Link to="/login">login</Link>}

      {/* 👤 已登录：显示用户名 */}
      {user && <a>{user.username}</a>}

      {/* 🚪 已登录：显示退出按钮 */}
      {token && <button onClick={logout}>logout</button>}
    </nav>
  )
}
```

> 🔑 **Zustand 精准订阅**：`useAuthStore((state) => state.token)` 只订阅 `token` 字段，其他字段变化不会触发重渲染，性能优于 Context API。

---

## 10. 总结

### 🎯 核心知识点回顾

```
┌─────────────────────────────────────────────────────────────────┐
│                     完整鉴权链路                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① 用户登录  ──►  ② 服务端签发 Token (jwt.sign)                  │
│       │                          │                              │
│       ▼                          ▼                              │
│  ③ 前端存储 Token (localStorage + Zustand)                       │
│       │                                                         │
│       ▼                                                         │
│  ④ 请求拦截器自动携带 Token (Authorization: Bearer xxx)           │
│       │                                                         │
│       ▼                                                         │
│  ⑤ 服务端验证 Token (jwt.verify)                                 │
│       │                                                         │
│       ▼                                                         │
│  ⑥ 返回受保护资源                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 📋 各模块职责一览

| 模块 | 文件 | 职责 |
|------|------|------|
| 🎭 Mock 服务 | `mock/user.js` | 模拟后端，签发/验证 JWT |
| ⚙️ Axios 封装 | `src/api/config.js` | 创建实例 + 请求/响应拦截器 |
| 🗄️ 状态管理 | `src/store/user.js` | Zustand 管理登录状态，持久化到 localStorage |
| 🔑 登录页 | `src/pages/Login.jsx` | 表单验证 + 调用登录 API + 更新状态 |
| 🛡️ 路由守卫 | `src/components/RequireAuth.jsx` | 保护敏感路由，未登录跳转登录页 |
| 🧭 导航栏 | `src/components/Nav.jsx` | 根据登录状态动态渲染 UI |

### 💡 设计亮点

1. **声明式路由守卫**：用 `<RequireAuth>` 包裹组件，而非在页面内部判断
2. **拦截器自动化**：Token 自动附加到每个请求，无需手动处理
3. **Zustand 精准订阅**：按字段订阅状态变化，避免不必要的重渲染
4. **登录后返回原页**：通过 `location.state.from` 记录来源，提升用户体验
5. **持久化 + 内存双存储**：localStorage 保证刷新不丢失，Zustand 保证响应式

### ⚠️ 生产环境注意事项

- 🔐 **密钥管理**：JWT Secret 必须存放在环境变量中，绝不能硬编码
- 🕐 **Token 刷新**：实现 Refresh Token 机制，避免用户频繁重新登录
- 🛡️ **HTTPS**：Token 在网络传输中必须使用 HTTPS 加密
- 🚫 **XSS 防护**：localStorage 容易被 XSS 攻击窃取，可考虑 HttpOnly Cookie
- 📝 **错误处理**：统一处理 401 响应，自动跳转登录页

---

> 📚 **参考资料**：
> - [JWT 官网](https://jwt.io/)
> - [Zustand 文档](https://zustand-demo.pmnd.rs/)
> - [Axios 拦截器](https://axios-http.com/docs/interceptors)
> - [React Router 路由守卫](https://reactrouter.com/)
