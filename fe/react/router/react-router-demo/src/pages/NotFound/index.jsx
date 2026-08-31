import {
  useEffect
} from 'react';
import {
  useNavigate // 负责路由的跳转
} from 'react-router-dom';

const NotFound = () => {
  let navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      // / 就是首页 href 是 超链接
      // window.location.href = '/';
      navigate('/');
    }, 3000)
  }, [])
  return (
    <>
      Not Found
    </>
  )
}

export default NotFound;