import {
  useState
} from 'react';
import './index.css';

function LoginForm() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  })
  const [errors, setErrors] = useState({})
  const validate = (name, value) => {
    let msg = "";
    if (name === 'username') {
      if (!value) {
        msg = '用户名为空'
      } else if (value.length < 3) {
        msg = '用户名长度不能小于3'
      }
    }
    if (name === 'password') {
      if (!value) {
        msg = '密码不能为空'
      } else if (value.length < 6) {
        msg = '密码长度不能小于6位'
      }
    }
    setErrors(prev => ({
      ...prev,
      [name]: msg
    }))
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    })
    validate(name, value);
  }

  const isValid = form.username && form.password &&
    !errors.username && !errors.password

  const handleSubmit = e => {
    e.preventDefault();
    if (!isValid) return;
    console.log(form, '----------');
  }

  return (
    <>
      LoginForm
    </>
  )
}
export default LoginForm