function analyzeQuery(text, language) {
  const lower = text.toLowerCase();

  // Multi-language keyword mapping
  const keywords = {
    farmers: [
      // English
      "farmer", "agriculture", "crop", "kisan",
      // Hindi
      "किसान", "कृषक",
      // Marathi
      "शेतकरी",
      // Bengali
      "কৃষক", "চাষী",
      // Telugu
      "రైతు",
      // Tamil
      "விவசாயி"
    ],

    students: [
      "student", "scholarship", "education", "study",
      "छात्र", "विद्यार्थी", "शिष्यवृत्ती",
      "ছাত্র", "শিক্ষা",
      "విద్యార్థి",
      "மாணவர்"
    ],

    women: [
      "women", "girl", "female", "ladies",
      "mahila", "महिला", "स्त्री",
      "মহিলা",
      "స్త్రీలు",
      "பெண்கள்"
    ]
  };

  let matchedCategory = null;

  // Check match
  Object.keys(keywords).forEach((category) => {
    if (keywords[category].some((word) => lower.includes(word))) {
      matchedCategory = category;
    }
  });

  // Default response
  let answer = "";

  // Format language wise responses
  const responses = {
    farmers: {
      hi: "किसानों के लिए पीएम किसान, फसल बीमा और मृदा स्वास्थ्य कार्ड जैसी योजनाएँ उपलब्ध हैं।",
      mr: "शेतकऱ्यांसाठी पीएम किसान, पीक विमा और मृदा आरोग्य कार्ड सारख्या योजना उपलब्ध आहेत.",
      bn: "কৃষকদের জন্য পিএম-কিষাণ, ফসল বীমা এবং মাটি স্বাস্থ্য কার্ডের মতো পরিকল্পনা রয়েছে।",
      te: "రైతుల కోసం పీఎం కిసాన్ మరియు పంట బీమా వంటి పథకాలు అందుబాటులో ఉన్నాయి.",
      ta: "விவசாயிகளுக்காக பிஎம்-கிசான் மற்றும் பயிர் காப்பீடு திட்டங்கள் கிடைக்கின்றன.",
      en: "Schemes for farmers such as PM-Kisan & crop insurance are available."
    },

    students: {
      hi: "छात्रों के लिए कई छात्रवृत्ति योजनाएं उपलब्ध हैं।",
      mr: "विद्यार्थ्यांसाठी अनेक शिष्यवृत्ती योजना उपलब्ध आहेत.",
      bn: "ছাত্রদের জন্য বিভিন্ন বৃত্তি প্রকল্প পাওয়া যায়।",
      te: "విద్యార్థుల కోసం వివిధ స్కాలర్షిప్ పథకాలు అందుబాటులో ఉన్నాయి.",
      ta: "மாணவர்களுக்காக பல உதவித்தொகை திட்டங்கள் உள்ளன.",
      en: "Several scholarship schemes are available for students."
    },

    women: {
      hi: "महिलाओं के लिए रोजगार और सुरक्षा योजनाएं उपलब्ध हैं।",
      mr: "महिलांसाठी रोजगार आणि सुरक्षा योजना उपलब्ध आहेत.",
      bn: "মহিলাদের জন্য কর্মসংস্থান এবং নিরাপত্তা প্রকল্প রয়েছে।",
      te: "మహిళల కోసం ఉపాధి మరియు భద్రతా పథకాలు ఉన్నాయి.",
      ta: "பெண்களுக்கான வேலை வாய்ப்பு மற்றும் பாதுகாப்புத் திட்டங்கள் உள்ளன.",
      en: "Schemes for women include employment and empowerment projects."
    },

    default: {
      hi: "क्षमा करें, समझ नहीं आया। कृपया दोबारा बोलें।",
      mr: "क्षमस्व, समजले नाही. कृपया पुन्हा बोला.",
      bn: "দুঃখিত, বুঝতে পারিনি। আবার বলুন।",
      te: "క్షమించండి, అర్థం కాలేదు. దయచేసి మళ్లీ చెప్పండి.",
      ta: "மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்லுங்கள்.",
      en: "Sorry, I could not understand. Please ask again."
    }
  };

  // Choose response
  if (matchedCategory) {
    answer = responses[matchedCategory][language] || responses[matchedCategory]["en"];
  } else {
    answer = responses.default[language] || responses.default["en"];
  }

  return { answer, matchedCategory, language };
}

module.exports = { analyzeQuery };
