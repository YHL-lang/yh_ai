# JavaScript 数据类型

## 前言

在 JavaScript 中，一切皆"值"，而每个值都有其所属的类型。理解 JS 的数据类型是掌握这门语言的基石。根据 ECMA262 规范，JavaScript 共有 **8 种数据类型**，可以分为两大类：**原始数据类型（Primitive Type）**和**复杂数据类型（Object / Reference Type）**。

在 ES6 之前，JS 只有 6 种类型。ES6 新增了 Symbol 和 BigInt，使得类型体系更加完善。

---

## 一、数据类型全景图

```
JavaScript 数据类型（8 种）
├── 原始数据类型（Primitive Type）— 6 种
│   ├── Number     数值类型
│   ├── BigInt     大整数类型（ES6 新增）
│   ├── String     字符串类型
│   ├── Boolean    布尔值类型
│   ├── Null       空值类型
│   ├── Undefined  未定义类型
│   └── Symbol     唯一标识符类型（ES6 新增）
│
└── 复杂数据类型
    └── Object     对象类型（引用数据类型）
```

> **注意**：从规范层面，Number 和 BigInt 同属 Numeric（数值类型）这个内部类别。但从日常开发角度，我们习惯将它们视为独立的类型。

---

## 二、原始数据类型

原始数据类型的值是不可变的，存储在**栈内存**中，赋值时是**值的拷贝**。

### 2.1 Null — 空值类型

`null` 表示一个**有意设置为空的对象引用**。它的语义是："这里应该有一个值，但目前没有。"

**常见使用场景：**

- 初始化一个变量，表示稍后会赋值为对象
- 清空一个变量的值，帮助垃圾回收释放内存
- 表示某个属性暂时不存在

```js
// 表示空，没有
let a = null;
console.log(a); // null — 表示值为空

// 拷贝式赋值：原始类型赋值是"复印机"式的传数据
let b = a;      // b 拷贝了 a 的值
b = 2;          // 修改 b 不影响 a
console.log(a); // null
console.log(b); // 2

// 利用 null 帮助垃圾回收
let largeobj = {
  data: new Array(100000000).fill("hgh")
};
// 当不再需要这个大对象时，置为 null 让垃圾回收器回收内存
largeobj = null;
```

#### Null 与 Undefined 的对比

```js
let obj = {
  name: 'Alice',
  address: null   // 有意设置为空 — "我知道 address 存在，但目前没有值"
};
console.log(obj.address); // null
console.log(obj.age);     // undefined — "age 这个属性根本不存在"
```

**关键区别**：`null` 是**主动设置**的空，`undefined` 是**系统告知**的"不存在"。

---

### 2.2 Undefined — 未定义类型

`undefined` 表示一个**未初始化或不存在的变量值**。它通常由 JavaScript 引擎自动返回，而非开发者主动赋值。

**触发 undefined 的四种典型场景：**

```js
// 场景一：声明变量但未赋值
let a;                // 声明变量，未赋值，未初始化
console.log(a);       // undefined

// 场景二：访问对象不存在的属性
let obj = {};
console.log(obj.property); // undefined

// 场景三：函数没有返回值
function noReturn() {
  // 函数体内没有 return 语句
}
console.log(noReturn()); // undefined

// 场景四：访问不存在的数组索引
let arr = [1, 2, 3];
console.log(arr[5]);     // undefined — 索引 5 不存在
```

> **最佳实践**：开发中尽量使用 `null` 来主动表示"空值"，让 `undefined` 保持其系统语义——"这个东西还没被定义"。

---

### 2.3 Number — 数值类型

JavaScript 中的数字统一使用**64 位双精度浮点数（IEEE 754）**来表示，这意味着它**不擅长精确计算**，尤其是小数运算。

```js
// JS 用二进制存储数值，某些十进制小数无法精确表示
// 就像 1/3 在十进制中是 0.3333333333333333... 无限循环
let a = 0.1;
let b = 0.2;
console.log(a + b); // 0.30000000000000004 — 不是精确的 0.3！
```

这是浮点数运算的通病，并非 JS 独有。处理涉及金额等需要精确计算的场景时，通常会将小数转为整数计算，或使用专门的库。

---

### 2.4 BigInt — 大整数类型（ES6 新增）

