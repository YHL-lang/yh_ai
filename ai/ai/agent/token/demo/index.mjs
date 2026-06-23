import { getEncoding } from "js-tiktoken";
// decode 解码token为文本
// ()里cl100k_base gpt 官方的token编码器
// utf-8 编码
const enc = getEncoding("cl100k_base"); //utf-8 gbk 等编码
const text = "Hello, tiktoken! 你好，世界！";
//llm encode 编码器
const tokens = enc.encode(text);
// console.log("Token IDs:", tokens, tokens.length);
const decodedText = enc.decode(tokens);
console.log("Decoded Text:", decodedText);