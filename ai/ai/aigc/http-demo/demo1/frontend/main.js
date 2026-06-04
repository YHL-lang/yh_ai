let friends = [];

async function loadData() {
  //console.log('loadData');
  // endpoint 
  const endpoint = 'http://localhost:3000/friends';
  // 发送请求  异步的
  //await fetch(endpoint)
  // 等待响应返回
  // 响应体 是 json二进制字符串转换为Json对象
  /*.then(res => res.json())
  .then(data => {
    friends = data;
    console.log(data);
  });*/
  // 异步变同步
  const res = await fetch(endpoint);
  const data = await res.json();
  return data;
}
function renderData(friends) {
  console.log('renderData');
  const oBody = document.querySelector('table tbody');
  if (friends.length > 0) {
    oBody.innerHTML = friends.map(function (friend) {
      console.log(friend);
      return `<tr>
      <td>${friend.id}</td>
      <td>${friend.name}</td>
      <td>${friend.age}</td>
      </tr>`;
    }).join('');
  }
}
async function init() { //异步
  console.log('init start');
  const friends = await loadData();
  console.log(friends);
  renderData(friends);
}
init();
//console.log('init end');