// useRef
import {
  useRef
} from 'react';

function UncontrolledInput() {
  const inputRef = useRef(null);
  const handleClick = () => {
    console.log(inputRef.current.value);
  }
  return (
    <>
      UncontrolledInput
      <input
        type="text"
        ref={inputRef}
      />
      <button onClick={handleClick}>获取输入值</button>
    </>
  )
}

export default UncontrolledInput;