当数字超出 `Number` 的安全整数范围（`Number.MAX_SAFE_INTEGER`，约为 9 千万亿）时，精度会丢失。BigInt 正是为解决这一问题而生——它可以表示**任意大的整数**。

使用方式：在整数后面加 `n` 后缀。

```js
// 超大整数，Number 无法精确表示
let num1 = 999999999999999999999999999999999999999999999999999999999999999n;
let num2 = 123456789098765433467324577654789008733233456899003466788924243n;

console.log(num1 + num2, typeof num1); // 结果精确，类型为 bigint
console.log(num1 + 1n);  // BigInt 只能与 BigInt 运算，不能混用 Number
```

> **注意**：BigInt 不能与普通 Number 混合运算，必须显式转换。

---

### 2.5 Symbol — 唯一标识符类型（ES6 新增）

Symbol 通过函数调用 `Symbol()` 创建，**每一次调用都会产生一个绝对唯一的值**，即使传入相同的描述标签。

```js
// Symbol — 唯一的标识符，用函数创建，属于简单数据类型
// 轻松表达"独一无二"

console.log(Symbol('zhang'));
// Symbol(zhang)

// 即使描述相同，两个 Symbol 也不相等
console.log(Symbol('zhang') === Symbol('zhang'));
// false — 每一个 Symbol 都是唯一的

console.log(typeof Symbol('zhang'));
// "symbol"

// Symbol 可以不传标签
console.log(Symbol()); // Symbol() — 绝对唯一

// 典型用法：给对象添加不会冲突的键名
let obj = {
  [Symbol()]: 'value',
  prop: '2'
};
// Symbol 作为属性键不会被常规遍历访问到，适合做"隐藏"属性
```

Symbol 的核心价值在于**保证唯一性**，常用于：
- 定义对象的私有属性（不会与任何其他键冲突）
- 作为常量枚举值
- 拦截/自定义内置行为（如 `Symbol.iterator`）

---

### 2.6 String — 字符串类型

String 用于表示文本数据。在 JavaScript 中，字符串是**不可变的（immutable）**——一旦创建，就不能修改其内容。任何对字符串的"修改"操作，本质上都是**创建了一个新的字符串**。

#### 创建字符串的三种方式

```js
// 方式一：单引号
let str1 = 'Hello';

// 方式二：双引号
let str2 = "World";

// 方式三：反引号（ES6 模板字符串）
let name = 'Alice';
let str3 = `你好，${name}！`; // 支持变量插值和换行
console.log(str3); // "你好，Alice！"
```

#### 字符串的不可变性

```js
let s = 'hello';
s[0] = 'H';        // 尝试修改第一个字符
console.log(s);    // "hello" — 并没有改变！

// 所谓的"修改"实际上是创建新字符串
let upper = s.toUpperCase();
console.log(upper); // "HELLO" — 这是一个全新的字符串
console.log(s);     // "hello" — 原字符串不变
```

#### 常用操作

```js
let text = 'JavaScript';

// 长度
console.log(text.length);          // 10

// 拼接
console.log('Hello ' + 'World');   // "Hello World"
console.log(`1 + 1 = ${1 + 1}`);   // "1 + 1 = 2" — 模板字符串更优雅

// 索引访问
console.log(text[0]);              // "J"
console.log(text.charAt(1));       // "a"

// 截取
console.log(text.slice(0, 4));     // "Java" — 从索引0到4（不含4）
console.log(text.substring(0, 4)); // "Java"

// 分割与合并
console.log('a,b,c'.split(','));   // ["a", "b", "c"]
console.log(['a', 'b'].join('-')); // "a-b"

// 大小写转换
console.log('abc'.toUpperCase());  // "ABC"
console.log('XYZ'.toLowerCase());  // "xyz"
```

> **小提示**：虽然可以通过 `new String()` 创建字符串对象，但**千万不要这样做**——它会创建一个对象包装而非原始字符串，导致 `typeof` 判断出错和比较行为异常。始终使用字面量方式。

---

### 2.7 Boolean — 布尔值类型

Boolean 只有两个值：`true` 和 `false`。看似简单，但它与 JavaScript 的**真值（Truthy）**和**假值（Falsy）**概念紧密相连，是条件判断的核心。

```js
let isLoggedIn = true;
let isExpired = false;

console.log(typeof isLoggedIn); // "boolean"
```

