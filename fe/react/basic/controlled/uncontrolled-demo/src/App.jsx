import {
  ControlledInput,
  UncontrolledInput,
  CommentBox,
  RegisterForm,
  LoginForm
}
  from './components';
// import ControlledInput from './components/ControlledInput';
// import UncontrolledInput from './components/unControlldeInput';
// import CommentBox from './components/CommentBox';
// import RegisterForm from './components/RegisterForm';
// import LoginForm from './components/LoginForm';



function App() {
  return (
    <>
      <ControlledInput />
      <UncontrolledInput />
      <CommentBox />
      <RegisterForm />
      <LoginForm />
    </>
  )
}

export default App;