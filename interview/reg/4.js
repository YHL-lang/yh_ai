const res = "hello-world".replace(
  /-(\w)/, 
  (_,c)=>{  return c.toUpperCase(); }
)
console.log(res); //helloWorld