# webgpu-deepseek
## huggingface
AI圈最火的开源大模型社区，各厂商把AI模型发布到这里。
modelscope

transform.js
web 访问 id 远程下载， 访问，并执行nlp 任务
场景

deepseek deepseek-r1-distill-qwen 1.5B 文件上传（GB）-> huggingface -> transform.js->load -> web 下载到浏览器本地（慢）- > 浏览器缓存-> webgpu(新特性，兼容性)->nlp 任务

## 安装依赖
```bash
npm install
```
- @huggingface/transformers
  js版本的transformers库，用于加载模型，执行推理
- "marked"
  aigc 返回的是markdown 格式文本，有利于在文本中表示一定的格式，比如代码，加粗，引用等等。显示到页面前需要把md格式的文本转换为html格式，才能在浏览器中正常显示

  更简洁
  # <h1></h1>
  marked 库可以实现这个功能
  ```bash
  npm install marked
  ```
 
## 引入webworker
个人介绍，聊一下自己的项目 webgpu-deepseek
怎么学习？看你不知道的javascript，掘金等社区，关注一些AI博主 github 看源码，输出内容到社区

## !!(navigator as any).gpu;
navigator.gpu 报错，比较新，试验阶段的属性，ts 没有很好识别Navigator类，ts理解和学习
navigator as any
as 类型断言，
any  ts 的原生类型 任意类型，不要乱用，会泛滥
用于忽略ts 类型检查
别的方式？
## ts 类型检测的底层
ts 里有专门的类型申明文件，@types/webgpu 本质是缺少类型声明文件
pnpm i -D @webgpu/types 安装类型声明文件 开发期间依赖
开发阶段用ts，代码打包后用js

tsconfig.app.json  typescript 配置文件 根据项目需求做各种配置
type 配置 安装类型声明文件，才能使用新的属性
types: ["vite/client", "@webgpu/types"],

## 设计模式
OOP 面向对象编程，总结出来的23种解决特定问题的模式
数据结构，ADT
面向设计，而不是实现 Design Pattern
## 单例模式
类只能实例化一次，全局只有一个实例。
用于解决全局变量的问题，以及全局状态的问题。

## load
- 空值合并运算符
  ??= 用于在变量为null 或 undefined 时，赋值给变量
  如果变量为false或其它值，则不赋值。
  用于避免重复赋值，保持变量的原始值。AutoTokenizer.from_pretrained
  开销比较大
- web 异步下载
  AutoTokenizer.from_pretrained 异步下载模型，返回 Promise
  等待模型下载完成，再执行后续操作
  文件比较大，文件的chunk 慢慢到达， 提供一个progress_callback 回调函数，用于更新下载进度
  AutoModelForCausalLM.from_pretrained 异步下载模型，返回 Promise
  等待模型下载完成，再执行后续操作
  Promise.all([])
