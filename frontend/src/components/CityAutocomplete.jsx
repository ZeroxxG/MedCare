import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
  'Kochi',
  'Lucknow',
  'Surat',
  'Indore',
  'Noida',
  'Gurgaon',
  'Visakhapatnam',
  'New York',
  'London'
];

export const CityAutocomplete = ({ value, onChange, placeholder = "City (e.g. Mumbai)" }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value && value.trim().length > 0) {
      const filtered = CITIES.filter(city =>
        city.toLowerCase().includes(value.toLowerCase().trim())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(CITIES);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cityName) => {
    onChange(cityName);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400 z-10" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none dark:text-white"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1">
          {suggestions.length > 0 ? (
            suggestions.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span>{city}</span>
                <span className="text-[10px] text-slate-400">City</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-slate-400 text-center">No city matches found</div>
          )}
        </div>
      )}
    </div>
  );
};
