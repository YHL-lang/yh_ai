//接口，传统OOP 核心概念
//抽象
// js 原型式的，函数是一等对象
// ts 大型企业开发强类型语言，类 java 传统的OOP 思路
// class extends implements interface
// 面向接口的编程 父子组件数据接口
interface User {
  name: string;
  age: number;
  avatarUrl: string;
}
interface userCardProps {
  user: User;
  onEdit: (id: number) => void;
}

const UseCard: React.FC<userCardProps> = () => {
  return (
    <>

    </>
  )
}
export default UseCard;
