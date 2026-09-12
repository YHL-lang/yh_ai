# 🎯 JavaScript 单例模式（Singleton Pattern）—— 从理论到实战

## 📖 什么是单例模式？

单例模式是 **OOP（面向对象编程）** 中最经典的设计模式之一，属于 GoF 23 种设计模式中的一种。

> 💡 **核心思想：** 一个类在系统中**只能被实例化一次**，无论调用多少次，返回的都是同一个实例。

单例模式常用于解决以下场景：

| 🔥 场景 | 说明 |
|---------|------|
| 全局状态管理 | 整个应用只需要一个管理器（如 Vuex Store、Redux Store） |
| 弹窗/窗口控制 | 页面中只允许打开一个弹窗窗口 |
| 数据库连接池 | 避免重复创建昂贵的连接资源 |
| 缓存管理 | 全局共享同一份缓存数据 |

---

## 🧠 为什么需要单例模式？

假设我们不用单例模式，每次需要弹窗时都 `new` 一个新对象：

```js
const a = new Popup();
const b = new Popup();
console.log(a === b); // ❌ false —— 这是两个完全不同的实例！
```

这意味着每次点击按钮都会创建一个**新的弹窗对象**，如果对象内部持有大量资源（DOM引用、网络连接等），就会造成：

- 🔴 **内存浪费** —— 重复创建不需要的对象
- 🔴 **状态不一致** —— 多个实例各自维护状态，互相不同步
- 🔴 **行为不可控** —— 比如重复打开多个窗口

单例模式正是为了**确保全局只有一个实例**而存在的。

---

## ✅ 单例模式的实现

下面是一个最简洁、最经典的 JavaScript 单例模式实现：

```js
class Popup {
  static ins; // ⬅️ 静态属性，存储唯一的实例

  static getInstance() {
    if (!Popup.ins) {
      Popup.ins = new Popup(); // 🔄 第一次调用时创建实例
    }
    return Popup.ins; // 🔁 后续调用直接返回已有实例
  }

  open(url) {
    window.open(url, "_blank");
  }
}
```

### 🔑 三个关键要素

| 要素 | 代码 | 作用 |
|------|------|------|
| ① 静态属性 | `static ins` | 作为类级别的"存储容器"，不绑定到任何实例 |
| ② 延迟初始化 | `if (!Popup.ins)` | 只在**首次**调用时才创建实例（惰性加载） |
| ③ 静态方法 | `static getInstance()` | 提供统一的获取入口，替代 `new` 关键字 |

> ⚠️ **注意：** 不要在声明静态属性时直接赋值 `static ins = new Popup()`，这会导致类加载时就立即实例化，失去了"延迟初始化"的优势。

---

## 🧪 验证：真的是同一个实例吗？

```js
const a = Popup.getInstance(); // 第一次获取
const b = Popup.getInstance(); // 第二次获取

console.log(a === b); // ✅ true —— a 和 b 指向同一个对象
```

用一张图来理解：

```
调用 getInstance()
       │
       ▼
  ┌──────────┐
  │ ins 存在？ │
  └─────┬────┘
        │
   ┌────┴────┐
   No        Yes
   │          │
   ▼          ▼
 new Popup()  直接返回 ins
   │
   ▼
 赋值给 ins，然后返回
```

**无论调用多少次 `getInstance()`，始终返回的是同一个 `Popup` 实例。** 🎉

---

## 🖥️ 完整实战：单例模式打开窗口

将单例模式应用到实际的页面交互中：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>单例模式打开窗口</title>
</head>
<body>
  <button id="openBtn">打开窗口</button>

  <script>
    // ========== ① 定义单例类 ==========
    class Popup {
      static ins;
      static getInstance() {
        if (!Popup.ins) {
          Popup.ins = new Popup();
        }
        return Popup.ins;
      }
      open(url) {
        window.open(url, "_blank");
      }
    }

    // ========== ② 通过 getInstance 获取实例（代替 new） ==========
    const popup = Popup.getInstance();

    // ========== ③ 绑定事件 ==========
    const openBtn = document.getElementById("openBtn");
    openBtn.addEventListener("click", () => {
      popup.open("https://www.baidu.com");
    });
  </script>
</body>
</html>
```

> 🔍 **为什么不用 `new Popup()` ？**
> 使用 `getInstance()` 能够**保证全局只有一个实例**。如果用 `new`，每次都会创建新对象，就失去了单例的意义。

---

## 🌟 单例模式的优缺点

### ✅ 优点

- 🏆 **全局唯一** —— 保证系统中该类只有一个实例
- 💾 **节省资源** —— 避免重复创建和销毁对象
- 🔄 **状态共享** —— 所有使用者访问同一个实例，状态天然同步

### ❌ 缺点

- 🚫 **违反单一职责** —— 类既要负责业务逻辑，又要管理自己的实例化
- 🧪 **测试困难** —— 全局状态可能导致测试之间互相影响
- 🔒 **不够灵活** —— 一旦实现为单例，后续难以扩展为多实例

---

## 📝 总结

| 维度 | 内容 |
|------|------|
| **是什么** | 保证一个类只有**一个实例**，并提供全局访问点 |
| **怎么实现** | `static` 属性存储实例 + `getInstance()` 延迟初始化 |
| **核心判断** | `if (!Instance)` → 不存在则创建，存在则直接返回 |
| **适用场景** | 弹窗管理、全局状态、连接池、缓存等 |
| **一句话** | 🎯 **用 `getInstance()` 代替 `new`，全局只有一个对象** |

> 💬 单例模式虽然简单，却是学习设计模式的绝佳入口。掌握了它，你就迈出了从"写代码"到"设计代码"的第一步。
