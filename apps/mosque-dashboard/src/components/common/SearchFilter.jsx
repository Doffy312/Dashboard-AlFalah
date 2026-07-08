import React from 'react';
import { Search } from 'lucide-react';

const SearchFilter = ({ placeholder = "Cari...", value, onChange, filters, onFilterChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-sm w-full mb-lg">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-sm pointer-events-none">
          <Search size={18} className="text-on-surface-variant/70" />
        </div>
        <input
          type="text"
          className="w-full pl-xl pr-sm py-[10px] bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder-on-surface-variant/50 transition-all font-body-md"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      
      {filters && filters.length > 0 && (
        <div className="flex gap-sm shrink-0 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {filters.map((filter, index) => (
            <select
              key={index}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-sm py-[10px] bg-surface-variant border border-outline rounded-xl outline-none focus:border-primary text-on-surface font-body-md min-w-[120px] appearance-none cursor-pointer pr-10"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto' }}
            >
              {filter.options.map((opt, i) => (
                <option key={i} value={opt.value} className="bg-surface dark:bg-on-surface">
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
