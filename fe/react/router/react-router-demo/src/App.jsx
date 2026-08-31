import {
  lazy,
  Suspense
} from 'react'
import {
  // location.hash
  // 前端路由有两种，HashRouter 老的 和 BrowserRouter html5 history
  BrowserRouter as Router,
  // HashRouter as Router, // 前端路由 #/ hashchange
  Routes, // 路由配置数组，都是组件
  Route, // 路由配置项，包含 path、element 等属性
  Navigate, // 路由跳转组件
} from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
// SPA，动态切换多个页面
// 下载 ，执行 影响首页加载速度
// 只需要加载当前页面就好，路由懒加载
// import Home from './pages/Home/index.jsx';
// import About from './pages/About/index.jsx';
// 变成import 函数
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/Products/Detail'));
const NewProduct = lazy(() => import('./pages/Products/New'));
const Login = lazy(() => import('./pages/Login'));
const Pay = lazy(() => import('./pages/Pay'));
const ProtectRoute = lazy(() => import('./ProtectRoute'));



const App = () => {
  return (
    <>
      {/* {前端路由接管一切} */}
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
          {/* {导航栏组件} */}
          <div id='container'>
            {/* { 动态页面切换部分 既是配置，又是出现的地方} */}
            <Routes>
              {/* 有且只有一个Route 显示，当前location.hash 对应页面级别组件 */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/user/:id" element={<UserProfile />} />
              {/* {多级路由,路由嵌套} */}
              <Route path='/products' element={<Products />} >
                {/* { 二级路由 */}
                <Route path=':productId' element={<ProductDetail />} />
                <Route path='new' element={<NewProduct />} />
              </Route>
              {/* 有个活动/game 100万  /result 活动结束了
              /home 首页，重定向到/
              /user/:id 登录？没登录 送到/login 页面  登录 送到/user/:id 页面 */}
              <Route path='/old-path' element={<Navigate replace to="/new-path" />} />
              <Route path='/login' element={<Login />} />
              <Route path='/pay' element={
                // 门禁安保
                //pay 要进的房间
                // children 用来定制化组件
                <ProtectRoute>
                  {/* {children} */}
                  <Pay />
                </ProtectRoute>
              } />
              {/* * 贪婪匹配所有，最后404兜底 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </Router >
    </>
  )
}

export default App;