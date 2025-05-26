import React from 'react';
const FormInput = ({ label, name, type = "text", value, onChange }) => (
  <div className="mb-4">
    <label className="block font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border px-3 py-2 rounded-md"
      required
    />
  </div>
);
export default FormInput;
