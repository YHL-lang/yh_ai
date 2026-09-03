interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}
// 有什么特性，一个类型挑选一些你需要的字段，形式新的类型？
// 负责项目，区分度
// 大型项目类型消费比较多
type UserPreview = Pick<User, 'id' | 'name'>;
const u: UserPreview = {
  id: 1,
  name: 'yihao',
  // age: 18  错误，因为 UserPreview 类型中没有 age 字段
}

// Omit 去掉部分字段
type UserSafe = Omit<User, 'email'>;

const safeUser: UserSafe = {
  id: 1,
  name: 'yihao',
  age: 18,
  // email: 'yihao@example.com', 错误，因为 UserSafe 类型中没有 email 字段
}

// 所有字段全部变成可选
type PartialUser = Partial<User>;
//patch 修改 对象属性好多
const patchUser: PartialUser = {
  id: 1,
  name: 'yihao',
  age: 18,
  email: 'yihao@example.com',
  // sex: 'male', 错误，因为 User 类型中没有 sex 字段
}

const emptyObj: PartialUser = {};
// json key:value Record<键类型,值类型>
type Dict = Record<string, number>;
const obj: Dict = { a: 1, b: 2 }
type ErrorMsgMap = Record<number, string>;
// http status code
//1XX 执行中
//2XX 成功
//3XX 要跳转
//4XX 客户端错误
//5XX 服务器错误
const errorMsgMap: ErrorMsgMap = {
  400: '请求参数错误',
  401: '未授权',
  403: '权限不足，拒绝访问',
  404: '资源找不到',
  500: '服务器内部错误',
}

function getErrMsg(code: number) {
  return errorMsgMap[code] ?? '未知错误';
}

function fn() { return { x: 1, y: 2 } }
type fnReturn = ReturnType<typeof fn>;
// 联合类型
type All = "id" | "name" | "age" | "email";
type AfterExclude = Exclude<All, "email">;
// Omit ？ Exclude 处理联合类型 Omit 处理对象接口