#### 布尔转换：什么被认为是"真"，什么是"假"

在需要布尔值的上下文（如 `if` 语句）中，JS 会自动将值转换为布尔类型。以下 **6 个值**会被转换为 `false`，称为 **Falsy 值**：

```js
// 只有这 6 个是 Falsy，其余一切皆为 Truthy
Boolean(false);     // false — 布尔 false 本身
Boolean(0);         // false — 数字 0（包括 -0 和 0n）
Boolean(-0);        // false
Boolean(0n);        // false — BigInt 的 0
Boolean('');        // false — 空字符串
Boolean(null);      // false
Boolean(undefined); // false
Boolean(NaN);       // false — 非数值
```

**除了以上 6 种，其他所有值转换为布尔都是 `true`：**

```js
// 这些你可能误以为是 false，但它们实际上是 true
Boolean(' ');         // true — 带空格的字符串
Boolean('0');         // true — 字符串 "0"，不是数字 0
Boolean('false');     // true — 非空字符串！
Boolean([]);          // true — 空数组
Boolean({});          // true — 空对象
Boolean(function(){});// true — 函数
Boolean(-1);          // true — 非零数字
Boolean(Infinity);    // true

// 实际工程中的常见用法
let username = '';
if (!username) {
  console.log('用户名为空'); // 会执行 — 空字符串是 falsy
}

let arr = [];
if (arr.length) {
  // 空数组的 length 是 0（falsy），所以这里不会执行
}
```

#### 短路求值：布尔逻辑的实用技巧

```js
// && 逻辑与：找到第一个 falsy 值并返回，全真则返回最后一个
console.log(0 && 'hello');      // 0 — 遇到 falsy 立即返回
console.log(1 && 'hello');      // "hello" — 全真返回最后一个
console.log(true && 1 && 'ok'); // "ok"

// || 逻辑或：找到第一个 truthy 值并返回，全假则返回最后一个
console.log(0 || 'hello');      // "hello" — 遇到 truthy 立即返回
console.log(1 || 'hello');      // 1
console.log(0 || '' || null);   // null — 全假返回最后一个

// 实战：设置默认值
function greet(name) {
  let displayName = name || '匿名用户';
  console.log(`你好，${displayName}！`);
}
greet('小明');  // "你好，小明！"
greet('');      // "你好，匿名用户！" — 空字符串是 falsy，触发默认值
greet();        // "你好，匿名用户！"

// 更严格的做法：使用 ?? 空值合并运算符（ES2020）
// ?? 只在 null/undefined 时触发默认值，空字符串不会被替换
let displayName = name ?? '匿名用户';
```

> **关键心智模型**：`if` 的条件判断、`!` 取反、`&&` / `||` 短路求值，这些操作都会隐式地做布尔转换。记住 6 个 Falsy 值，剩下的就全是 Truthy。

---

## 三、复杂数据类型：Object

Object 是 JavaScript 中唯一的**复杂数据类型**（引用类型）。它和原始类型在存储方式、赋值行为、比较逻辑上都有本质差异。理解这些差异，是掌握 JS 核心机制的关键一步。

### 3.1 什么是 Object？

Object 是一个**键值对（key-value）的集合**。键（属性名）是字符串或 Symbol，值可以是任意类型——包括另一个 Object。

```js
// 创建对象的多种方式
// 方式一：对象字面量（最常用）
let user = {
  name: 'Alice',
  age: 25,
  greet() {
    console.log('Hello!');
  }
};

// 方式二：构造函数
let obj2 = new Object();
obj2.key = 'value';

// 方式三：Object.create()
let prototype = { inherited: true };
let child = Object.create(prototype);
child.own = false;

console.log(child.own);       // false — 自有属性
console.log(child.inherited); // true — 原型链上的属性
```

### 3.2 Object 的"子类型"

在 JavaScript 中，Array、Function、Date、RegExp、Map、Set 等，它们的本质都是 Object——只是带有特殊的内部结构和行为。

