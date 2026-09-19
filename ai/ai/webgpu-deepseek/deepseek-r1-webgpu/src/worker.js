import {
  AutoTokenizer, // 分词器
  AutoModelForCausalLM, // 因果语言模型
  TextStreamer,// 文本流式输出
  InterruptableStoppingCriteria,// 中断 停止条件 设置一个条件，每一次预测以一个token
  // 检测这个值 是否是停止条件
} from "@huggingface/transformers";
/**
 * This class uses the Singleton pattern to enable lazy-loading of the pipeline
 */
// pipeline 流水线 文本生成
// 分词器 大模型 配置文件
class TextGenerationPipeline {
  static model_id = "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX";
  // 单例模式 llm 只要初始化一次，后面可以一直用，实例化耗性能，单例管理
  static async getInstance(progress_callback = null) {
    // 分词器                           预训练
    // transformer.js 提供的AutoTokenizer 分词器
    // 适配 DeepSeek-R1-Distill-Qwen-1.5B-ONNX
    // 下载
    // 下载进度更新
    // tokenizer model 等需要异步的下载并执行
    this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
      // 下载进度更新 回调函数
      progress_callback,
    });
    // 加载模型文件
    this.model ??= AutoModelForCausalLM.from_pretrained(this.model_id, {
      // 算力优化
      dtype: "q4f16",
      device: "webgpu",
      progress_callback,
    });
    console.log(this.tokenizer, '/////////');
    return Promise.all([this.tokenizer, this.model]);
  }
}
// 可被外部中断 的停止条件实例
const stopping_criteria = new InterruptableStoppingCriteria();
// 缓存上一次生成的token 值缓存 每次对话都会进行KV 注意力计算 大量的算力消耗
// message 数组 添加上一条，缓存之前的计算，跳过，避免重复计算
let past_key_values_cache = null;

async function generate(messages) {
  console.log(messages, '---------');
  const [tokenizer, model] = await TextGenerationPipeline.getInstance();
  // 分词器 对消息进行编码
  // 按照相应大模型的模板 llm 模板
  // deepseek 训练时特定的模板
  // <|im_start>user
  //  content<|im_end> json 数组-> 字符串
  const inputs = tokenizer.apply_chat_template(messages, {
    // 会在拼接好的末尾自动追加<|im_start> assistant\n
    // 续写回答
    add_generation_prompt: true,
    return_dict: true,
  });
  console.log(inputs, 'token id');

  // 编码 思考 模板 生成是两部分
  // 思考推理部分 + 生成推理部分 + 结束推理部分
  // contents 正式内容
  const [START_THINKING_TOKEN_ID, END_THINKING_TOKEN_ID] = tokenizer.encode(
    "<think></think>",
    { add_special_tokens: false },
  );

  let state = "thinking"; // 'thinking' or 'answering'
  let startTime; // 开始时间
  let numTokens = 0; // 生成的token 数
  let tps;// 每秒生成多少token？ token/秒 性能指标

  const token_callback_function = (tokens) => {
    // js 性能优化API
    startTime ??= performance.now();

    if (numTokens++ > 0) {
      tps = (numTokens / (performance.now() - startTime)) * 1000;
    }
    if (tokens[0] == END_THINKING_TOKEN_ID) {
      state = "answering";
    }
  }

  const callback_function = (output) => {
    self.postMessage({
      status: "update",
      output,
      tps,
      numTokens,
      state,
    });
  }

  // 文本流式输出
  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  });

  // Tell the main thread we are starting
  self.postMessage({ status: "start" });

  const { past_key_values, sequences } = await model.generate({
    // 先手动Token Ids
    ...inputs,
    // past_key_values: past_key_values_cache,
    do_sample: false,
    // repetition_penalty: 1.1,
    // top_k: 3,
    // temperature: 0.2,

    max_new_tokens: 2048,
    streamer,
    stopping_criteria,
    return_dict_in_generate: true,
  });

  past_key_values_cache = past_key_values;

  const decoded = tokenizer.batch_decode(sequences, {
    skip_special_tokens: true,
  });

  // Send the output back to the main thread
  self.postMessage({
    status: "complete",
    output: decoded,
  });
}

/**
 * Helper function to perform feature detection for WebGPU
 */
// let fp16_supported = false;
// 不能DOM
async function check() {
  try {
    // 检查WebGPU是否支持
    // window 
    // DOM Document Object Model 文档对象模型
    // BOM Browser Object Model 浏览器对象模型 navigator
    // adapter 是 GPU 适配器的抽象，
    // 后续所有 WebGPU 计算/渲染操作都通过 device 执行
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      // 抛出错误
      throw new Error("WebGPU is not supported (no adapter found)");
    }
    // fp16_supported = adapter.features.has("shader-f16")
  } catch (e) {
    self.postMessage({
      status: "error",
      data: e.toString(),
    });
  }
}

async function load() {
  self.postMessage({
    status: "loading",
    data: "Loading model...",
  });
  // Load the pipeline and save it for future use.
  const [tokenizer, model] = await TextGenerationPipeline.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    console.log(x, '/////////////');
    self.postMessage(x);
  });
  self.postMessage({
    status: "loading",
    data: "Compiling shaders and warming up model...",
  });

  // Run model with dummy input to compile shaders
  const inputs = tokenizer("a");
  console.log(inputs);
  await model.generate({ ...inputs, max_new_tokens: 1 });
  self.postMessage({ status: "ready" });

}

// 事件监听
self.addEventListener("message", async (e) => {
  const { type, data } = e.data;

  switch (type) {
    // 检查WebGPU是否支持
    case "check":
      check();
      break;
    // 加载模型
    case "load":
      load();
      break;
    // 生成文本
    case "generate":
      stopping_criteria.reset();
      generate(data);
      break;
    // 中断生成
    case "interrupt":
      // interrupt 设置为 true，llm 实例的属性，每次生成token 检测
      stopping_criteria.interrupt();
      break;
    // 重置模型
    case "reset":
      // 清空缓存
      past_key_values_cache = null;
      stopping_criteria.reset();
      break;
  }
})
