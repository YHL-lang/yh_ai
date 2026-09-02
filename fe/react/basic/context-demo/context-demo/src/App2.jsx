import {
  useState
} from 'react'
import { ThemeContext } from './ThemeContext.jsx';
// function App() {
//   return (
//     <>
//       <parent>
//         <Child>
//           <GrandChild>
//             <GreatGrandChild>

//             </GreatGrandChild>
//           </GrandChild>
//         </Child>
//       </parent>
//     </>
//   )
// }
import Page from './components/Page.jsx';

function App() {
  const [theme, setTheme] = useState('light');
  return (
    // 上下文的提供者 容器
    // 并不是需要全局，任何地方作为容器使用 
    // 默认值是 light，可以通过 value 来改变
    <ThemeContext.Provider value={theme}>
      <Page />
      <button onClick={() => setTheme("dark")}>切换主题</button>
    </ThemeContext.Provider>

  )
}

export default App;
