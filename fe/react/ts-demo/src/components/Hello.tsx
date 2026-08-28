import * as React from 'react';
//props 需要满足的接口约束
interface Props {
  userName: string
}
// type Props = {
//   username: string;
// } // 类型别名两者都可以实现接口约束

const HelloComponent: React.FC<Props> = (props) => {
  return (
    <h2>Hello {props.userName}</h2>
  )
}

export default HelloComponent;

