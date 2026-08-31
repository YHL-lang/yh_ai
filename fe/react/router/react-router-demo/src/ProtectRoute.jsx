import {
  Navigate,
  useLocation
} from 'react-router-dom';



const ProtectRoute = ({ children }) => {
  console.log(children, '----------');
  //拦截请求 鉴权
  // html5 本地存储 域名的沙盒
  const isLogin = localStorage.getItem('isLogin') === 'true';
  console.log(isLogin);
  // 获取 React Router 层面的当前路由 location
  const location = useLocation();

  if (!isLogin) {
    //如果没登录，跳转到登录页面
    // 路由， 设置state 状态对象
    // 从哪里来？
    //location 对象
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return (
    <>
      {children}
    </>
  )
}

export default ProtectRoute;