import { useParams } from 'react-router-dom';

function UserProfile() {
  // params? 动态路由参数
  // hooks 思想,召之即来
  let { id } = useParams();
  console.log(id);
  return (
    <>
      <h2>UserProfile: {id}</h2>
    </>
  )
}

export default UserProfile;