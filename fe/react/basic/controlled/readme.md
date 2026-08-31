# 🎮 React 受控组件 vs 非受控组件：一文搞懂表单的两种哲学

> 📌 **核心观点**：React 处理表单有两种范式 —— **受控组件**让 React 成为数据的"唯一真相源"，**非受控组件**则把数据交给 DOM 自己管理。理解二者的区别，是写出优雅 React 表单的第一步。

---

## 📖 目录

- [一、什么是受控组件？](#一什么是受控组件)
- [二、什么是非受控组件？](#二什么是非受控组件)
- [三、核心区别一图看懂](#三核心区别一图看懂)
- [四、实战：从简单到复杂](#四实战从简单到复杂)
  - [4.1 受控输入框](#41-受控输入框)
  - [4.2 非受控输入框](#42-非受控输入框)
  - [4.3 非受控评论框](#43-非受控评论框)
  - [4.4 受控注册表单](#44-受控注册表单)
  - [4.5 带验证的登录表单](#45-带验证的登录表单)
- [五、如何选择？](#五如何选择)

---

## 一、什么是受控组件？

🎯 **一句话总结**：输入框的值由 React 的 `state` 驱动，每次输入都同步更新 state。

受控组件的核心思想是 —— **React 状态是唯一数据源（Single Source of Truth）**。

```
用户输入 → 触发 onChange → 更新 state → state 回写到 input → 页面更新
     ↑                                                        |
     └────────────────── 单向数据流循环 ──────────────────────┘
```

### 🔑 关键特征

| 特征 | 说明 |
|------|------|
| `value` 绑定 | input 的值由 state 控制 |
| `onChange` 必须 | 必须监听变化并更新 state |
| 数据实时同步 | 每次按键都能拿到最新值 |
| React 是主人 | DOM 只是"投影"，React 说了算 |

---

## 二、什么是非受控组件？

🎯 **一句话总结**：输入框的值由 DOM 自身管理，需要时通过 `ref` 去"取"。

非受控组件更像是传统 HTML 表单的工作方式 —— **DOM 自己管数据，React 只在需要时读取**。

```
用户输入 → DOM 自行维护值 → 点击按钮 → 通过 ref 读取 DOM 值
```

### 🔑 关键特征

| 特征 | 说明 |
|------|------|
| `ref` 读取 | 通过 `useRef` 获取 DOM 节点 |
| 无需 onChange | 不需要监听每次输入变化 |
| 按需读取 | 只在需要时（如提交）才取值 |
| DOM 是主人 | 数据存在 DOM 节点上 |

---

## 三、核心区别一图看懂

```
┌─────────────────────────────────────────────────────────────────┐
│                        受控组件 Controlled                        │
│                                                                 │
│   ┌──────────┐    onChange    ┌──────────┐    value    ┌─────┐ │
│   │  用户输入  │ ──────────→  │  State   │ ──────────→ │Input│ │
│   └──────────┘               └──────────┘              └─────┘ │
│                              React 控制                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       非受控组件 Uncontrolled                     │
│                                                                 │
│   ┌──────────┐              ┌──────────┐    ref      ┌─────┐  │
│   │  用户输入  │ ──────────→  │   DOM    │ ──────────→ │读取值│  │
│   └──────────┘              └──────────┘              └─────┘  │
│                              DOM 自行管理                         │
└─────────────────────────────────────────────────────────────────┘
```

| 对比维度 | 🔵 受控组件 | 🟠 非受控组件 |
|---------|------------|-------------|
| **数据存储** | React State | DOM 节点 |
| **获取方式** | 直接读 state | `ref.current.value` |
| **实时性** | ✅ 每次输入同步 | ❌ 需要时才读取 |
| **代码量** | 较多 | 较少 |
| **适用场景** | 复杂交互、实时验证 | 简单提交、文件上传 |

---

## 四、实战：从简单到复杂

### 4.1 受控输入框 ✍️

最基础的受控组件 —— 每次输入都通过 `onChange` 更新 state。

```jsx
import { useState } from 'react';

function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <>
      <input
        type="text"
        value={value}                          // 📌 state 驱动值
        onChange={(e) => setValue(e.target.value)} // 📌 每次输入更新 state
      />
    </>
  );
}
```

**💡 运作流程**：

1. 用户按下键盘 → 触发 `onChange`
2. `e.target.value` 拿到最新输入
3. `setValue()` 更新 state
4. React 重新渲染，`value` 回写到 input
5. 页面显示最新内容

> 💬 **小贴士**：受控组件中，`value` 和 `onChange` 必须成对出现。只有 `value` 没有 `onChange`，输入框会变成只读！

---

### 4.2 非受控输入框 🔓

用 `useRef` 直接操作 DOM，不需要 state 参与。

```jsx
import { useRef } from 'react';

function UncontrolledInput() {
  const inputRef = useRef(null);  // 📌 创建 ref

  const handleClick = () => {
    console.log(inputRef.current.value);  // 📌 需要时才读取
  };

  return (
    <>
      <input type="text" ref={inputRef} />  {/* 📌 绑定 ref */}
      <button onClick={handleClick}>获取输入值</button>
    </>
  );
}
```

**💡 运作流程**：

1. 用户输入 → DOM 自行维护值（React 不参与）
2. 点击按钮 → 通过 `inputRef.current.value` 读取当前值
3. 没有 state 更新，没有重渲染

> 💬 **小贴士**：`useRef` 就像一根"绳子"，绑在 DOM 节点上，随时可以拉一下读取它的状态。

---

### 4.3 非受控评论框 💬

实际场景：评论框只需要在提交时读取内容，不需要实时同步。

```jsx
import { useRef } from 'react';

function CommentBox() {
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const comment = textareaRef.current.value;  // 📌 提交时才读取
    if (!comment) return;                        // 📌 简单校验
    console.log(comment);                        // 📌 发送到后端
  };

  return (
    <div>
      <textarea
        placeholder="请输入评论内容"
        ref={textareaRef}
      />
      <button onClick={handleSubmit}>提交评论</button>
    </div>
  );
}
```

**🎯 为什么这里用非受控？**

- 评论框内容不需要实时处理
- 只在点击"提交"时才需要数据
- 减少不必要的重渲染，性能更好

---

### 4.4 受控注册表单 📝

多字段表单的受控方案 —— 用一个 state 对象管理所有字段。

```jsx
import { useState } from 'react';

function RegisterForm() {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,                              // 📌 展开保留其他字段
      [e.target.name]: e.target.value       // 📌 动态 key 更新对应字段
    });
  };

  return (
    <div>
      <input
        name="username"                      // 📌 name 属性是关键
        value={form.username}
        onChange={handleChange}
        placeholder="请输入用户名"
      />
      <button type="submit">提交</button>
    </div>
  );
}
```

**🔑 核心技巧**：

```jsx
// 动态属性名 —— 一个 handleChange 处理所有字段
{
  ...form,
  [e.target.name]: e.target.value
}

// 等价于根据 name 动态选择：
// name="username" → { username: value }
// name="password" → { password: value }
```

> 💬 **扩展阅读**：这里用到了 JS 的**计算属性名**（Computed Property Names），`[e.target.name]` 会动态取 input 的 `name` 属性作为对象的 key。

---

### 4.5 带验证的登录表单 ✅

受控组件的终极优势 —— **实时验证**。

```jsx
import { useState } from 'react';

function LoginForm() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  // 📌 验证逻辑：每次输入都会触发
  const validate = (name, value) => {
    let msg = "";

    if (name === "username") {
      if (!value) msg = "用户名为空";
      else if (value.length < 3) msg = "用户名长度不能小于3";
    }

    if (name === "password") {
      if (!value) msg = "密码不能为空";
      else if (value.length < 6) msg = "密码长度不能小于6位";
    }

    setErrors((prev) => ({
      ...prev,
      [name]: msg
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validate(name, value);  // 📌 输入时实时验证
  };

  // 📌 表单是否合法
  const isValid =
    form.username &&
    form.password &&
    !errors.username &&
    !errors.password;

  const handleSubmit = (e) => {
    e.preventDefault();       // 📌 阻止默认提交行为
    if (!isValid) return;     // 📌 不合法则阻止提交
    console.log(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="请输入用户名"
      />
      {errors.username && <span>{errors.username}</span>}

      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="请输入密码"
      />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit" disabled={!isValid}>
        登录
      </button>
    </form>
  );
}
```

**✨ 亮点解析**：

| 功能 | 实现方式 |
|------|---------|
| 实时验证 | `handleChange` 中调用 `validate` |
| 错误提示 | `errors` state 驱动条件渲染 |
| 提交拦截 | `isValid` 控制按钮 + `handleSubmit` 守卫 |
| 防止刷新 | `e.preventDefault()` 阻止表单默认行为 |

---

## 五、如何选择？

```
                    需要实时验证/动态交互？
                           |
                     ┌─────┴─────┐
                     |           |
                    Yes          No
                     |           |
                     ▼           ▼
               ✅ 受控组件    只需要提交时取值？
                                   |
                             ┌─────┴─────┐
                             |           |
                            Yes          No
                             |           |
                             ▼           ▼
                       ✅ 非受控组件   ✅ 非受控组件
```

### 📋 快速决策表

| 场景 | 推荐 | 原因 |
|------|------|------|
| 实时输入验证 | 🔵 受控 | 每次输入都需要处理 |
| 动态启用/禁用按钮 | 🔵 受控 | 需要实时知道表单状态 |
| 复杂表单联动 | 🔵 受控 | 字段间需要互相影响 |
| 简单搜索框 | 🟠 非受控 | 只在提交时取值 |
| 文件上传 `<input type="file">` | 🟠 非受控 | 浏览器安全限制，只能非受控 |
| 集成非 React 库 | 🟠 非受控 | 避免与外部库冲突 |

---

## 🧭 组件目录结构

```
src/
├── components/
│   ├── ControlledInput.jsx    ← 受控输入框
│   ├── unControlldeInput.jsx  ← 非受控输入框
│   ├── CommentBox.jsx         ← 非受控评论框
│   ├── RegisterForm.jsx       ← 受控注册表单
│   ├── LoginForm/
│   │   ├── index.jsx          ← 带验证的登录表单
│   │   └── index.css          ← 登录表单样式
│   └── index.js               ← 统一导出清单
├── App.jsx                    ← 主入口，组合所有组件
└── main.jsx                   ← 应用挂载点
```

**📦 统一导出的好处**（`components/index.js`）：

```jsx
// 一个文件搞定所有导入，告别路径地狱
import {
  ControlledInput,
  UncontrolledInput,
  CommentBox,
  RegisterForm,
  LoginForm
} from './components';
```

---

## 📝 总结

| | 受控组件 | 非受控组件 |
|--|---------|-----------|
| **核心** | `useState` + `onChange` | `useRef` + DOM |
| **数据流** | React → DOM | DOM → React |
| **代码量** | 多一些 | 少一些 |
| **控制力** | 💪 强 | 🤏 弱 |
| **一句话** | "我来管" | "你自己管，需要时我来取" |

> 🎓 **最终建议**：大多数情况下，**优先使用受控组件**。它是 React 推荐的方式，能让你的表单逻辑更清晰、更可预测。只有在简单场景或特殊需求（如文件上传）时，才考虑非受控组件。

---

*💡 本文代码基于 React 19 + Vite，完整项目见 `uncontrolled-demo/` 目录。*
