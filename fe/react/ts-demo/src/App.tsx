import * as React from 'react';
import HelloComponent from './components/Hello';
import NameEditComponent from './components/NameEditingComponent';

// 写js 一样写ts
const App = () => {
  const [name, setName] = React.useState<string>('defaultUserName');
  const [editingName, setEditingName] = React.useState("defaultUserNameEditing");

  const loadUserName = () => {
    setTimeout(() => {
      setName("name from async call");
      setEditingName("name from async call");
    }, 2000)
  }
  // 副作用：在组件挂载时调用，加载用户信息
  React.useEffect(() => {
    // 组件挂载后
    // 组件第一要素是赶快显示出来，让用户觉得快
    loadUserName();
  }, []);

  const setUserNameState = () => {
    setName(editingName);
  }
  return (
    <>
      名字：{name}
      <HelloComponent userName={name} />
      <NameEditComponent
        editingName={editingName}
        onNameUpdated={setUserNameState}
        onEditingNameUpdated={setEditingName}
        disabled={editingName === "" || editingName === name} />
    </>
  )
}
export default App;