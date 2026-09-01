interface User {
  name: string;
  age: number;
  avatarUrl: string;
}
type UserType = {
  name: string;
  age: number;
  avatarUrl: string;
}

const u1: User = {
  name: 'yihao',
  age: 18,
  avatarUrl: 'https://yihao.com',
}

const u2: UserType = {
  name: 'zhangsan',
  age: 20,
  avatarUrl: 'https://zhangsan.com',
}

interface Person {
  name: string;
}
//不从0开始，继承Person
interface Employee extends Person {
  job: string;
}

//类型别名
type PersonType = {
  name: string;
}
type EmployeeType = PersonType & {
  job: string;
}
const e1: EmployeeType = {
  name: 'yihao',
  job: '字节跳动Agent开发工程师',
}
const e2: EmployeeType = {
  name: 'yihao',
  job: '大厂苗子',
}