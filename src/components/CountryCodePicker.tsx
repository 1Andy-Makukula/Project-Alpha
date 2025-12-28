
import React, { useState } from 'react';

const countries = [
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
];

interface CountryCodePickerProps {
  onPhoneNumberChange: (phoneNumber: string) => void;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({ onPhoneNumberChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onPhoneNumberChange(`${country.code}${phoneNumber}`);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    onPhoneNumberChange(`${selectedCountry.code}${e.target.value}`);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          type="button"
          className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-kithly-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedCountry.flag}</span>
          <span className="ml-2">{selectedCountry.code}</span>
        </button>
      </div>
      <input
        type="tel"
        placeholder="Phone"
        required
        className="block w-full pl-24 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-kithly-primary focus:border-kithly-primary bg-white"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
          <ul>
            {countries.map((country) => (
              <li
                key={country.code}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleCountrySelect(country)}
              >
                <span>{country.flag}</span>
                <span className="ml-2">{country.name} ({country.code})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountryCodePicker;
