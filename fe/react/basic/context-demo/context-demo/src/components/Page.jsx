import Child from './Child.jsx';
import {
  useTheme
} from '../hooks/useTheme.js'
import { use } from 'react';

const Page = () => {
  const theme = useTheme();
  console.log(theme);
  return (
    <>
      Page{theme}
      <br />
      <Child />
    </>
  )
}

export default Page;