```js
// 数组 — 有序的键值对（键是数字索引）
let arr = [1, 2, 3];
console.log(typeof arr);     // "object"
console.log(Array.isArray(arr)); // true — 需要用这个方法判断

// 函数 — 可调用的对象
function foo() { return 'bar'; }
console.log(typeof foo);     // "function"（但本质仍是 object）

// 函数也是对象，可以添加属性！
foo.description = '这是一个示例函数';
console.log(foo.description); // "这是一个示例函数"

// Date
let now = new Date();
console.log(now instanceof Date); // true

// Map — 更强大的键值对集合，键可以是任意类型
let map = new Map();
map.set({ id: 1 }, 'value');  // 用对象作为键
console.log(map.get({ id: 1 })); // undefined — 不同引用，不是同一个对象
```

### 3.3 引用式赋值：共享内存的核心机制

Object 的实际数据存储在**堆内存（Heap）**中，而变量在**栈内存（Stack）**中只保存**指向堆内存的引用地址**。这导致了赋值行为的关键差异：

```js
// 引用式赋值：传递的是地址，而非数据的拷贝

let Obj1 = { name: 'Alice' };
let Obj2 = Obj1;        // Obj2 拿到了 Obj1 的引用地址，指向同一个堆内存对象
let Obj3 = Obj1;        // Obj3 也同样指向这个对象

Obj2.company = '快手';   // 通过 Obj2 修改对象
console.log(Obj1, Obj2, Obj3);
// 三个变量看到的都是 { name: 'Alice', company: '快手' }
// 因为它们指向的是同一个堆内存对象！
```

**与原始类型的对比实验：**

```js
// 原始类型：独立拷贝，互不影响
let x = 10;
let y = x;    // y 得到了值 10 的拷贝
y = 20;       // 修改 y 不影响 x
console.log(x); // 10
console.log(y); // 20

// 引用类型：共享引用，一改全改
let objA = { count: 10 };
let objB = objA;      // objB 得到了地址的拷贝（都指向同一个对象）
objB.count = 20;      // 通过 objB 修改对象内容
console.log(objA.count); // 20 — objA 也受影响！
```

### 3.4 对象的比较：比较的是引用地址

```js
// 看似"相同的对象"，比较结果却是 false
console.log({} === {});                        // false — 两个独立的对象
console.log({ name: 'a' } === { name: 'a' }); // false — 内容相同但地址不同

// 只有引用同一个对象时才为 true
let ref1 = {};
let ref2 = ref1;
console.log(ref1 === ref2); // true — 同一个引用

// 数组同理
console.log([1, 2] === [1, 2]); // false
```

> 想比较内容相等？浅层用 `Object.is()` 比较引用，深层内容比较需要递归遍历所有属性（深比较），或使用 `JSON.stringify()` 快速但不完全可靠的方式。

### 3.5 常见的 Object 操作

```js
let person = {
  name: 'Alice',
  age: 25
};

// 读取属性
console.log(person.name);        // "Alice" — 点语法
console.log(person['name']);     // "Alice" — 方括号语法（可用于动态键名）

// 新增/修改属性
person.company = '字节跳动';      // 新增属性
person.age = 26;                 // 修改已有属性

// 删除属性
delete person.age;
console.log(person.age); // undefined — 属性已删除

// 检查属性是否存在
console.log('name' in person);           // true
console.log(person.hasOwnProperty('name')); // true

// 遍历
for (let key in person) {
  console.log(key, person[key]); // "name" "Alice", "company" "字节跳动"
}

console.log(Object.keys(person));   // ["name", "company"] — 自有可枚举属性
console.log(Object.values(person)); // ["Alice", "字节跳动"]
console.log(Object.entries(person));// [["name","Alice"], ["company","字节跳动"]]
```

### 3.6 嵌套对象与深拷贝问题

当对象内部还包含对象时，浅层的引用式赋值会带来"意料之外"的联动修改：

```js
let original = {
  name: 'Alice',
  address: {
    city: '北京',
    district: '朝阳区'
  }
};

// 浅拷贝：只复制第一层属性
let shallowCopy = { ...original }; // 展开运算符 — 浅拷贝
shallowCopy.name = 'Bob';          // 修改第一层，不影响 original
shallowCopy.address.city = '上海'; // 修改嵌套对象 — 影响 original！

console.log(original.name);           // "Alice" — 不受影响 ✓
console.log(original.address.city);   // "上海" — 被联动修改了 ✗

// 为什么会这样？因为 address 是引用类型，
// 浅拷贝只复制了 address 的引用地址，original 和 shallowCopy 的 address
// 指向的是堆内存中同一个子对象！

// 解决方案：深拷贝
let deepCopy = JSON.parse(JSON.stringify(original));
deepCopy.address.city = '深圳';
console.log(original.address.city);   // "上海" — 不再受影响 ✓

// 更健壮的深拷贝：structuredClone()（现代浏览器/Node 17+）
// let cloned = structuredClone(original);
```

