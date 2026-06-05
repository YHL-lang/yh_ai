function varTest() {
  var x = 1;
  if (true) {
    let x = 2;
    let b = 3;
    console.log(x);
  }
  console.log(b);
  console.log(x);
}
varTest();