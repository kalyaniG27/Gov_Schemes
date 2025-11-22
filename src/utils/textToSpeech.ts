export function speakText(text: string, language: string) {
  const synth = window.speechSynthesis;

  if (!synth) {
    console.error("Speech Synthesis not supported");
    return;
  }

  // Stop anything pending
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);

  const langMap: Record<string, string> = {
    en: "en-IN",
    hi: "hi-IN",
    mr: "mr-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
  };

  utter.lang = langMap[language] || "en-IN";
  utter.rate = 1;
  utter.pitch = 1;

  // Debug tracking
  console.log("🗣 Trying to speak:", text, " Language:", utter.lang);

  const speakNow = () => {
    const voices = synth.getVoices();

    console.log("🎙 Voices loaded:", voices.length);

    const selectedVoice =
      voices.find(v => v.lang === utter.lang) ||
      voices.find(v => v.lang.startsWith(utter.lang.split("-")[0])) ||
      voices[0];

    if (selectedVoice) {
      utter.voice = selectedVoice;
    }

    utter.onstart = () => console.log("🚀 Speech started");
    utter.onend = () => console.log("🏁 Speech finished");
    utter.onerror = (e) => console.error("❌ Speech error", e);

    synth.speak(utter);
  };

  // Voices not loaded yet → wait
  if (synth.getVoices().length === 0) {
    console.log("⌛ Waiting for voices to load…");
    synth.onvoiceschanged = speakNow;
  } else {
    speakNow();
  }
}
