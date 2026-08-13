<!-- <script setup>
import { ref } from 'vue'
const count = ref(0)
const username = ref('张三')

import HelloWorld from './components/HelloWorld.vue'
const increment = () => {
  count.value += 1
}
</script>

<template>
  <h1>流式输出{{ count }}</h1>
  <input type="text" v-model="username" />
  <button @click="increment">增加</button>
  <HelloWorld />
</template> -->

<script setup>
// vue3 composition 组合 api
// 把相关逻辑放在一起
import { ref } from 'vue'

// composition api 相关逻辑组织在一起 vue2 选项式 api 相关逻辑组织在一起
const question = ref('将一个中国龙的故事')
const stream = ref(true)
const content = ref('')

// update 函数
const update = async () => {
  if (!question.value) {
    return
  }
  content.value = '思考中....';//页面状态 开始llm 接口
  const endpoint = 'https://api.deepseek.com/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'user',
          content: question.value
        }
      ],
      stream: stream.value
    })
  });
  if (stream.value) {
    content.value = '';
    //大文件上传 慢慢流向 权限 + 形式 js原生提供了ReadableStream 对象
    // llm 服务器 streamAble 对象 数据流？
    //stream对象 水流 服务器端 流向-> 浏览器
    // response.body 服务器端响应体 二进制流
    console.log(response.body);
    // 水管子 ，喝一口 返回 读取器对象
    // awit 等token 流来为止
    const reader = response.body?.getReader();
    console.log(reader);
    // 二进制解码器 — 和 1.js 里的 TextEncoder 相反
    // TextEncoder: 字符串 → Uint8Array（编码）
    // TextDecoder: Uint8Array → 字符串（解码）
    const decoder = new TextDecoder(); //二进制服务
    let done = false;// 开关变量 data:[DONE]
    let buffer = '';// 缓存 截断准备了 上一次JSON.parse() 失败的
    // 不完整json completion

    while (!done) {
      //嘬一口，嘬到了resolve，没嘬到，继续等
      //data：[Done]
      const { value, done: doneReading } = await reader?.read();//reader对象 兼容性，老浏览器不一定支持
      done = doneReading;
      // 除了把本轮的value 要处理之外，之前缓存的value 也要处理
      // 缓存的value 是上一轮的value 本轮的value 是当前轮的value
      // chunk 一小块 json格式
      // delta 增量更新
      // 解析 json 字符串 choices[0].delta.content
      const chunkValue = buffer + decoder.decode(value);
      // console.log(chunkValue);
      // break;
      buffer = '';//上一次的已经拼到这一次来了，buffer 任务完成了
      // json 字符串 按行解析 过滤出 data: 开头的行
      //一次发送一行，也可能发送多行 llm 计算速度和任务
      // data : 开始 又有数据来了
      const lines = chunkValue.split('\n')
        //严谨性 \n 不止一个 也可能多个
        .filter((line) => line.startsWith('data:'));

      for (const line of lines) {
        //data:
        const incoming = line.slice(6);//切掉声明头
        if (incoming === '[Done]') {//流完成
          // 两种情况，一种是在next Token 就设置了done：true
          // 一种是单独的发送一条data：[Done] 文本流
          done = true;
          break;
        }
        //incoming context json 字符串
        try {
          const data = JSON.parse(incoming);
          const delta = data.choices[0].delta.content;
          if (data && delta) {
            content.value += delta;
          }
        } catch (err) {
          // data: 一定要加 没有}结束
          buffer = `data:${incoming}`;
        }
      }
    }
  } else {
    const data = await response.json();
    //只需要修改数据状态，响应式数据会自动更新页面状态
    content.value = data.choices[0].message.content;
  }
}



// const count = ref(0);// 变量 -> 数据（数据绑定）
//  -> 数据状态（响应式数据） -> 页面状态（反应在页面上）
// RefImpl响应式对象，值是count.value
// count.value 改变时候，页面上绑定了count的地方会局部热更新
</script>
<template>
  <div class="container">
    <div>
      <label>输入：</label><input class="input" v-model="question" />
      <button @click="update">提交</button>
    </div>
    <div class="output">
      <div><label>Streaming</label><input type="checkbox" v-model="stream" /></div>
      <div>{{ content }}</div>
    </div>
  </div>
</template>
<style>
.container {
  /* 文档流 是页面布局的基础 */
  /* 从上到下，从左到右，流式布局 */
  /* 每个盒子在文档流中都是有自己的位置和大小 */
  /* 盒模型 */
  /* 开启新的格式化上下文 */
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  height: 100vh;
  font-size: 0.85rem;
  /* 移动端适配，等比例html标签等比例 */
}

.input {
  width: 200px;
}

.output {
  margin-top: 10px;
  min-height: 300px;
  width: 100%;
  text-align: left;
}

button {
  padding: 0 10px;
  margin-left: 6px;
}
</style>
