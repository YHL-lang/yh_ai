function foo() {
  var a = 1;
  let b = 2;
  {
    // 词法环境里做块级作用域的文章
    let b = 3;
    var c = 4;
    let d = 5;
    console.log(a);
    console.log(b);
  }
  console.log(b);
  console.log(c);
  console.log(d);
}
