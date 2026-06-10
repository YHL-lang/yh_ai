const queue = [];//空的队列
queue.push("东北大板");
queue.push("可爱多");
queue.push("冰工厂");
queue.push("巧乐兹");
while (queue.length) {
  const front = queue[0];//队头元素
  console.log(`取出来的是`, front);
  queue.shift();//出队
}
console.log(queue);//空队列[]