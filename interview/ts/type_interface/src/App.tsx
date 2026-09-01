import './App.css';
import UseCard from './components/UseCard';

function App() {
  return (
    <>
      <UseCard user={{ name: 'yihao', age: 18, avatarUrl: 'https://yihao.com' }} onEdit={() => { }} />
    </>
  )
}

export default App;