> 这就是 "修改 Obj2 会影响 Obj1" 在更深层的体现——不只顶层对象共享引用，嵌套的对象也共享引用。理解这一点是掌握 React 不可变数据更新、Vue 响应式原理以及状态管理库的基础。

---

## 四、从内存分配视角理解数据类型

要深入理解原始类型和引用类型的差异，需要回到计算机体系结构的基石——**冯·诺依曼体系**。现代计算设备（你手中的电脑、手机、服务器）都基于这一架构。

### 4.1 冯·诺依曼架构与代码执行

```
现代计算设备包含五大部件：
运算器 + 控制器 + 存储器 + 输入设备 + 输出设备
```

代码从编写到执行的完整流程：

1. **代码存放于外存（硬盘/SSD）**：你写的 `.js` 文件安静地躺在硬盘上
2. **编译/解释时，代码从硬盘调入内存（RAM）**：当 Node.js 或浏览器引擎开始执行时，代码和相关数据被加载到内存
3. **JS 引擎创建执行上下文**：引擎为每个函数调用创建一个执行上下文，包含：
   - **变量环境（Variable Environment）**：存放 `var` 声明的变量
   - **词法环境（Lexical Environment）**：存放 `let`/`const` 声明的变量
   - **this 绑定**：指向当前执行上下文所属的对象
4. **执行上下文被推入调用栈（Call Stack）**

```js
// 通过一个具体示例理解这个过程
function multiply(a, b) {
  let result = a * b;   // result 存储在 multiply 的执行上下文中
  return result;
}

function calculate() {
  let x = 10;           // x 存储在 calculate 的执行上下文中
  let y = 20;
  return multiply(x, y); // 调用 multiply 时，创建新执行上下文并推入调用栈
}

let answer = calculate();
console.log(answer); // 200

// 调用栈的变化过程：
// 1. 全局执行上下文入栈
// 2. 调用 calculate() → calculate 执行上下文入栈
// 3. 调用 multiply(10, 20) → multiply 执行上下文入栈
// 4. multiply 返回 200 → multiply 执行上下文出栈
// 5. calculate 返回 200 → calculate 执行上下文出栈
// 6. 回到全局执行上下文
```

### 4.2 栈内存（Stack）深入

栈内存是 JS 引擎管理函数调用和局部变量的核心场所。

```
栈内存结构示意（地址从高到低增长）：

    高地址
  ┌───────────────────┐
  │ 全局执行上下文      │ ← 最先入栈，最后出栈
  │ 变量环境 + 词法环境 │
  ├───────────────────┤
  │ calculate() 上下文  │ ← 中间入栈
  │ x=10, y=20        │
  ├───────────────────┤
  │ multiply() 上下文   │ ← 当前栈顶
  │ a=10, b=20, result │
  └───────────────────┘
    低地址（栈顶 ← SP寄存器指向这里）

栈指针（Stack Pointer）：
- 每个执行上下文的大小在编译阶段已经确定
- 函数调用入栈时，SP 向下移动已知的偏移量
- 函数返回出栈时，SP 向上回移同样的偏移量
- 这个偏移量是编译时就能精确算出来的 — 不需要运行时计算
```

**为什么栈这么快？**

1. **内存空间是连续的**：执行上下文一块接一块排列，没有碎片
2. **大小是编译时确定的**：每个变量占多少字节、整个上下文占多少，引擎在编译阶段就算清楚了
3. **分配只需移动一个指针**：入栈 = SP 减一个常量，出栈 = SP 加一个常量——O(1) 时间
4. **缓存友好**：连续内存意味着 CPU 缓存命中率极高

```js
// 编译器在编译阶段就能确定每个变量的大小
let count = 42;      // Number — 8 字节
let flag = true;     // Boolean — 通常 4 字节（内部可能是 int32）
let name = 'hello';  // String — 在栈中存的是指针，指向常量池/堆

// 整个执行上下文的总大小 = 各变量大小之和 + 元数据
// 这个值是常量，编译时就确定了
```

### 4.3 堆内存（Heap）深入

