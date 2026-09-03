# 🚀 TypeScript 高级工具类型面试指南

> 面试官："说说 TS 里的 `Pick`、`Omit`、`Partial`？"
> 你："……" 😶
>
> 别慌，读完这篇，你就是全场最靓的仔 ✨

---

## 📋 目录

- [一、为什么需要工具类型？](#一为什么需要工具类型)
- [二、七大工具类型逐一击破](#二七大工具类型逐一击破)
  - [Pick — 精挑细选](#1-pick--精挑细选)
  - [Omit — 去其糟粕](#2-omit--去其糟粕)
  - [Partial — 雨露均沾](#3-partial--雨露均沾)
  - [Record — 批量生产](#4-record--批量生产)
  - [ReturnType — 拿来吧你](#5-returntype--拿来吧你)
  - [Exclude — 联合过滤](#6-exclude--联合过滤)
  - [keyof — 键的提取器](#7-keyof--键的提取器)
- [三、🔥 拼多多笔试题：Omit 的等价实现](#三-拼多多笔试题omit-的等价实现)
- [四、速查表](#四速查表)
- [五、总结](#五总结)

---

## 一、为什么需要工具类型？

在大型项目中，类型定义会越来越多、越来越复杂。你不可能每次都从零手写一个新类型——**太累了，也太容易出错**。

TypeScript 内置了一系列 **Utility Types（工具类型）**，让你像搭积木一样，从已有类型派生出新类型。

> 🎯 **核心思想**：类型复用，减少冗余，提升类型安全。

---

## 二、七大工具类型逐一击破

先定义一个基础类型，后面所有示例都基于它：

```typescript
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}
```

---

### 1. Pick — 精挑细选 🎯

> **场景**：我只想要 `User` 的 `id` 和 `name`，其他不要。

```typescript
type UserPreview = Pick<User, 'id' | 'name'>;

const u: UserPreview = {
  id: 1,
  name: 'yihao',
  // ❌ age: 18    报错！UserPreview 里没有 age
  // ❌ email: 'x'  报错！UserPreview 里没有 email
}
```

**一句话总结**：`Pick<T, K>` 从类型 `T` 中挑选出键 `K` 组成新类型。

> 💡 **面试加分点**：适合在大型项目中，针对不同场景（列表展示、详情编辑、API 请求）对同一个实体类型做裁剪。

---

### 2. Omit — 去其糟粕 🗑️

> **场景**：我想要 `User` 的所有字段，**除了** `email`（安全场景，不暴露邮箱）。

```typescript
type UserSafe = Omit<User, 'email'>;

const safeUser: UserSafe = {
  id: 1,
  name: 'yihao',
  age: 18,
  // ❌ email: 'yihao@example.com'  报错！
}
```

**一句话总结**：`Omit<T, K>` 从类型 `T` 中排除键 `K`，保留剩余字段。

> 🔗 `Pick` 和 `Omit` 是一对"互补"操作：一个选、一个删。

---

### 3. Partial — 雨露均沾 🌧️

> **场景**：PATCH 请求只需要传修改的字段，不用传全部。

```typescript
type PartialUser = Partial<User>;

// ✅ 所有字段都变成可选的，传几个都行
const patchUser: PartialUser = {
  id: 1,
  name: 'yihao',
}

// ✅ 甚至可以一个都不传
const emptyObj: PartialUser = {};
```

**一句话总结**：`Partial<T>` 将类型 `T` 的所有属性变为可选。

> 💡 **实际应用**：表单的"草稿保存"功能——用户还没填完，你不能要求所有字段必填。

---

### 4. Record — 批量生产 🏭

> **场景**：HTTP 状态码和错误信息的映射。

```typescript
type ErrorMsgMap = Record<number, string>;

const errorMsgMap: ErrorMsgMap = {
  400: '请求参数错误',
  401: '未授权',
  403: '权限不足，拒绝访问',
  404: '资源找不到',
  500: '服务器内部错误',
}

function getErrMsg(code: number) {
  return errorMsgMap[code] ?? '未知错误';
}
```

**一句话总结**：`Record<K, V>` 构造一个键类型为 `K`、值类型为 `V` 的字典类型。

> 💡 **常见搭配**：`Record<string, any>` 万能字典，但面试时别说用 `any`，会扣分 😅

---

### 5. ReturnType — 拿来吧你 🪣

> **场景**：不想手动写函数返回值类型，让 TS 自动推断。

```typescript
function fn() {
  return { x: 1, y: 2 };
}

type FnReturn = ReturnType<typeof fn>;
// 推断结果：{ x: number; y: number }
```

**一句话总结**：`ReturnType<T>` 获取函数类型 `T` 的返回值类型。

> 💡 **实战技巧**：配合 `typeof` 使用，真正做到"类型跟着代码走"，改一处全生效。

---

### 6. Exclude — 联合过滤 🧹

> **场景**：从联合类型中删除某些成员。

```typescript
type All = "id" | "name" | "age" | "email";
type AfterExclude = Exclude<All, "email">;
// 结果："id" | "name" | "age"
```

**一句话总结**：`Exclude<T, U>` 从联合类型 `T` 中排除可以赋值给 `U` 的类型。

> ⚠️ **注意区分**：`Exclude` 处理的是**联合类型**，`Omit` 处理的是**对象类型**。它们的"战场"不同！

---

### 7. keyof — 键的提取器 🔑

> **场景**：拿到对象类型所有键的联合类型。

```typescript
type UserKeys = keyof User;
// 结果："id" | "name" | "age" | "email"
```

**一句话总结**：`keyof T` 返回类型 `T` 所有公有属性键的联合类型。

> 🔗 `keyof` 是很多高级工具类型的"地基"，理解它才能理解下面的硬核题。

---

## 三、🔥 拼多多笔试题：Omit 的等价实现

这是面试中的高频考点，也是真正区分"会用"和"懂原理"的分水岭。

### 题目

> `Omit<T, K>` 等价于 `Pick<T, Exclude<keyof T, K>>`，请解释。

### 代码拆解

```typescript
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// 第一步：拿到所有键
type UserKeys = keyof User;
// 👉 "id" | "name" | "age" | "email"

// 第二步：排除不要的键
type KeepKeys = Exclude<UserKeys, "email">;
// 👉 "id" | "name" | "age"

// 第三步：从原类型中挑选剩余的键
type MyOmitUser = Pick<User, KeepKeys>;
// 👉 { id: number; name: string; age: number }
```

### 🔍 三步拆解图

```
┌─────────────────────────────────────────────────┐
│                   Omit<T, K>                     │
│          等价于 Pick<T, Exclude<keyof T, K>>      │
└─────────────────────────────────────────────────┘

  Step 1: keyof T           拿到 T 的所有键
  ┌───────────────────┐
  │ User → "id" | "name" | "age" | "email"
  └───────────────────┘
            │
            ▼
  Step 2: Exclude<..., K>   删掉 K 对应的键
  ┌───────────────────┐
  │ 删掉 "email"
  │ → "id" | "name" | "age"
  └───────────────────┘
            │
            ▼
  Step 3: Pick<T, ...>      从 T 中挑选剩余的键
  ┌───────────────────┐
  │ { id, name, age } ✅
  └───────────────────┘
```

### 💬 面试话术模板

> `Omit<T, K>` 的本质就是三步操作：
> 1. 先用 `keyof T` 拿到 `T` 的**所有键**的联合类型；
> 2. 再用 `Exclude` 从这个联合类型中**剔除** `K` 里指定的键；
> 3. 最后用 `Pick` 把**剩余的键**从 `T` 中挑选出来，组成新类型。
>
> 所以 `Omit` 不是新的魔法，而是 `keyof` + `Exclude` + `Pick` 的**组合拳**。

---

## 四、速查表

| 工具类型 | 作用 | 一句话 |
|:---:|:---|:---|
| `Pick<T, K>` | 选取指定键 | 从 T 中挑出 K |
| `Omit<T, K>` | 排除指定键 | 从 T 中删掉 K |
| `Partial<T>` | 全部可选 | 所有属性加 `?` |
| `Record<K, V>` | 构造字典 | 键 K 值 V 的对象 |
| `ReturnType<T>` | 取返回值类型 | 函数返回啥类型 |
| `Exclude<T, U>` | 联合类型过滤 | 从联合中删掉 U |
| `keyof T` | 取所有键 | 返回键的联合类型 |

---

## 五、总结

```
面试考的不是你会不会用 Pick，
而是你能不能说出 Omit = Pick + Exclude + keyof 的组合原理。
```

掌握这三个层次，面试稳了：

| 层次 | 能力 | 面试表现 |
|:---:|:---|:---|
| 🟢 **会用** | 能写出 `Pick<User, 'id'>` | 基本分 |
| 🟡 **懂原理** | 能解释 `Omit` 的等价实现 | 加分项 |
| 🔴 **能手写** | 能自己实现简易版工具类型 | 满分选手 |

---

> 📌 **最后一句话**：工具类型不是炫技，而是大型 TypeScript 项目的**生存技能**。
> 面试官想看的，是你对类型系统的**理解深度**，而不是背了多少 API。
>
> 加油，offer 在向你招手 🎉
