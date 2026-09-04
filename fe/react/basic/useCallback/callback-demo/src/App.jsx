import {
  useState,
  memo
} from 'react';

function RegularChild({ name }) {
  console.log(' 渲染了RegularChild');
  return (
    <>
      <h1>当前姓名：{name}</h1>
    </>
  )
}

const MemoChild = memo(({ name }) => {
  console.log(' 渲染了MemoChild');
  return (
    <div>Hello,{name}</div>
  )
});

function App() {
  const [count, setCount] = useState(0);
  console.log('APP 渲染');
  const [name, setName] = useState('少林队');
  return (
    <>
      <button onClick={() => setCount(count + 1)}>点击计数{count}</button>
      <button onClick={() => setName("峨眉队")}>改变姓名</button>
      <RegularChild name={name} />
      <MemoChild name={name} />
    </>
  )
}

export default App;