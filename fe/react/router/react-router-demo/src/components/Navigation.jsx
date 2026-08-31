// a 标签点击后跳转不加 #/ 前缀，二次处理
// 不直接用 a 标签，react-router-dom 提供了靠谱的 Link 组件
// 适合SPA 路由跳转的组件功能
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/user/123">小家</Link></li>
        <li><Link to="/products/123">产品详情</Link></li>
        <li><Link to="/products/new">产品新增</Link></li>
        <li><Link to="/pay">支付</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation