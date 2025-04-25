import { useState } from 'react';

function MyToggle() {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => {
    setIsOn((prev) => !prev);
  };

  return (
    <button onClick={toggle}>
      {isOn ? 'On' : 'Off'}
    </button>
  );
}

export default MyToggle;
