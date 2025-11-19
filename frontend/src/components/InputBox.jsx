import React from 'react';

function InputBox({ value, onChange, placeholder = "Enter your thoughts here..." }) {
  return (
    <div className="input-container">
      <textarea
        className="input-box"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default InputBox;

