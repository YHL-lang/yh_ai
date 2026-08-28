import * as React from 'react';
import HelloComponent from './components/Hello';
import NameEditComponent from './components/NameEditComponent';

const App: React.FC = () => {
  const [username, setUsername] = React.useState('yihao');
  // const setUsernameState = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setUsername(event.target.value);
  // }
  return (
    <div>
      <HelloComponent userName={username} />
      <NameEditComponent
        initialUserName={username}
        onNameUpdated={setUsername}
      />
    </div>
  )
}

export default App;