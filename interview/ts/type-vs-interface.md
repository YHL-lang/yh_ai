# TypeScript 面试题：type 与 interface 的区别与相同点

## 相同点 ✅

两者都可以定义对象结构：

```typescript
// interface 定义对象
interface User {
  name: string;
  age: number;
  avatarUrl: string;
}

// type 定义对象（相同）
type UserType = {
  name: string;
  age: number;
  avatarUrl: string;
}

const u1: User = {
  name: 'yihao',
  age: 18,
  avatarUrl: 'https://yihao.com',
}

const u2: UserType = {
  name: 'zhangsan',
  age: 20,
  avatarUrl: 'https://zhangsan.com',
}
```

两者都支持继承：

```typescript
// interface 用 extends 继承
interface Person {
  name: string;
}
interface Employee extends Person {
  job: string;
}

// type 用交叉类型 & 继承
type PersonType = {
  name: string;
}
type EmployeeType = PersonType & {
  job: string;
}

const e1: EmployeeType = {
  name: 'yihao',
  job: '字节跳动Agent开发工程师',
}
```

两者都可以定义函数类型：

```typescript
// interface 定义函数
interface AddFn {
  (a: number, b: number): number;
}
const add1: AddFn = (x, y) => x + y;

// type 定义函数
type AddFnType = (a: number, b: number) => number;
const add2: AddFnType = (x, y) => x + y;
```

---

## 核心区别 ❌

### 1. 声明合并（interface 独有）

```typescript
// ✅ interface 支持声明合并，属性可以分头多次约束
interface Animal {
  name: string;
}
interface Animal {
  age: number;
}
const dog: Animal = { name: '三寸钉', age: 2 }

// ❌ type 不可以重复声明，同名会报错
type AnimalType = { name: string; }
// type AnimalType = { age: number; }  // Error
```

### 2. 联合类型与元组（type 独有）

```typescript
// ✅ type 支持联合类型
type ID = string | number;

// ✅ type 支持元组
type Point = [number, number];

// ❌ interface 不支持
// interface ID = string | number;  // 语法错误
```

---

## 对比表

| 特性 | `interface` | `type` |
|------|:-----------:|:------:|
| 定义对象结构 | ✅ | ✅ |
| 继承 | `extends` | `&` |
| 声明合并 | ✅ | ❌ |
| 联合类型 | ❌ | ✅ |
| 元组类型 | ❌ | ✅ |
| 函数类型 | ✅ | ✅ |

---

## 使用建议

| 场景 | 推荐 |
|------|------|
| 对象结构、Props | `interface` |
| 联合类型、元组 | `type` |
| 扩展第三方库 | `interface` |

---

## 面试回答

> **相同点：** 都能定义对象结构，都支持继承，都能定义函数类型。
>
> **区别：** interface 支持声明合并；type 支持联合类型、元组。
>
> **建议：** 定义对象用 interface，联合类型用 type。
