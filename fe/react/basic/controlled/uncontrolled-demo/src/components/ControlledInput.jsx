import {
  useState
} from 'react';
// 受控组件（响应式状态控制input）
// 收集用户输入的值
function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <>
      ControlledInput
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  )
}

export default ControlledInput;