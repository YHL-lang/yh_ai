import { useTheme } from '../hooks/useTheme.js';

function Child() {
  const theme = useTheme();
  console.log(theme);
  return (
    <>
      Child
      <button className={theme}>按钮{theme}</button>
    </>
  )
}

export default Child;