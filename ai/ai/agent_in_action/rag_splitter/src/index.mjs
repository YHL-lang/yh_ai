import "dotenv/config";
import "cheerio";
//从url 加载文档
import {
  CheerioWebBaseLoader
} from '@langchain/community/document_loaders/web/cheerio'
import {
  // 递归字符文本分割器
  RecursiveCharacterTextSplitter
} from '@langchain/textsplitters'
// 访问网址 并提取文档内容
// cheerio 可以传递css 选择器 来提取文档内容 缩小范围
// 爬取指定内容 + document标准
const cheerioLoader = new CheerioWebBaseLoader(
  'https://juejin.cn/post/7660707431753678854',
  {
    selector: '.main-area p' // 文章段落
  }
)
// 大的document 分成小的document  更加精细的去处理语义
// 按段落划分？ 语义分段，段落太长，段落太短？
// 目的是语义精确，重点
//句子。！？适合 ，不适合
//chunk 大小 400 字符
const documents = await cheerioLoader.load();
// console.log(documents)
//切片
//语义第一位
// 按大小来切割，chunksize 就够了
//为了语义完整。少一点
//递归 尝试不同分隔符，找到最优的分隔符，切分出语义完整的chunk
//切接近chunksize
//不完美的地方，直接硬切 chunkoverlap来补救 重叠
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,// 每个chunk 大小 document，切片 chunk
  separators: ['。', '！', '？'],
  chunkOverlap: 100,
})

const splitDocuments = await textSplitter.splitDocuments(documents);
console.log(splitDocuments);
