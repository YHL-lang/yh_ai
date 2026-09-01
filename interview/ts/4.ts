interface AddFn {
  (a: number, b: number): number;
}
const add1: AddFn = (x, y) => x + y;
add1(1, 2);

type AddFnType = (a: number, b: number) => number;
const add2: AddFnType = (x, y) => x + y;
add2(1, 2);
