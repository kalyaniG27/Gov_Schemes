import React, { useState, useRef, useEffect } from 'react';
import useLanguage from '../hooks/useLanguage';
import { LanguageOption } from '../types';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, languages, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode as any);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', fontFamily: 'sans-serif' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        style={buttonStyles}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isLoading ? '...' : selectedLanguage?.nativeName || currentLanguage}
        <span style={{ marginLeft: '8px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={dropdownStyles}>
          {languages.map((lang: LanguageOption) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                ...dropdownItemStyles,
                backgroundColor: lang.code === currentLanguage ? '#f0f0f0' : 'transparent',
                fontWeight: lang.code === currentLanguage ? 'bold' : 'normal',
              }}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Basic styles - you can move these to a CSS file and use classNames
const buttonStyles: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '8px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
};

const dropdownStyles: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '4px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  zIndex: 10,
  minWidth: '150px',
  display: 'flex',
  flexDirection: 'column',
};

const dropdownItemStyles: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '10px 15px',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
};

export default LanguageSelector;