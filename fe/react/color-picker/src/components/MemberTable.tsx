import * as React from 'react';
import { type MemberEntity } from '../model/member';
import { getMembersCollection } from '../api/memberApi';

interface MemberRowProps {
  member: MemberEntity;
}

const MemberRow = (props: MemberRowProps) => {
  const { member } = props;
  return (
    <tr>
      <td>
        <img src={member.avatar_url} style={{ maxWidth: '10rem' }} />
      </td>
      <td>
        <span>{member.id}</span>
      </td>
      <td>
        <span>{member.login}</span>
      </td>
    </tr>
  )
}

const MemberTable: React.FC = () => {
  const [memberCollection, setMemberCollection] = React.useState<MemberEntity[]>([
    // {
    //   id: 1,
    //   avatar_url: 'https://p9-passport.byteacctimg.com/img/user-avatar/fbf71504d3f8dd86ed3659dfe2ea8de2~200x200.awebp',
    //   login: 'yihao'
    // },
    // {
    //   id: 2,
    //   avatar_url: 'https://p9-passport.byteacctimg.com/img/user-avatar/fbf71504d3f8dd86ed3659dfe2ea8de2~200x200.awebp',
    //   login: '阿杰'
    // }

  ]);
  React.useEffect(() => {
    // 挂载后请求接口 不会影响组件的渲染
    (async () => {
      const members = await getMembersCollection();
      setMemberCollection(members);
    })()
  }, [])
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Id</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {
            memberCollection.map((member: MemberEntity) => (
              <MemberRow key={member.id} member={member} />
            ))
          }
        </tbody>
      </table>
    </>
  )
}

export default MemberTable;