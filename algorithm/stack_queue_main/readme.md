# 栈和队列
基于对数组的理解和掌握，线性数据结构(栈、队列和链表)

非线性数据结构，树 & 图

## 线性数据结构
- 数组和链表
数组 开箱即用 连续存储 + 下标访问
链表 不连续 
- 栈和队列

## 栈和队列的特性
看出操作受限的数组，特殊的数组
栈只能在栈顶操作(push)，只能在栈顶出栈(pop)，数组的尾部操作 LIFO 后进先出
队列只能在队尾入队(push)，只能在队头出队(shift)， FIFO 先进先出
也可以用链表来表达

## 灵活增删的数组
- 增加元素的方法 
push unshift splice
push 数组扩容的问题 链表没有这个问题 
unshift 内存视角              
- splice 删 增(slice + replace)
MDN splice 文档
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
splice (start_index, deleteCount, ... added_elements)
- 数组的增删 splice 都不是纯函数

## 栈 stack
LIFO Last In First Out 数据结构，**特殊**的数组

冰柜里的雪糕 
push/pop 受限操作 peek stack[length-1]
while(stack.length)

## 队列 queue
- 受限 push/shift 

## 链表 linked list
- 数组增加元素，arr.length >= capacity扩容和初始化 内存申请分配的开销，其余时刻没有的
- 链表 每次都申请 开销平均的

数据的规模
小——>数组
大——>链表

数组的优势 遍历 ， 索引取元素，缺点是增删，移动位置和申请空间
链表的优势 增删 (前驱节点，不要坐过站) 缺点是找到相应节点 时间复杂度O(n)

链表和数组是相似的，它们都是**有序**的列表(list),都是线性结构(有且仅有一个前驱、有且仅有一个后继)。
array 索引
linked list head -> node...... -> tail

链表中，数据单位节点，指针
节点和节点的分布是不连续的，是离散的。
// js 用对象字面量
{
  val:1,
  next:{
    val:2,
    next:
  }
}

head ? 节点
访问链表中的任何一个元素，从起始节点开始(val 空)，逐个访问next，一直访问到目标节点为止，tail 节点 (next 空)

## 链表元素的添加
本质是对next指针操作
前驱节点

## 链表元素的删除
本质是对next指针操作
前驱节点

假设数组长度是n，因增加或删除操作导致需要移动的元素数量，随着数组长度n的增大而增大，呈现一个线性关系
增加，删除操作对应的复杂度是O(n)
- js 数组特性

JS 数组未必是真正的数组
如果每一项类型一致，存数组，连续内存
如果类型不同，一段非连续内存，JS数组不再具有数组的特征，底层使用哈希表分配内存空间。

链表高效的增删操作
O(n) 固定的 查找时间
明确要插入/删除的目标位置，接着只需要改变目标节点及其前驱/后继节点指针的指向(O(1))
麻烦的访问操作O(n)