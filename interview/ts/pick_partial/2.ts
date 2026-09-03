interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

type UserKeys = keyof User;
type KeepKeys = Exclude<UserKeys, "email">;
type MyOmitUser = Pick<User, KeepKeys>;

