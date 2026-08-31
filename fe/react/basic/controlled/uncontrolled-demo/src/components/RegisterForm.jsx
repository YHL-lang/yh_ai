import {
  useState
} from 'react';

function RegisterForm() {
  // 非受控两次useRef
  // vue ref 简单数据类型/reactive 对象 两种响应式API
  const [form, setForm] = useState({
    username: '',
    password: ''
  })
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }
  return (
    <div>
      <input
        name='username'
        value={form.username}
        onChange={handleChange}
        placeholder='请输入用户名'
        type='text'
      />
      <button type='submit' onClick={handleChange}>提交</button>
    </div>
  )
}

export default RegisterForm;
