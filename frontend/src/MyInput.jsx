import { useState } from 'react';

function MyInput({ label }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const inputId = "my-input"; // Give the input a unique id

  return (
    <div>
      <label htmlFor={inputId}>{label}</label> {/* Associate the label with the input */}
      <input id={inputId} value={value} onChange={handleChange} />
    </div>
  );
}

export default MyInput;
