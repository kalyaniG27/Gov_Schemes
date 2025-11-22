

// src/components/FloatingVoiceButton.tsx
import React, { useState } from "react";
import { Mic, Square } from "lucide-react";
import useLanguage from "../hooks/useLanguage";
import { speakText } from "../utils/textToSpeech";
import { useNavigate } from "react-router-dom";

const FloatingVoiceButton: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const getLangCode = () => {
    switch (currentLanguage) {
      case "hi": return "hi-IN";
      case "mr": return "mr-IN";
      case "bn": return "bn-IN";
      case "ta": return "ta-IN";
      case "te": return "te-IN";
      case "en":
      default:
        return "en-IN";
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getLangCode();
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = async (event: any) => {
      const voiceText = event.results[0][0].transcript;
      console.log("🎤 You said:", voiceText);

       // Try automatic language detection
        const detectedLang = /[अ-ह]/.test(voiceText) ? "hi" :
                       /[ऍ-ॡ]/.test(voiceText) ? "mr" :
                       /[అ-హ]/.test(voiceText) ? "te" :
                       /[அ-ஹ]/.test(voiceText) ? "ta" :
                       /[অ-ঔ]/.test(voiceText) ? "bn" :
                       "en";

        console.log("🌐 Detected language:", detectedLang);

      try {
        const res = await fetch("/api/voice-query", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: voiceText, language: currentLanguage }),
        });

        const data = await res.json();
        console.log("🤖 Backend response:", data);

        // 🔊 Speak returned answer
        console.log("🔊 Calling speakText...");
        speakText(data.answer, detectedLang);

        // 🔀 Redirect after speaking audio
        if (data.matchedCategory) {
          console.log("📍 Redirecting to:", `/schemes?category=${data.matchedCategory}`);

          setTimeout(() => {
            navigate(`/schemes?category=${data.matchedCategory}`);
          }, 3500); // Wait so user can hear voice
        }

      } catch (error) {
        console.error("❌ Voice backend error:", error);
      } finally {
        setListening(false);
      }
    };

    recognition.onerror = (err: any) => {
      console.error("❌ Speech recognition error:", err);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      className="fixed bottom-6 right-6 z-50"
      aria-label="Voice Assistant"
    >
      <div className="relative w-16 h-16">
        {listening && (
          <>
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
            <span className="absolute inset-1 rounded-full bg-blue-500/40 animate-ping [animation-delay:150ms]" />
            <span className="absolute inset-2 rounded-full bg-blue-500/50 animate-ping [animation-delay:300ms]" />
          </>
        )}

        <div
          className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300
          ${listening ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {listening ? (
            <Square size={26} className="text-white" />
          ) : (
            <Mic size={26} className="text-white" />
          )}
        </div>
      </div>
    </button>
  );
};

export default FloatingVoiceButton;     