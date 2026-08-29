import { useState } from "react";
import ColorBrowser from "./components/ColorBrowser";
import { type Color } from "./model/color";
import ColorPicker from "./components/ColorPicker.tsx";
import MemberTable from "./components/MemberTable.tsx";




function App() {
  // ts 适合大型项目开发，代码量大，成员多
  const [color, setColor] = useState<Color>({
    red: 20,
    green: 40,
    blue: 180
  })
  return (
    <>
      <ColorBrowser color={color} />
      <ColorPicker color={color} onColorUpdate={setColor} />
      <MemberTable />
    </>
  )
}

export default App;