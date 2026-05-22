# Claude Code

- AIGC 代码生成
  豆包复制代码 chatbot
- vscode+cc 插件
  AI Coding Agent
  手和脚  直接干活，生成代码直接写入文件夹
- cc 的命令行工具
 - 基于nodejs
 - npm config set registry https://registry.npmmirror.com
 npm node package management
  包的来源设置为淘宝源 国内 快
  - npm install -g @anthropic-ai/claude-code
  全局安装 cc 命令行 npm包
   claude --version

## cc 开发网页 jima

- Claude 
是否信任文件夹
就像你请了个程序员帮你该项目，得先把办公室门禁给他，他才能进去看代码、改文件、跑命令，
但权限也只限你授权的这个文件。

这体现了Anthropic 在Claude code里强调最小权限+安全边界 思想

## Vibe coding
- 不要急于将任务交给llm
- 先思考
  五个构建块，
  llm 擅长执行准确清晰的任务
  Prompt 设计能力是关键

## cc 提供plan 模式
通过询问一系列问题，cc 会根据你的回答，生成一个计划
,帮助你完成任务
代替Prompt
 ## plan 模式
 - 不是直接执行任务
 - 先规划一下，再执行
  请了诸葛亮
  /plan 规划模式
 - 新的工作模式
  不太了解行业和领域，/plan 可以降低难度
  -claude code 非常智能(智能体)
  思考、规划、建议并执行
  - 对新手友好

  ## 使用cc 维护一个已有的项目
  - 先思考，了解项目
  运行起来，
  按模块看代码
  -  cc
  - 如果之前就是 cc 开发的
  直接查看根目录下的claude.md文件（项目描述文件）
  - 如果不是呢？
  /init
  初始化项目，生成claude.md文件
  将项目都分析一遍
