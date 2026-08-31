import {
  useEffect,
  useRef,
  useState
} from 'react';

function App() {
  console.log('main thread');
  // 为组件的渲染 挂载让路
  const workerRef = useRef(null)// 可持久化的可变对象
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    //开启一个worker线程 开销比较大
    //ref 引用了worker线程
    workerRef.current = new Worker(
      new URL('./worker.js', import.meta.url)
    );
    // 监听worker 线程的消息
    workerRef.current.onmessage = (e) => {
      console.log('收到 worker 消息:', e.data);
      setLoading(false);
      setResult(e.data);
      const { result } = e.data;
      setResult(result);
    };
    return () => {
      // 组件卸载时，销毁worker线程
      workerRef.current.terminate();
      workerRef.current = null; //手动回收
    }
  }, [])
  // 模拟一个耗时的任务 主线程 单线程 worker
  // 离开主线程？别的语言，开辟新线程
  // console.time('主线程')
  // for (let i = 0; i < 100000000; i++) {
  //   console.log(i);
  // }//会卡死页面
  // console.timeEnd('主线程')
  // 阻塞页面
  const startHeavyCalc = () => {
    setLoading(true);
    // 消息机制
    // 给worker 线程发送一条工作指令，带上参数
    workerRef.current.postMessage({
      num: 88
    })
  }
  return (
    <div style={{ padding: "30px" }}>
      <h2>useRef + WebWorker 耗时运算</h2>
      <p>开启web worker 线程，执行5亿次循环，结束后通知主线程</p>
      <button
        onClick={startHeavyCalc}
        disabled={loading}
      >{loading ? "正在计算..." : "启动繁重计算任务"}</button>
      {result && <h3>计算结果: {result}</h3>}
    </div>
  )
}

export default App;
