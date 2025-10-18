import React, { useState, useRef } from 'react';
import { Search, Mic, X } from 'lucide-react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { Language } from '../../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  language?: Language;
  className?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search for schemes...',
  language = 'en',
  className = '',
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    language,
    continuous: false,
    interimResults: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setQuery(transcript);
        onSearch(transcript);
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Update query when transcript changes
  React.useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full ${className}`}
    >
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? 'Listening...' : placeholder}
          className={`w-full py-3 pl-10 pr-10 rounded-lg border text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none ${
            isListening ? 'bg-primary/5 border-primary' : 'border-gray-300'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-12 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {browserSupportsSpeechRecognition && (
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`ml-2 p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            isListening
              ? 'bg-primary text-white animate-pulse'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title="Voice Search"
        >
          <Mic size={18} />
        </button>
      )}

      <button
        type="submit"
        className="ml-2 px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;