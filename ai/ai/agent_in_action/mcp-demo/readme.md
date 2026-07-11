# MCP

pnpm i @modelcontextprotocol/sdk
pnpm i zod 

- 这里的 tool 有什么问题？
1. 只能在我们这个项目里面用，不能在其它项目里用
2. node 写的 ，如何java/python/rust 写的 tool呢？

 tool 独立于llm，本地/远程 跨进程、跨语言调用

 ## MCP 协议
 Model Control Protocol 
 - 标准化llm 与tool 和 资源之间的通信
    llm 和 tool 解耦
- 基于 stdio 标准输入输出流 ，键盘输入，控制台输出，当一个进程（Agent）调一个子进程（node child_process） 或 其他语言进程时，可以通过stdio标准输入输出流来实现通信
- http 远程通信 MCP 掌管

不管是本地工具，还是远程工具，agent 想**跨进程**调用某个工具，通过MCP 协议来实现。
是给Model扩展Context 上下文， 让它能做的更多（tool），知道的更多（resource）的Protocol协议

## MCP 的特点

MCP 最大的特点就是可以**跨进程**调用工具。
跨本地的进程调用，就是stdio。
跨远程的进程调用，就是http。
ai agent 是MCP 客户端（host），可以通过MCP 协议来调用各种MCP Server，client配置添加，实现**跨进程**工具调用。
它和fecth 不同 不是接口调用 不是拿接口数据，它是要扩展Context（tool&resource）

## MCP Tool
本质tool 

## resources
- MCP stdio/http 跨进程提供 Tool/resource/Prompt