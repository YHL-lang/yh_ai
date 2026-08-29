// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // 做一次执行，再一次测试 同样的数据，组件一模一样
  // <StrictMode>
  <App />
  // </StrictMode>,
)
