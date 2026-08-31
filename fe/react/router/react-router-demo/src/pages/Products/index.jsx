import {
  Outlet // 二级路由出口
} from 'react-router-dom';

function Products() {
  return (
    <>
      <h1>产品列表</h1>
      <Outlet />
    </>
  )
}

export default Products;