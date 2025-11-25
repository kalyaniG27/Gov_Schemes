import React, { useEffect, useState, useCallback } from 'react';
import { checkEligibility } from '../utils/eligibilityChecker';
import { loadTranslations } from '../utils/translations';
import type { Scheme, Language, User } from '../types';

const synth: SpeechSynthesis = window.speechSynthesis;

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type UserInput = {
  age: number | null;
  gender: string | null;
  income: number | null;
}

type VoiceInteractionProps = {
  schemes: Scheme[];
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ schemes }) => {
  const [language] = useState<Language>('mr');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<'welcome' | 'askAge' | 'askGender' | 'askIncome' | 'result' | 'finished'>('welcome');
  const [userData, setUserData] = useState<UserInput>({ age: null, gender: null, income: null });
  const [message, setMessage] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Load translations
  useEffect(() => {
    async function fetchTranslations() {
      const trans = await loadTranslations(language);
      setTranslations(trans);
    }
    fetchTranslations();
  }, [language]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setMessage('Speech Recognition not supported in your browser.');
      return;
    }
    const recog = new SpeechRecognitionClass();
    recog.lang = 'mr-IN';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    setRecognition(recog);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synth) {
      setMessage('Speech Synthesis not supported in your browser.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'mr-IN';
    if (onEnd) utterance.onend = onEnd;
    synth.speak(utterance);
  }, []);

  const startRecognition = useCallback(() => {
    if (!recognition) return;
    recognition.start();
  }, [recognition]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      handleUserResponse(speechResult);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onerror = (event: any) => {
      setMessage('Error recognizing speech, कृपया पुन्हा प्रयत्न करा');
      speak('क्षमा करा, मी आपले उत्तर ऐकू शकले नाही, कृपया पुनः प्रयत्न करा', () => {
        askCurrentQuestion();
      });
    };

  }, [recognition]);

  const askCurrentQuestion = useCallback(() => {
    switch(stage) {
      case 'askAge':
        speak(`${translations['form.age'] || 'आयु'} किती आहे?`, () => startRecognition());
        break;
      case 'askGender':
        speak(`तुमचा ${translations['form.gender'] || 'लिंग'} काय आहे? पुरुष, स्त्री, किंवा इतर?`, () => startRecognition());
        break;
      case 'askIncome':
        speak(`${translations['form.income'] || 'वार्षिक उत्पन्न'} किती आहे? कृपया अंकात सांगा.`, () => startRecognition());
        break;
      case 'result':
        if (userData.age === null || userData.gender === null || userData.income === null) {
          speak('माहिती अपूर्ण आहे, कृपया पुन्हा प्रयत्न करा.', () => setStage('finished'));
          return;
        }
        const user: Partial<User> = {
          age: userData.age,
          gender: userData.gender,
          income: userData.income,
        };
        const eligibleSchemes = schemes.filter((scheme: Scheme) => {
          const result = checkEligibility(user as User, scheme);
          return result.eligible;
        });
        const msg = eligibleSchemes.length > 0 
          ? `आपण खालील योजना साठी पात्र आहात: ${eligibleSchemes.map(s => s.title).join(', ')}` 
          : 'क्षमा करा, आपल्यासाठी पात्र योजना सापडल्या नाहीत.';
        speak(msg, () => setStage('finished'));
        setMessage(msg);
        break;
      default:
        break;
    }
  }, [stage, userData, translations, schemes, speak, startRecognition]);

  const handleUserResponse = (response: string) => {
    setMessage(`आपले उत्तर: ${response}`);
    if (stage === 'askAge') {
      const ageNum = parseInt(response);
      if (!isNaN(ageNum) && ageNum > 0 && ageNum < 120) {
        setUserData(prev => ({ ...prev, age: ageNum }));
        setStage('askGender');
      } else {
        speak('कृपया वैध वय सांगा.', () => askCurrentQuestion());
      }
    } else if (stage === 'askGender') {
      const g = response.toLowerCase();
      if (g.includes('पुरुष') || g.includes('male')) {
        setUserData(prev => ({ ...prev, gender: 'male' }));
        setStage('askIncome');
      } else if (g.includes('स्त्री') || g.includes('female')) {
        setUserData(prev => ({ ...prev, gender: 'female' }));
        setStage('askIncome');
      } else if (g.includes('इतर') || g.includes('other')) {
        setUserData(prev => ({ ...prev, gender: 'other' }));
        setStage('askIncome');
      } else {
        speak('कृपया पुरुष, स्त्री किंवा इतर पैकी एक सांगा.', () => askCurrentQuestion());
      }
    } else if (stage === 'askIncome') {
      const incomeNum = parseFloat(response.replace(/[^\d\.]/g, ''));
      if (!isNaN(incomeNum) && incomeNum >= 0) {
        setUserData(prev => ({ ...prev, income: incomeNum }));
        setStage('result');
      } else {
        speak('कृपया वैध उत्पन्न सांगा.', () => askCurrentQuestion());
      }
    }
  };

  useEffect(() => {
    if (stage === 'welcome') {
      const welcomeText = 'नमस्कार, आपले जन समर्थन मध्ये स्वागत आहे. चला तुमची पात्रता तपासूया.';
      speak(welcomeText, () => setStage('askAge'));
    } else if (stage === 'askAge' || stage === 'askGender' || stage === 'askIncome') {
      askCurrentQuestion();
    }
  }, [stage, askCurrentQuestion, speak]);

  return (
    <div className="voice-interaction">
      <h2>वॉयस संवाद</h2>
      <p>{message}</p>
      {stage === 'finished' && <p>धन्यवाद! आपल्याला आणखी मदतीची गरज असल्यास, कृपया पुन्हा कॉल करा.</p>}
    </div>
  );
};

export default VoiceInteraction;
