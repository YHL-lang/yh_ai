import { getCompletion } from "./completions.mjs";

// function sleep(ms) {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve();
//     }, ms);
//   });
// }
// => 箭头函数 arrow function
//function
// 参数只有一个,()
//函数体只有一句代码，并且是返回值{}
const sleep = (ms) => new Promise(resolve => setTimeout(() => {
  resolve();
}, ms));

const main = async () => {
  // console.log('-----');
  // await sleep(2000);
  // console.log('-----');
  // const prompt = `
  // 讲一下中文翻译成西班牙语：
  // \`\`\`你好，我想订购一个搅拌机。\`\`\`
  // `
  // const prompt = `
  //   请告诉我以下文本是什么语种: 
  //   \`\`\`Combien coûte le lampadaire?\`\`\`
  //   `
  // const prompt = `
  //   请将以下文本分别翻译成中文、英文、法语和西班牙语
  //   \`\`\`I want to order a basketball.\`\`\`
  //   `
  //语气转换 书面 口语化一些
  // const prompt = `
  //  请将以下文本翻译成中文，分别展示正式语气和口语化语气
  //  \`\`\`Would you like to order a pillow?\`\`\`
  //   `
  const user_messages = [
    "La performance du système est plus lente que d'habitude.",  // System performance is slower than normal         
    "Mi monitor tiene píxeles que no se iluminan.",              // My monitor has pixels that are not lighting
    "Il mio mouse non funziona",                                 // My mouse is not working
    "Mój klawisz Ctrl jest zepsuty",                             // My keyboard has a broken control key
    "我的屏幕在闪烁"                                             // My screen is flashing
  ];
  //通用的翻译器
  for (let message of user_messages) {
    await sleep(2000);
    const prompt = `
    请告诉我以下文本是什么语种，直接输出语种，
    如法语。无需输出标点符号:
    \`\`\`${message}\`\`\`
    `
    const result = await getCompletion(prompt);
    console.log(result, "\n");
    const prompt2 = `
    请将以下文本翻译成中文、英文,并写成
    中文翻译：XXX
    英文翻译：XXX
    的格式
    \`\`\`${message}\`\`\`
    `
    const result2 = await getCompletion(prompt2);
    console.log(result2, "\n");
  }
  // const result = await getCompletion(prompt);
  // console.log(result);
}
main();