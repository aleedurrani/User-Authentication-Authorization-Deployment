import React from 'react';

const SearchBar = ({ placeholder, value, onChange }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={onChange}
    />
  );
};

export default SearchBar;