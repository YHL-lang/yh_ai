# TS 必考题 之 type & interface的区别
- interface 的开发用法
- 共同点
  interface 和 type 都可以描述**对象**的结构，用于函数参数、返回值，给对象、变量做类型的约束。

  interface User{
    name: string;
    age: number;
    avatarUrl: string;
  }
  type UserType ={
    name: string;
    age: number;
    avatarUrl: string;
  }

## 区别
- 继承
  - interface extends
  - type  &
- 接口属性可以分头多次约束，合并
- type 不可以重复声明
- 能否表示非对象类型
  简单数据类型的别名
  - interface 不能表示非对象类型，如原始类型、数组、函数等。
  - type 可以表示非对象类型，如原始类型、数组、函数等。
- 函数类型的区别
  都可以表达，有些区别，type 更方便