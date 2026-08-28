import * as React from 'react';
//自定义类型和接口
interface Props {
  editingName: string;
  onNameUpdated: () => void;
  onEditingNameUpdated: (newEditingName: string) => void;
  disabled?: boolean;
}

const NameEditingComponent: React.FC<Props> = (props) => {
  const {
    editingName,
    onNameUpdated,
    onEditingNameUpdated,
    disabled,
  } = props;
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEditingNameUpdated(e.target.value);
  }
  const onNameSubmit = () => {
    onNameUpdated();
  }
  return (
    <>
      <label >Update name:</label>
      <input
        value={editingName}
        onChange={onChange}
      />
      <button
        disabled={disabled}
        onClick={onNameSubmit}
      >Change</button>
    </>
  )
}

export default NameEditingComponent;
