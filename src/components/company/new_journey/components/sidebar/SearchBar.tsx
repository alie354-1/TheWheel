import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

/**
 * SearchBar - Input field for filtering steps with clear button
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search steps...',
  initialValue = ''
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative rounded-md mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-search text-gray-400 text-xs"></i>
      </div>
      <input
        type="text"
        className="block w-full pl-9 pr-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          onClick={clearSearch}
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