堆（Heap）是一个**巨大的、相对混乱的内存池**，专门存放"编译时算不出大小的"数据。

```
为什么需要堆？看这个例子：

function createUser() {
  let name = 'Alice';             // 字符串内容存在常量池或堆中
  let hobbies = ['读书', '编程'];  // 数组长度运行时才知道
  return { name, hobbies };       // 函数返回后这个对象还要继续存在！
}

let user = createUser();
// createUser 执行完毕，它的栈帧被回收了
// 但 { name, hobbies } 对象还活着 — user 变量（在全局栈帧中）还引用着它
// 这个对象必须在堆中，因为它的生命周期超越了创建它的函数
```

**栈对象 vs 堆对象的生命周期：**

| 维度 | 栈 | 堆 |
|------|----|----|
| **生命周期** | 随函数调用入栈，随函数返回销毁 | 由 GC 决定，可以跨越多个函数调用 |
| **大小** | 编译时确定，通常较小（MB 级别） | 运行时动态分配，理论上限接近可用内存 |
| **分配速度** | 极快，一条 CPU 指令 | 较慢，需要搜索空闲块 |
| **回收方式** | 自动，函数返回即回收 | 由 GC 异步回收，时机不可控 |
| **碎片问题** | 无碎片，LIFO 出栈 | 可能产生碎片，需要 GC 整理 |

### 4.4 垃圾回收（Garbage Collection）简析

JavaScript 引擎使用**自动垃圾回收**来管理堆内存。核心思想：**从根（Root）出发，能被访问到（reachable）的对象保留，无法访问到的对象回收**。

```js
// 根（Root）包括：
// - 全局变量（window / global）
// - 当前执行函数的局部变量
// - 当前调用栈上所有函数的局部变量

// 引用计数法与标记清除法
function demo() {
  let a = { data: '重要数据' };  // a 引用这个对象 → 可达，不回收
  let b = a;                     // b 也引用同一个对象 → 仍然可达
  
  a = null;                      // a 断开引用，但 b 还指着 → 依然可达
  b = null;                      // b 也断开，对象没有任何引用了 → 不可达 → GC 回收
  
  // 函数结束时，a 和 b 出栈销毁，对象自然也变成不可达
}

// 循环引用问题（现代引擎使用标记清除，可以处理）
function cycleExample() {
  let x = {};
  let y = {};
  x.ref = y;  // x → y
  y.ref = x;  // y → x — 循环引用
  
  // 旧式引用计数法：两个对象始终计数为 1，永远不会回收（内存泄漏）
  // 现代标记清除法：从根出发无法到达这两个对象 → 正常回收
}
```

**开发中的内存意识：**

```js
// 不用的引用及时断开，帮助 GC
let heavyData = { data: new Array(1000000).fill('占用大量内存') };

// 方式一：超出作用域（函数结束自动回收 — 最自然的方式）
function process() {
  let temp = { data: new Array(1000000) };
  // ... 处理
} // 函数结束，temp 不再可达，GC 会回收

// 方式二：手动置 null（适用于长生命周期的变量）
heavyData = null;  // 告诉 GC："这个变量不再需要了，可以回收了"

// 方式三：闭包陷阱 — 意外的内存持有
function createHandler() {
  let bigData = new Array(1000000);  // 大量数据
  return function() {
    return bigData[0];  // 这个闭包持有 bigData 引用，bigData 永不回收！
  };
}
let handler = createHandler();
// 即使你只用 bigData[0]，整个 bigData 数组仍然活着
// 修复：只保留需要的
function createHandlerFixed() {
  let first = new Array(1000000)[0]; // 只保留第一项
  return function() { return first; };
}
```

### 4.5 图解：栈与堆的协作全景

