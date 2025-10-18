import { useState } from 'react';

const VoiceCallButton = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [message, setMessage] = useState('');

  const handleCall = async () => {
    setIsCalling(true);
    setMessage('Connecting you to an agent...');

    try {
      // Ensure the URL matches the port your server is running on
      const response = await fetch('http://localhost:3001/api/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('An agent will call you shortly. Please wait for the call.');
      } else {
        setMessage(`Error: ${data.message || 'Could not initiate call.'}`);
      }
    } catch (error) {
      console.error('API call failed:', error);
      setMessage('Failed to connect. Please try again later.');
    } finally {
      // Reset the button and message after a delay
      setTimeout(() => {
        setIsCalling(false);
        setMessage('');
      }, 10000); // Reset after 10 seconds
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={handleCall}
        disabled={isCalling}
        className={`
          flex items-center justify-center 
          p-5 rounded-full 
          text-white text-2xl 
          shadow-lg 
          transition-colors duration-300 ease-in-out
          ${isCalling 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }
        `}
        title="Click to get a call from our agent"
      >
        📞 {/* Phone Icon */}
      </button>
      {message && (
        <p className="absolute bottom-20 right-0 w-52 bg-white p-3 rounded-lg shadow-md text-center text-gray-700">
          {message}
        </p>
      )}
    </div>
  );
};

export default VoiceCallButton;