```
┌───────────── 调用栈（Stack）─────────────┐   ┌────────── 堆（Heap）──────────┐
│                                           │   │                              │
│ ┌─ 全局执行上下文 ─────────────────────┐   │   │  ┌────────────────────────┐  │
│ │ let n = 42;            // 值42在栈中  │   │   │  │ {                      │  │
│ │ let s = 'hello';       // s存栈指针─┐ │   │   │  │   name: 'Alice',       │  │
│ │ let obj = 0xA001;      // obj存地址─┼─┼───┼───┼──→│   age: 25,             │  │
│ │ let arr = 0xA002;      // arr存地址─┼─┼─┐ │   │  │   company: '字节跳动'   │  │
│ │ let fn = 0xA003;       // fn存地址──┼─┼─┼─┼─┐ │  │ }                      │  │
│ └──────────────────────────────────────┘ │ │ │ │  └────────────────────────┘  │
│                                           │ │ │ │                              │
│ ┌─ createUser() 执行上下文 ────────────┐ │ │ │ │  ┌────────────────────────┐  │
│ │ let name = 0xB001;    // name栈指针──┼─┼─┼─┼─┼──→│ "临时用户名"            │  │
│ │ let temp = 0xB002;    // temp存地址──┼─┼─┼─┼─┼─┐ └────────────────────────┘  │
│ └──────────────────────────────────────┘ │ │ │ │ │                            │
│                                           │ │ │ │ │  ┌────────────────────────┐  │
└───────────────────────────────────────────┘ │ │ │ │  │ [1, 2, 3, 4, 5]        │  │
                                              │ │ │ └──→ (Array 实例)            │  │
                                              │ │ │    └────────────────────────┘  │
                                              │ │ │                              │
                                              │ │ │    ┌────────────────────────┐  │
                                              │ │ └────→│ function foo() { ... }  │  │
                                              │ │      └────────────────────────┘  │
                                              │ │                                │
                                              │ └──────→ String "hello"          │
                                              │         (运行时常量池)             │
                                              └──────────────────────────────────┘

栈：存原始值、存指针。函数结束 → 帧弹出 → 指针消失。
堆：存对象实体。只有当没有任何栈指针指向它时，GC 才回收。
```

> **一句话总结**：栈是函数调用的"现场"，堆是数据的"仓库"。栈上的是短暂的、确定的、快速的；堆上的是长久的、灵活的、需要 GC 管理的。

### 4.6 实际影响：从内存视角看常见场景

```js
// 场景一：函数传参 — 原始类型安全，引用类型需警惕
function modify(num, obj) {
  num = 999;          // num 是原始类型，函数内修改不影响外部
  obj.name = '被篡改'; // obj 是引用类型，修改的是堆上的同一个对象！
}

let count = 0;
let user = { name: 'Alice' };
modify(count, user);
console.log(count);       // 0 — 不受影响
console.log(user.name);   // "被篡改" — 外部也被改了！

// 场景二：组件/模块间共享状态
// React 中，如果你直接修改 state 对象而不是 setState 一个新对象，
// React 无法检测到变化（因为引用没变），导致组件不重渲染。
// 这就是为什么需要不可变更新：
// setState({ ...oldState, newKey: value })  // 创建新引用

// 场景三：性能权衡
// 栈分配快但空间有限 — 递归过深会栈溢出（Stack Overflow）
function infiniteRecursion() {
  return infiniteRecursion(); // 每次调用都向栈中推入一个新帧
}
// 最终报错：Maximum call stack size exceeded — 栈满了

// 堆空间大 — 但频繁创建抛弃对象会增加 GC 压力
// 在动画帧（60fps → 16ms/帧）中大量创建对象 → GC 触发 → 卡顿
```

---

## 五、总结

| 类型        | 分类     | 存储位置     | 赋值方式   | 说明                     |
| ----------- | -------- | ------------ | ---------- | ------------------------ |
| Number      | 原始类型 | 栈（存值）   | 值拷贝     | 浮点数，精度有限         |
| BigInt      | 原始类型 | 栈（存值）   | 值拷贝     | ES6 新增，任意大整数     |
| String      | 原始类型 | 栈（存值）   | 值拷贝     | 不可变字符串             |
| Boolean     | 原始类型 | 栈（存值）   | 值拷贝     | true / false             |
| Null        | 原始类型 | 栈（存值）   | 值拷贝     | 主动设置的空             |
| Undefined   | 原始类型 | 栈（存值）   | 值拷贝     | 系统告知的"不存在"       |
| Symbol      | 原始类型 | 栈（存值）   | 值拷贝     | ES6 新增，唯一标识符     |
| Object      | 引用类型 | 栈存地址+堆存数据 | 引用传递 | 包含 Array、Function 等 |

理解这些基础，是后续深入学习原型链、深浅拷贝、响应式原理、内存管理等一系列高级话题的起点。把根基打牢，上层建筑才能稳固。
